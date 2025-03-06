let db;

async function getMythicDunegonById(id) {
  return db.get(`SELECT * FROM wow_dynamic_mythic_dungeon_count WHERE id=?1`, [
    id,
  ]);
}

async function addMythicDungeonCountById(id) {
  const dungeonCountItem = await getMythicDunegonById(id);
  if (dungeonCountItem) {
    await db.run(
      `UPDATE wow_dynamic_mythic_dungeon_count SET count=?1 WHERE id=?2`,
      [dungeonCountItem.count + 1, id]
    );
  }
}

async function getMythicDungeonCountList() {
  return db.all(`SELECT * FROM wow_dynamic_mythic_dungeon_count`);
}

export function useMythicDungeonCountMapper(database) {
  if (database) {
    db = database;
    // 仅仅处理异常场景，正常使用 database都应该来源于外部
  } else {
    throw new Error('DB missing');
  }

  return {
    getMythicDungeonCountList,
    addMythicDungeonCountById,
  };
}
