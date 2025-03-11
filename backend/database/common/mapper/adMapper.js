let db;

async function updateAdCount(date, count) {
  return db.run(`UPDATE common_ad SET count=?1 WHERE date=?2`, [count, date]);
}

async function getAdCount(date) {
  return db.get(`SELECT * FROM common_ad WHERE date = ?1`, [date]);
}

async function insertAd(date, count) {
  return db.run(`INSERT INTO common_ad(date, count) VALUES(?1, ?2)`, [
    date,
    count,
  ]);
}

export function useAdMapper(database) {
  if (database) {
    db = database;
    // 仅仅处理异常场景，正常使用 database都应该来源于外部
  } else {
    throw new Error('DB missing');
  }

  return { getAdCount, updateAdCount, insertAd };
}
