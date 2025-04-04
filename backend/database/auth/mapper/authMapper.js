import { formatDateByMinute } from '../../../util/time.js';

let db;
const TABLE_NAME = 'user';

async function addUser(params) {
  const { open_id } = params;
  return db.run(`INSERT INTO user(open_id) VALUES(?1)`, [open_id]);
}

async function getUserById(open_id) {
  return db.get(`SELECT * FROM user WHERE open_id = ?1`, [open_id]);
}

async function getUsersByIds(ids) {
  // 检查是否为非空数组
  if (!Array.isArray(ids) || ids.length === 0) {
    return [];
  }

  // 生成占位符：根据数组长度生成 ?, ?, ?
  const placeholders = ids.map(() => '?').join(', ');

  // 构建 SQL 查询
  const sql = `SELECT * FROM user WHERE id IN (${placeholders})`;

  // 执行查询（使用 db.all 获取多行结果）
  return db.all(sql, ids);
}

async function updateUserById(params) {
  const { id, nickName, avatarUrl, gender, country, province, city } = params;
  return db.run(
    `
  UPDATE ${TABLE_NAME} 
  SET 
    nick_name=COALESCE(?, nick_name), 
    avatar_url=COALESCE(?, nick_name), 
    gender=COALESCE(?, nick_name), 
    country=COALESCE(?, nick_name), 
    province=COALESCE(?, nick_name), 
    city=COALESCE(?, nick_name),
    updated_at=?
  WHERE id=? 
  `,
    [
      nickName,
      avatarUrl,
      gender,
      country,
      province,
      city,
      formatDateByMinute(),
      id,
    ]
  );
}

export function useAuthMapper(database) {
  if (database) {
    db = database;
    // 仅仅处理异常场景，正常使用 database都应该来源于外部
  } else {
    throw new Error('DB missing');
  }

  return { addUser, getUserById, updateUserById, getUsersByIds };
}
