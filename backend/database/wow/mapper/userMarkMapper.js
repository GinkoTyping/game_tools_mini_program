let db;

async function getUserMarkById(isNpc, userId) {
  const selectSql = isNpc ? 'npc_mark' : 'spell_mark';
  const data = await db.get(
    `SELECT ${selectSql} FROM wow_dynamic_user_mark WHERE id = ?1`,
    [userId]
  );
  if (data) {
    return data.markList?.split(',') ?? [];
  }
  return null;
}

async function updateUserMark(isNpc, isMark, userId, markId) {
  const markList = await getUserMarkById(isNpc, userId);
  if (markList) {
    if (isMark) {
      markList.push(markId);
    } else {
      markList = markList.filter((item) => Number(item) !== Number(markId));
    }

    return db.run(
      `UPDATE wow_dynamic_user_mark SET mark_list = ?1 WHERE id = ?2`,
      [markList.join(','), userId]
    );
  }
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
