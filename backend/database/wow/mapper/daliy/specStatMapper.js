let db;

async function insertSpecPopularity(params) {
  const { date, level_range, data } = params;
  return db.run(
    `INSERT INTO wow_daily_spec_popularity(date, level_range, data) VALUES(?1, ?2, ?3)`,
    [date, level_range, data]
  );
}
async function getSpecPopularity(params) {
  const { date, level_range } = params;
  return db.get(
    `SELECT * FROM wow_daily_spec_popularity WHERE date=?1 AND level_range=?2`,
    [date, level_range]
  );
}

async function insertSpecDpsRank(params) {
  const { week_id, data } = params;
  return db.run(`INSERT INTO wow_daily_spec_dps_rank(week_id, data) VALUES(?1, ?2)`, [
    week_id,
    data,
  ]);
}
async function getSpecDpsRank(params) {
  const { week_id } = params;
  return db.get(`SELECT * FROM wow_daily_spec_dps_rank WHERE week_id=?1`, [
    week_id,
  ]);
}
async function updateSpecDpsRank(params) {
  const { week_id, data } = params;
  return db.run(`UPDATE wow_daily_spec_dps_rank SET data=?1 WHERE week_id=?2`, [
    week_id,
    data,
  ]);
}

export function useSpecStatMapper(database) {
  if (database) {
    db = database;
    // 仅仅处理异常场景，正常使用 database都应该来源于外部
  } else {
    throw new Error('DB missing');
  }

  return {
    insertSpecPopularity,
    getSpecPopularity,
    insertSpecDpsRank,
    getSpecDpsRank,
    updateSpecDpsRank,
  };
}
