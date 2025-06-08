let db;

const TABLE_NAME = 'wow_spell';
const TABLE_NAME_WOTLK = 'wow_wotlk_spell';

function getTableName(version) {
  return version === 'wotlk' ? TABLE_NAME_WOTLK : TABLE_NAME;
}

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
    image = '',
    version,
  } = param;
  const tableName = getTableName(version);
  await db.run(
    `
        INSERT INTO ${tableName}(id, id_wow_db, name_en, name_zh, range, cost, cast_time, cooldown, description, image)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)
    `,
    [id, idWowDB, nameEN, nameZH, range, cost, castTime, cooldown, description, image],
  );
}

async function getSpellById(id, version) {
  const tableName = version === 'wotlk' ? TABLE_NAME_WOTLK : TABLE_NAME;
  return await db.get(`SELECT *
                       FROM ${tableName}
                       WHERE id = ?1`, [id]);
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
    image,
    version,
  } = param;
  const tableName = getTableName(version);
  return db.run(
    `UPDATE ${tableName}
     SET name_en     = COALESCE(?, name_en),
         name_zh     = COALESCE(?, name_zh),
         range       = COALESCE(?, range),
         cost        = COALESCE(?, cost),
         cast_time   = COALESCE(?, cast_time),
         cooldown    = COALESCE(?, cooldown),
         description = COALESCE(?, description),
         id_wow_db   = COALESCE(?, id_wow_db),
         image       = COALESCE(?, image)
     WHERE id = ?
    `,
    [nameEN, nameZH, range, cost, castTime, cooldown, description, idWowDB, image, id],
  );
}

async function getBlankSpell(version = '') {
  const tableName = getTableName(version);
  return db.all(
    `SELECT id, id_wow_db, name_en
     FROM ${tableName}
     WHERE description == ''
    `);
}

async function getAllSpell() {
  return db.all(`SELECT *
                 FROM wow_spell`);
}

export function useSpellMapper(database) {
  if (database) {
    db = database;
    // 仅仅处理异常场景，正常使用 database都应该来源于外部
  } else {
    throw new Error('DB missing');
  }

  return {
    insertSpell,
    getSpellById,
    updateSpellById,
    getBlankSpell,
    getAllSpell,
  };
}
