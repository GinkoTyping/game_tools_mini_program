let db;

async function insertDungeon(id, nameZH, nameEN) {
  return db.run(
    `INSERT INTO wow_dungeon(id, name_zh, name_en) VALUES(?1, ?2, ?3)`,
    [id, nameZH, nameEN]
  );
}

async function getDungeonByCondition(params) {
  const { name_zh, name_en } = params;
  return db.get(
    `
    SELECT * FROM wow_dungeon WHERE name_zh LIKE ?1 OR name_en LIKE ?2
  `,
    [name_zh, name_en]
  );
}

export function useDungeonMapper(database) {
  if (database) {
    db = database;
    // 仅仅处理异常场景，正常使用 database都应该来源于外部
  } else {
    throw new Error('DB missing');
  }

  return {
    insertDungeon,
    getDungeonByCondition,
  };
}
