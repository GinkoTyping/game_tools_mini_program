let db;
const TABLE_NAME = 'wow_basic_stats';

function getStats(classSpec, roleClass) {
  return db.get(`SELECT *
                 FROM ${TABLE_NAME}
                 WHERE classSpec = ?
                   AND roleClass = ?`, [classSpec, roleClass]);
}

export function useBasicStatsMapper(database) {
  if (database) {
    db = database;
    // 仅仅处理异常场景，正常使用 database都应该来源于外部
  } else {
    throw new Error('DB missing');
  }

  return { getStats };
}