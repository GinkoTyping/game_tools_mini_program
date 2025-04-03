import { formatDateByMinute } from '../../../../util/time.js';

let db;
const TABLE_NAME = 'wow_dynamic_user_tag_relations';

// 状态枚举（保持与表约束一致）
const RELATION_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected'
};

// 通用字段映射（保持与表结构同步）
function mapRelationFields(params) {
  return {
    applicant_user_id: params.applicantUserId,
    target_user_id: params.targetUserId,
    tag_id: params.tagId,
    status: params.status || RELATION_STATUS.PENDING,
    reject_reason: params.rejectReason || null,
    is_auto_approved: params.isAutoApproved ? 1 : 0,
    created_at: params.createdAt || formatDateByMinute(),
    updated_at: formatDateByMinute()
  };
}

// 核心CRUD操作
async function insertRelation(params) {
  const fields = mapRelationFields(params);
  const sql = `
    INSERT INTO ${TABLE_NAME} (
      applicant_user_id, target_user_id, tag_id, 
      status, reject_reason, is_auto_approved, 
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  return db.run(sql, [
    fields.applicant_user_id,
    fields.target_user_id,
    fields.tag_id,
    fields.status,
    fields.reject_reason,
    fields.is_auto_approved,
    fields.created_at,
    fields.updated_at
  ]);
}

async function updateRelationStatus(params) {
  const { relationId, status, rejectReason } = params;
  
  // 状态校验
  if (status === RELATION_STATUS.REJECTED && !rejectReason) {
    throw new Error('Reject reason is required');
  }

  const sql = `
    UPDATE ${TABLE_NAME} 
    SET status = ?, 
        reject_reason = ?, 
        updated_at = ?
    WHERE id = ?
  `;

  return db.run(sql, [
    status,
    rejectReason || null,
    formatDateByMinute(),
    relationId
  ]);
}

// 查询方法
async function getRelationsByApplicant(applicantUserId, status) {
  const sql = `
    SELECT * 
    FROM ${TABLE_NAME}
    WHERE applicant_user_id = ?
    ${status ? 'AND status = ?' : ''}
    ORDER BY created_at DESC
  `;
  
  const params = [applicantUserId];
  if (status) params.push(status);

  const data = await db.all(sql, params);
  return data.map(normalizeRelation);
}

async function getRelationsByTargetUser(targetUserId, status) {
  const sql = `
    SELECT *
    FROM ${TABLE_NAME}
    WHERE target_user_id = ?
    ${status ? 'AND status = ?' : ''}
    ORDER BY created_at DESC
  `;

  const params = [targetUserId];
  if (status) params.push(status);

  const data = await db.all(sql, params);
  return data.map(normalizeRelation);
}

async function getRelationById(relationId) {
  const data = await db.get(
    `SELECT * FROM ${TABLE_NAME} WHERE id = ?`,
    [relationId]
  );
  return data ? normalizeRelation(data) : null;
}

// 分页查询（基于游标）
async function getRelationsByFilter(params) {
  const { 
    applicantUserId, 
    targetUserId,
    status, 
    pageSize = 10, 
    lastId = 0 
  } = params;

  const whereClause = [];
  const queryParams = [];

  if (applicantUserId) {
    whereClause.push('applicant_user_id = ?');
    queryParams.push(applicantUserId);
  }
  if (targetUserId) {
    whereClause.push('target_user_id = ?');
    queryParams.push(targetUserId);
  }
  if (status) {
    whereClause.push('status = ?');
    queryParams.push(status);
  }
  whereClause.push('id > ?');
  queryParams.push(lastId);

  const sql = `
    SELECT *
    FROM ${TABLE_NAME}
    WHERE ${whereClause.join(' AND ')}
    ORDER BY id ASC
    LIMIT ?
  `;
  queryParams.push(pageSize);

  const data = await db.all(sql, queryParams);
  return data.map(normalizeRelation);
}

// 统计方法
async function getRelationCount(params) {
  const { applicantUserId, targetUserId, status } = params;
  
  const whereClause = [];
  const queryParams = [];

  if (applicantUserId) {
    whereClause.push('applicant_user_id = ?');
    queryParams.push(applicantUserId);
  }
  if (targetUserId) {
    whereClause.push('target_user_id = ?');
    queryParams.push(targetUserId);
  }
  if (status) {
    whereClause.push('status = ?');
    queryParams.push(status);
  }

  const sql = `
    SELECT COUNT(*) as total 
    FROM ${TABLE_NAME}
    ${whereClause.length ? 'WHERE ' + whereClause.join(' AND ') : ''}
  `;

  const result = await db.get(sql, queryParams);
  return result.total || 0;
}

// 数据格式化
function normalizeRelation(record) {
  return {
    id: record.id,
    applicantUserId: record.applicant_user_id,
    targetUserId: record.target_user_id,
    tagId: record.tag_id,
    status: record.status,
    rejectReason: record.reject_reason,
    isAutoApproved: Boolean(record.is_auto_approved),
    createdAt: record.created_at,
    updatedAt: record.updated_at
  };
}

export function useUserTagRelationMapper(database) {
  if (!database) throw new Error('DB instance required');
  db = database;

  return {
    RELATION_STATUS,
    
    insertRelation,
    updateRelationStatus,
    getRelationById,
    getRelationsByApplicant,
    getRelationsByTargetUser,
    getRelationsByFilter,
    getRelationCount
  };
}