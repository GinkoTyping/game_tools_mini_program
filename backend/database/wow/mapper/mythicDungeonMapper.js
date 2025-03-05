let db;

async function insertMythicDungeon(params) {
  const { id, routes, ratings, utilityNeeds, enemyTips, lootPool } = params;
  return db.run(
    `INSERT INTO wow_mythic_dungeon(id, routes, ratings, utility_needs, enemy_tips, loot_pool) VALUES(?1,?2,?3,?4,?5,?6)`,
    [id, routes, ratings, utilityNeeds, enemyTips, lootPool]
  );
}

async function getMythicDungeonById(id) {
  return db.get(
    `SELECT wow_mythic_dungeon.*, wow_dungeon.name_zh, wow_dungeon.name_en 
    FROM wow_mythic_dungeon
    LEFT JOIN wow_dungeon ON wow_mythic_dungeon.id = wow_dungeon.id
    WHERE wow_mythic_dungeon.id = ?1`,
    [id]
  );
}

export function useMythicDungeonMapper(database) {
  if (database) {
    db = database;
    // 仅仅处理异常场景，正常使用 database都应该来源于外部
  } else {
    throw new Error('DB missing');
  }

  return { insertMythicDungeon, getMythicDungeonById };
}
