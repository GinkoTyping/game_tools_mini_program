let db;

async function insertNpc(npc) {
  const { id, name_zh, content, dungeon_id } = npc;
  return db.run(
    `INSERT INTO wow_dynamic_npc_mark_count(id, name, content, dungeon_id) VALUES(?1, ?2, ?3, ?4)`,
    [id, name_zh, content, dungeon_id]
  );
}

async function insertSpell(spell) {
  const { id, name_zh, content, dungeon_id } = spell;
  return db.run(
    `INSERT INTO wow_dynamic_spell_mark_count(id, name, content, dungeon_id) VALUES(?1, ?2, ?3, ?4)`,
    [id, name_zh, content, dungeon_id]
  );
}

async function getNpcOrSpellCountByIds(ids, isNpc, isAll = false) {
  const tableName = isNpc
    ? 'wow_dynamic_npc_mark_count'
    : 'wow_dynamic_spell_mark_count';

  const selectSql = isAll ? '*' : 'id, count, mark_list';

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

async function getAllNpcAndSpellMarks() {
  const npcMarks = await db.all(
    `SELECT id,mark_list FROM wow_dynamic_npc_mark_count`
  );
  const spellMarks = await db.all(
    `SELECT id,mark_list FROM wow_dynamic_spell_mark_count`
  );
  return {
    npcMarks,
    spellMarks,
  };
}

async function updateNpcOrSpellMark(isNpc, isMark, userId, markId) {
  const data = await getNpcOrSpellCountByIds([markId], isNpc);
  let markList = data[0].mark_list?.split(',') ?? [];
  if (isMark) {
    const isInclude = markList.some((item) => Number(item) === Number(userId));
    if (!isInclude) {
      markList.push(userId);
    }
  } else {
    markList = markList.filter(
      (item) => item && Number(item) !== Number(userId)
    );
  }

  // 避免空数组时，返回一个空字符串
  const newMarkList = markList?.length ? markList.join(',') : null;

  const tableName = isNpc
    ? 'wow_dynamic_npc_mark_count'
    : 'wow_dynamic_spell_mark_count';
  return db.run(`UPDATE ${tableName} SET mark_list=?1, count=?2 WHERE id=?3`, [
    newMarkList,
    markList.length,
    markId,
  ]);
}

export function useNpcAndSpellMarkMapper(database) {
  if (database) {
    db = database;
    // 仅仅处理异常场景，正常使用 database都应该来源于外部
  } else {
    throw new Error('DB missing');
  }

  return {
    insertNpc,
    insertSpell,
    updateNpcOrSpellMark,
    getNpcOrSpellCountByIds,
    getAllNpcAndSpellMarks,
  };
}
