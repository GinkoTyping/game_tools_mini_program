let db;

async function getAccessCountByDate(date) {
  return db.get(
    `
    SELECT * FROM access_count WHERE time = ?1
  `,
    [date]
  );
}

async function updateAccessCountByDate(date, value) {
  return db.run(`UPDATE access_count SET visit_count = ?1 WHERE time = ?2`, [
    value,
    date,
  ]);
}

async function insertAccessCount(date, value) {
  return db.run(`INSERT INTO access_count(time, visit_count) VALUES(?1, ?2)`, [
    date,
    value,
  ]);
}

export function useInfoMapper(database) {
  if (database) {
    db = database;
    // 仅仅处理异常场景，正常使用 database都应该来源于外部
  } else {
    throw new Error('DB missing');
  }

  return {
    insertAccessCount,
    getAccessCountByDate,
    updateAccessCountByDate,
  };
}
