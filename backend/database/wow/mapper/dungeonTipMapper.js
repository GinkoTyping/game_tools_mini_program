let db;

export async function getDungeonTipByCondition(
  roleClass,
  classSpec,
  dungeonId
) {
  return db.get(
    `
    SELECT * FROM wow_dungeon_tip WHERE role_class = ?1 AND class_spec = ?2 AND dungeon_id = ?3
  `,
    [roleClass, classSpec, dungeonId]
  );
}

export async function insertDungeonTip(data) {
  const { roleClass, classSpec, dungeonId, tips = '', tips_en = '' } = data;
  return db.run(
    `
    INSERT INTO wow_dungeon_tip(role_class, class_spec, dungeon_id, tips, tips_en)
    VALUES(?1, ?2, ?3, ?4, ?5)
  `,
    [roleClass, classSpec, dungeonId, tips, tips_en]
  );
}

export async function updateDungeonTip(data) {
  const { roleClass, classSpec, dungeonId, tips = '', tips_en = '' } = data;
  return db.run(
    `
    UPDATE wow_dungeon_tip SET tips = ?1, tips_en = ?2 WHERE role_class = ?3 AND class_spec = ?4 AND dungeon_id = ?5
  `,
    [tips, tips_en, roleClass, classSpec, dungeonId]
  );
}

export async function getAllDungeonTips() {
  return db.all(`SELECT * FROM wow_dungeon_tip`);
}

export function useDungeonTipMapper(database) {
  if (database) {
    db = database;
    // 仅仅处理异常场景，正常使用 database都应该来源于外部
  } else {
    throw new Error('DB missing');
  }

  return {
    getDungeonTipByCondition,
    updateDungeonTip,
    insertDungeonTip,
    getAllDungeonTips,
  };
}
