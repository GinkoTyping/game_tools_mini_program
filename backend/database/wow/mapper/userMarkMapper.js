let db;

async function addUser(id) {
  return db.run(`INSERT INTO wow_dynamic_user_mark(id) VALUES(?1)`, [id]);
}

async function getUserMarkById(userId) {
  const data = await db.get(
    `SELECT * FROM wow_dynamic_user_mark WHERE id = ?1`,
    [userId]
  );
  if (data) {
    return {
      ...data,
      npc_mark_list: data.npc_mark_list?.split(',') ?? [],
      spell_mark_list: data.spell_mark_list?.split(',') ?? [],
    };
  }
  return null;
}

async function updateUserMark(isNpc, isMark, userId, markId) {
  const column = isNpc ? 'npc_mark_list' : 'spell_mark_list';
  const data = await getUserMarkById(userId);
  let markList = data[column];
  if (!markList) {
    await addUser(userId);
    markList = [];
  }

  if (isMark) {
    markList.push(markId);
  } else {
    markList = markList.filter(
      (item) => item && Number(item) !== Number(markId)
    );
  }

  // 避免空数组时，返回一个空字符串
  const newMarkList = markList?.length ? markList.join(',') : null;

  return db.run(
    `UPDATE wow_dynamic_user_mark SET ${column} = ?1 WHERE id = ?2`,
    [newMarkList, userId]
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
