import { formatDateByMinute } from '../../../../util/time.js';

let db;
const TABLE_NAME = 'poe_dynamic_ascendancy_ladders';

export async function addByType(rankType, rankData) {
  if (rankType && rankData) {
    return db.run(
      `
      INSERT OR REPLACE INTO ${TABLE_NAME}(type, rank_data, updated_at) VALUES(?,?,?)`,
      [rankType, JSON.stringify(rankData), formatDateByMinute()]
    );
  }
}

export async function getByType(rankType) {
  return db.get(`SELECT * FROM ${TABLE_NAME} WHERE type = ?`, [rankType]);
}

export function useAscendancyLadderMapper(database) {
  if (database) {
    db = database;
    // 仅仅处理异常场景，正常使用 database都应该来源于外部
  } else {
    throw new Error('DB missing');
  }

  return {
    addByType,
    getByType,
  };
}
