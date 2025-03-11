let db;

async function addUser(params) {
  const { open_id } = params;
  return db.run(`INSERT INTO user(open_id) VALUES(?1)`, [open_id]);
}

async function getUserById(open_id) {
  return db.get(`SELECT * FROM user WHERE open_id = ?1`, [open_id]);
}

export function useAuthMapper(database) {
  if (database) {
    db = database;
    // 仅仅处理异常场景，正常使用 database都应该来源于外部
  } else {
    throw new Error('DB missing');
  }

  return { addUser, getUserById };
}
