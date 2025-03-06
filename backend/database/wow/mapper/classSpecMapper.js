let db;

async function insertClass(params) {
  const { id, name_zh, name_en } = params;
  await db.run(
    `INSERT INTO wow_playable_class(id, name_zh, name_en) VALUES(?1, ?2, ?3)`,
    [id, name_zh, name_en]
  );
}

async function insertSpec(params) {
  const { id, name_zh, name_en } = params;
  await db.run(
    `INSERT INTO wow_playable_spec(id, name_zh, name_en) VALUES(?1, ?2, ?3)`,
    [id, name_zh, name_en]
  );
}

async function getSpecById(id) {
  return db.get(`SELECT * FROM wow_playable_spec WHERE id = ?1`, [id]);
}

export function useClassSpecMapper(database) {
  if (database) {
    db = database;
    // 仅仅处理异常场景，正常使用 database都应该来源于外部
  } else {
    throw new Error('DB missing');
  }

  return {
    insertClass,
    insertSpec,
    getSpecById,
  };
}
