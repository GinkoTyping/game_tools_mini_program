let db;

function addDailyMythicScore(params) {
  const { page, time, data } = params;
  return db.run(
    `INSERT INTO wow_daily_mythic_score_rank (page, time, data)
     VALUES (?, ?, ?) `, [page, time, JSON.stringify(data)],
  );
}

async function getDailyMythicScore(params) {
  const { page, time } = params;
  const row = await db.get(
    `SELECT *
     FROM wow_daily_mythic_score_rank
     WHERE page = ?
       AND time = ?`, [page, time],
  );
  if (row) {
    return {
      ...row,
      data: JSON.parse(row.data),
    };
  }
  return null;
}

export function useMythicScoreMapper(database) {
  if (database) {
    db = database;
    // 仅仅处理异常场景，正常使用 database都应该来源于外部
  } else {
    throw new Error('DB missing');
  }

  return {
    addDailyMythicScore,
    getDailyMythicScore,
  };
}