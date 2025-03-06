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

async function getMythicDunegonList() {
  return db.all(
    `SELECT 
      wow_mythic_dungeon.ratings, wow_mythic_dungeon.id, wow_dungeon.name_zh, wow_mythic_dungeon_tier.tier
    FROM 
      wow_mythic_dungeon
    LEFT JOIN 
      wow_dungeon ON wow_mythic_dungeon.id = wow_dungeon.id
    LEFT JOIN
      wow_mythic_dungeon_tier on wow_mythic_dungeon.id = wow_mythic_dungeon_tier.id`
  );
}

function updateMythicDungeonById(params) {
  const { id, routes, ratings, utilityNeeds, enemyTips, lootPool } = params;
  return db.run(
    `UPDATE wow_mythic_dungeon
    SET routes=?1,
      ratings=?2,
      utility_needs=?3,
      enemy_tips=?4,
      loot_pool=?5
    WHERE id=?6
    `,
    [routes, ratings, utilityNeeds, enemyTips, lootPool, id]
  );
}

export function useMythicDungeonMapper(database) {
  if (database) {
    db = database;
    // 仅仅处理异常场景，正常使用 database都应该来源于外部
  } else {
    throw new Error('DB missing');
  }

  return {
    insertMythicDungeon,
    getMythicDungeonById,
    getMythicDunegonList,
    updateMythicDungeonById,
  };
}
