let db;
const TABLE_NAME = 'wow_wotlk_bis';

function objToString(obj) {
  return typeof obj === 'string' ? obj : JSON.stringify(obj);
}

async function addBis(params) {
  const {
    role_class,
    class_spec,
    type,
    talent,
  } = params;
  return db.run(`INSERT
                     OR
                 REPLACE
                 INTO ${TABLE_NAME}
                 (role_class,
                  class_spec,
                  type,
                  talent)
                 VALUES (?, ?, ?, ?)`, [
    role_class,
    class_spec,
    type,
    objToString(talent),
  ]);
}

export function useWotlkBisMapper(database) {
  if (database) {
    db = database;
    // 仅仅处理异常场景，正常使用 database都应该来源于外部
  } else {
    throw new Error('DB missing');
  }

  return { addBis };
}