let db;

async function insertNpc(params) {
  const { id, name_zh, name_en, location, type } = params;
  return db.run(
    `INSERT INTO wow_npc(id, name_zh, name_en, location, type) VALUES(?1, ?2, ?3, ?4, ?5)`,
    [id, name_zh, name_en, location, type]
  );
}

async function getNpcById(id) {
  return db.get(`SELECT * FROM wow_npc WHERE id=?1`, [id]);
}

async function updateNpc(params) {
  const { id, name_zh, name_en, location, type } = params;
  return db.run(
    `UPDATE wow_npc
    SET name_zh = CASE
      WHEN ?1 IS NOT NULL THEN ?1
      ELSE name_zh
    END,
    name_en = CASE
      WHEN ?2 IS NOT NULL THEN ?2
      ELSE name_en
    END,
    location = CASE
      WHEN ?3 IS NOT NULL THEN ?3
      ELSE location
    END,
    type = CASE
      WHEN ?4 IS NOT NULL THEN ?4
      ELSE type
    END
    WHERE id=?5
  `,
    [name_zh, name_en, location, type, id]
  );
}

async function getNpcWithNoNameZh() {
  return db.all(`SELECT * FROM wow_npc WHERE name_zh IS NULL`);
}

async function getNpcByNameEn(nameEn) {
  return db.get(`SELECT * FROM wow_npc WHERE name_en COLLATE NOCASE =?1`, [
    nameEn,
  ]);
}

async function getAllNpc() {
  return db.all(`SELECT * FROM wow_npc`);
}

export function useNpcMapper(database) {
  if (database) {
    db = database;
    // 仅仅处理异常场景，正常使用 database都应该来源于外部
  } else {
    throw new Error('DB missing');
  }

  return {
    insertNpc,
    getNpcById,
    updateNpc,
    getAllNpc,
    getNpcByNameEn,
    getNpcWithNoNameZh,
  };
}
