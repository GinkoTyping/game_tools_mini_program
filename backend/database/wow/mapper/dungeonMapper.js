let db;

async function insertDungeon(id, nameZH, nameEN) {
  return db.run(
    `INSERT INTO wow_dungeon(id, name_zh, name_en) VALUES(?1, ?2, ?3)`,
    [id, nameZH, nameEN]
  );
}

async function getDungeonByName(params) {
  const { name_zh, name_en } = params;
  if (name_zh?.length) {
    return db.get(
      `
      SELECT * FROM wow_dungeon WHERE name_zh COLLATE NOCASE LIKE '%' || ?1 || '%'`,
      [name_zh]
    );
  } else if (name_en?.length) {
    return db.get(
      `
      SELECT * FROM wow_dungeon WHERE name_en COLLATE NOCASE LIKE '%' || ?1 || '%'`,
      [name_en]
    );
  }
  return null;
}

async function getDungeonsById(params) {
  let ids = [];
  if (typeof params === 'object') {
    ids = params;
  } else {
    ids = [params];
  }

  const sql = ids.reduce((pre, cur, index) => {
    if (index === 0) {
      pre += `id=?${index + 1} `;
    } else {
      pre += `OR id=?${index + 1} `;
    }
    return pre;
  }, 'SELECT * FROM wow_dungeon WHERE ');
  const data = await db.all(sql, ids);
  return data.map((item) => {
    return {
      ...item,
      bosses: JSON.parse(item.bosses).map((boss) => ({
        ...boss,
        key: undefined,
        name: { zh_CN: boss.name.zh_CN },
      })),
    };
  });
}

async function getDungeonList() {
  return db.all(`SELECT id, journal_id, name_zh, name_en FROM wow_dungeon`);
}

async function updateDungeonById(params) {
  const { bosses, journalId, id } = params;
  return db.run(`UPDATE wow_dungeon SET bosses=?1, journal_id=?2 WHERE id=?3`, [
    bosses,
    journalId,
    id,
  ]);
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
    getDungeonList,
    getDungeonsById,
    getDungeonByName,
    updateDungeonById,
  };
}
