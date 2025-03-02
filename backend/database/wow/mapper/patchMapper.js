let db;

function getPactchList() {
  return db.all(`SELECT * FROM common_patch`);
}

export function usePatchMapper(database) {
  if (database) {
    db = database;
    // 仅仅处理异常场景，正常使用 database都应该来源于外部
  } else {
    throw new Error('DB missing');
  }

  return { getPactchList };
}
