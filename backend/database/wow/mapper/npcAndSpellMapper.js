let db;

async function insertNpc(npc) {
  const { id, name_zh, content } = npc;
  return db.run(
    `INSERT INTO wow_dynamic_npc_mark_count(id, name, content) VALUES(?1, ?2, ?3)`,
    [id, name_zh, content]
  );
}

async function insertSpell(spell) {
  const { id, name_zh, content } = spell;
  return db.run(
    `INSERT INTO wow_dynamic_spell_mark_count(id, name, content) VALUES(?1, ?2, ?3)`,
    [id, name_zh, content]
  );
}

async function getNpcOrSpellCountByIds(ids, isNpc, isAll = false) {
  const tableName = isNpc
    ? 'wow_dynamic_npc_mark_count'
    : 'wow_dynamic_spell_mark_count';

  const selectSql = isAll ? '*' : 'id, count';

  const sql = ids.reduce((pre, cur, index) => {
    if (index === 0) {
      pre += `id=?${index + 1} `;
    } else {
      pre += `OR id=?${index + 1} `;
    }
    return pre;
  }, `SELECT ${selectSql} FROM ${tableName} WHERE `);

  return db.all(sql, ids);
}

export function useNpcAndSpellMapper(database) {
  if (database) {
    db = database;
    // 仅仅处理异常场景，正常使用 database都应该来源于外部
  } else {
    throw new Error('DB missing');
  }

  return {
    insertNpc,
    insertSpell,
    getNpcOrSpellCountByIds,
  };
}
