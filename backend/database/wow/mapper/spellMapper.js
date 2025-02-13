let db;

async function insertSpell(param) {
  const {
    id,
    idWowDB = -1,
    nameEN = '',
    nameZH = '',
    range = -1,
    cost = '',
    castTime = -1,
    cooldown = -1,
    description = '',
  } = param;
  await db.run(
    `
    INSERT INTO wow_spell(id, id_wow_db, name_en, name_zh, range, cost, cast_time, cooldown, description) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
  `,
    [id, idWowDB, nameEN, nameZH, range, cost, castTime, cooldown, description]
  );
}

async function getSpellById(id) {
  return await db.get(`SELECT * FROM wow_spell WHERE id=?1`, [id]);
}

async function updateSpellById(param) {
  const {
    id,
    idWowDB,
    nameEN,
    nameZH,
    range,
    cost,
    castTime,
    cooldown,
    description,
  } = param;
  return db.run(
    `
    UPDATE wow_spell
    SET name_en = CASE
      WHEN ?1 IS NOT NULL THEN ?1
      ELSE name_en
    END,
    name_zh = CASE
      WHEN ?2 IS NOT NULL THEN ?2
      ELSE name_zh
    END,
    range = CASE
      WHEN ?3 IS NOT NULL THEN ?3
      ELSE range
    END,
    cost = CASE
      WHEN ?4 IS NOT NULL THEN ?4
      ELSE cost
    END,
    cast_time = CASE
      WHEN ?5 IS NOT NULL THEN ?5
      ELSE cast_time
    END,
    cooldown = CASE
      WHEN ?6 IS NOT NULL THEN ?6
      ELSE cooldown
    END,
    description = CASE
      WHEN ?7 IS NOT NULL THEN ?7
      ELSE description
    END,
      id_wow_db = CASE
      WHEN ?8 IS NOT NULL THEN ?8
      ELSE id_wow_db
    END
    WHERE id = ?9
  `,
    [nameEN, nameZH, range, cost, castTime, cooldown, description, idWowDB, id]
  );
}

export function useSpellMapper(database) {
  if (database) {
    db = database;
    // 仅仅处理异常场景，正常使用 database都应该来源于外部
  } else {
    throw new Error('DB missing');
  }

  return { insertSpell, getSpellById, updateSpellById };
}
