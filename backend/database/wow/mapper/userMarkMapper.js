let db;

async function addUser(id) {
  return db.run(`INSERT INTO wow_dynamic_user_mark(id) VALUES(?1)`, [id]);
}

async function getUserMarkById(isNpc, userId) {
  const column = isNpc ? 'npc_mark_list' : 'spell_mark_list';
  const data = await db.get(
    `SELECT ${column} FROM wow_dynamic_user_mark WHERE id = ?1`,
    [userId]
  );
  if (data) {
    return data[column]?.split(',') ?? [];
  }
  return null;
}

async function updateUserMark(isNpc, isMark, userId, markId) {
  let markList = await getUserMarkById(isNpc, userId);
  if (!markList) {
    await addUser(userId);
    markList = [];
  }

  if (isMark) {
    markList.push(markId);
  } else {
    markList = markList.filter((item) => Number(item) !== Number(markId));
  }
  const column = isNpc ? 'npc_mark_list' : 'spell_mark_list';
  return db.run(
    `UPDATE wow_dynamic_user_mark SET ${column} = ?1 WHERE id = ?2`,
    [markList.join(','), userId]
  );
}

export function useUserMarkMapper(database) {
  if (database) {
    db = database;
    // 仅仅处理异常场景，正常使用 database都应该来源于外部
  } else {
    throw new Error('DB missing');
  }

  return { getUserMarkById, updateUserMark };
}
