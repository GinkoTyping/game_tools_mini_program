import { formatDate } from '../../../util/time.js';

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
    enhancement,
    maxrollBis,
  } = data;
  return db.run(
    `
    UPDATE wow_bis
  SET
    stats_priority = COALESCE(?, stats_priority),
    ratings = COALESCE(?, ratings),
    bis_items = COALESCE(?, bis_items),
    bis_trinkets = COALESCE(?, bis_trinkets),
    sort = COALESCE(?, sort),
    spec_sort = COALESCE(?, spec_sort),
    access_count = COALESCE(?, access_count),
    updated_at = COALESCE(?, updated_at),
    collected_at = COALESCE(?, collected_at),
    talents = COALESCE(?, talents),
    detailed_stats_priority = COALESCE(?, detailed_stats_priority),
    enhancement = COALESCE(?, enhancement),
    maxroll_bis = COALESCE(?, maxroll_bis)
  WHERE
    role_class = ? AND class_spec = ?`,
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
      JSON.stringify(enhancement),
      JSON.stringify(maxrollBis),
      roleClass,
      classSpec,
    ]
  );
}

async function updateOverviewBis(roleClass, classSpec, data) {
  const existed = await db.get(
    `
    SELECT bis_items
    FROM ${TABLE_NAME} 
    WHERE role_class=? AND class_spec=?`,
    [roleClass, classSpec]
  );
  if (existed?.bis_items) {
    const bisData = JSON.parse(existed.bis_items);
    const date = formatDate();
    bisData.forEach((item) => {
      if (item.title === '汇总') {
        item.items = data.overview.map((bisItem) => bisItem.id).join('@');
        item.enhancements = data.overview
          .map((bisItem) => bisItem.enhancements)

          // 个别装备栏位没有附魔和宝石
          .filter((item) => item);
      }
    });
    return db.run(
      `
      UPDATE ${TABLE_NAME}
      SET bis_items=?,archon_stats_priority=?,popularity_items=?,updated_at=?,collected_at=?
      WHERE role_class=? AND class_spec=?`,
      [
        JSON.stringify(bisData),
        JSON.stringify(data.stats),
        JSON.stringify(data.popularityItems),
        date,
        date,
        roleClass,
        classSpec,
      ]
    );
  }
  return null;
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

async function getOutdatedBIS() {
  const latest = formatDate();
  const data = await db.all(
    `
    SELECT role_class, class_spec FROM ${TABLE_NAME} WHERE updated_at != ? ORDER BY updated_at ASC`,
    [latest]
  );
  return data.map((item) => ({
    classSpec: item?.class_spec,
    roleClass: item?.role_class,
  }));
}

async function getMaxrollBis() {
  return db.all(`
    SELECT
      id, role_class, class_spec, maxroll_bis
    FROM ${TABLE_NAME}
      `);
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
    getMaxrollBis,
    getOutdatedBIS,
    updateBisByClassAndSpec,
    insertBis,

    updateOverviewBis,
  };
}
