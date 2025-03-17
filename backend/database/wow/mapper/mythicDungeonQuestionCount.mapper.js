let db;
const TABLE_NAME = 'wow_dynamic_mythic_dungeon_question_count';

async function getbyId(id) {
  return db.get(`SELECT * FROM ${TABLE_NAME} WHERE id=?1`, [id]);
}

async function addById(id) {
  const dungeonCountItem = await getbyId(id);
  if (dungeonCountItem) {
    await db.run(`UPDATE ${TABLE_NAME} SET count=?1 WHERE id=?2`, [
      dungeonCountItem.count + 1,
      id,
    ]);
  }
}

async function getList() {
  return db.all(`SELECT * FROM ${TABLE_NAME}`);
}

export function useMythicDungeonQuestionCountMapper(database) {
  if (database) {
    db = database;
    // 仅仅处理异常场景，正常使用 database都应该来源于外部
  } else {
    throw new Error('DB missing');
  }

  return {
    getList,
    addById,
  };
}
