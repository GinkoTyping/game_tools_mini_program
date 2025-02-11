let db;

async function getBisByClassAndSpec(roleClass, classSpec) {
  return db.get(
    `SELECT id FROM wow_bis WHERE role_class=?1 AND class_spec=?2`,
    [roleClass, classSpec]
  );
}

async function updateBisByClassAndSpec(data) {
  const { roleClass, classSpec, stats, ratings, bisItems, bisTrinkets } = data;
  return db.run(
    `
    UPDATE wow_bis
    SET stats_priority = CASE
      WHEN ?1 IS NOT NULL THEN ?1
      ELSE stats_priority
    END,
    ratings = CASE
      WHEN ?2 IS NOT NULL THEN ?2
      ELSE ratings
    END,
    bis_items = CASE
      WHEN ?3 IS NOT NULL THEN ?3
      ELSE bis_items
    END,
    bis_trinkets = CASE
      WHEN ?4 IS NOT NULL THEN ?4
      ELSE bis_trinkets
    END
    WHERE role_class = ?5 AND class_spec= ?6`,
    [
      JSON.stringify(stats),
      JSON.stringify(ratings),
      JSON.stringify(bisItems),
      JSON.stringify(bisTrinkets),
      roleClass,
      classSpec,
    ]
  );
}

async function insertBis(data) {
  const {
    roleClass,
    classSpec,
    stats = [],
    ratings = [],
    bisItems = [],
    bisTrinkets = [],
  } = data;
  return db.run(
    `
    INSERT INTO wow_bis(role_class, class_spec, stats_priority, ratings, bis_items, bis_trinkets) VALUES(?1, ?2, ?3, ?4, ?5, ?6)
  `,
    [
      roleClass,
      classSpec,
      JSON.stringify(stats),
      JSON.stringify(ratings),
      JSON.stringify(bisItems),
      JSON.stringify(bisTrinkets),
    ]
  );
}

export function useBisMapper(database) {
  if (database) {
    db = database;
    // 仅仅处理异常场景，正常使用 database都应该来源于外部
  } else {
    throw new Error('DB missing');
  }

  return {
    getBisByClassAndSpec,
    updateBisByClassAndSpec,
    insertBis,
  };
}
