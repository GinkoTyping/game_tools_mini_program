let db;
const TABLE_NAME = 'wow_bis';

async function getBisByClassAndSpec(roleClass, classSpec) {
  return db.get(`SELECT * FROM wow_bis WHERE role_class=?1 AND class_spec=?2`, [
    roleClass,
    classSpec,
  ]);
}

async function updateBisByClassAndSpec(data) {
  const {
    roleClass,
    classSpec,
    stats,
    ratings,
    bisItems,
    bisTrinkets,
    sort,
    specSort,
    accessCount,
    updatedAt = null,
    collectedAt = null,
    talents,
    detailedStats,
  } = data;
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
    END,
    sort = CASE
      WHEN ?5 IS NOT NULL THEN ?5
      ELSE sort
    END,
    spec_sort = CASE
      WHEN ?6 IS NOT NULL THEN ?6
      ELSE spec_sort
    END,
    access_count = CASE
      WHEN ?7 IS NOT NULL THEN ?7
      ELSE access_count
    END,
    updated_at = CASE
      WHEN ?8 IS NOT NULL THEN ?8
      ELSE updated_at
    END,
    collected_at = CASE
      WHEN ?9 IS NOT NULL THEN ?9
      ELSE collected_at
    END,
    talents = CASE
      WHEN ?10 IS NOT NULL THEN ?10
      ELSE talents
    END,
    detailed_stats_priority = CASE
      WHEN ?11 IS NOT NULL THEN ?11
      ELSE detailed_stats_priority
    END
    WHERE role_class = ?12 AND class_spec= ?13`,
    [
      JSON.stringify(stats),
      JSON.stringify(ratings),
      JSON.stringify(bisItems),
      JSON.stringify(bisTrinkets),
      sort,
      specSort,
      accessCount,
      updatedAt,
      collectedAt,
      JSON.stringify(talents),
      JSON.stringify(detailedStats),
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
    talents,
    updatedAt,
    collectedAt,
  } = data;
  return db.run(
    `
    INSERT INTO wow_bis(role_class, class_spec, stats_priority, ratings, bis_items, bis_trinkets, talents, collected_at, updated_at) VALUES(?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
  `,
    [
      roleClass,
      classSpec,
      JSON.stringify(stats),
      JSON.stringify(ratings),
      JSON.stringify(bisItems),
      JSON.stringify(bisTrinkets),
      JSON.stringify(talents),
      updatedAt,
      collectedAt,
    ]
  );
}

async function getAllBis() {
  return db.all(`
    SELECT role_class, class_spec, access_count FROM wow_bis
  `);
}

async function getAllBisDateInfo() {
  return db.all(`SELECT role_class, class_spec, updated_at FROM ${TABLE_NAME}`);
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
    getAllBis,
    getAllBisDateInfo,
    updateBisByClassAndSpec,
    insertBis,
  };
}
