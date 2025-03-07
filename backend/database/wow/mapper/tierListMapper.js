let db;

async function insertTierList(params) {
  const { versionId, activityType, role, tierData, createdAt } = params;
  await db.run(
    `
    INSERT INTO wow_tier_list(version_id, activity_type, role, tier_data, created_at) VALUES (?1, ?2, ?3, ?4, ?5)
  `,
    [versionId, activityType, role, tierData, createdAt]
  );
}

async function updateTierList(params) {
  const { versionId, activityType, role, tierData, createdAt } = params;
  return db.run(
    `
    UPDATE 
      wow_tier_list
    SET 
      tier_data = ?1
    WHERE 
      version_id = ?2
    AND
      activity_type = ?3
    AND
      role = ?4    
    AND
      created_at = ?5
      `,
    [tierData, versionId, activityType, role, createdAt]
  );
}

function getTierListByVersion(params) {
  const { versionId, role, activityType } = params;
  return db.all(
    `SELECT 
      *
    FROM 
      wow_tier_list
    WHERE 
      version_id = ?1 AND role = ?2 AND activity_type = ?3
    ORDER BY
      created_at DESC
    `,
    [versionId, role, activityType]
  );
}

function getAllTierList() {
  return db.all(`SELECT version_id, activity_type, role FROM wow_tier_list`);
}

export function useTierListMapper(database) {
  if (database) {
    db = database;
    // 仅仅处理异常场景，正常使用 database都应该来源于外部
  } else {
    throw new Error('DB missing');
  }

  return {
    insertTierList,
    getTierListByVersion,
    getAllTierList,
    updateTierList,
  };
}
