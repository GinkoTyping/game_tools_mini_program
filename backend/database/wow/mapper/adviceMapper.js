let db;

function getAdviceList() {
  return db.all(`SELECT * FROM common_advice ORDER BY completed_at DESC;`);
}

export function useAdviceMapper(database) {
  if (database) {
    db = database;
    // 仅仅处理异常场景，正常使用 database都应该来源于外部
  } else {
    throw new Error('DB missing');
  }

  return { getAdviceList };
}
