let db;

async function insertTierList(params) {
  const { versionId, activityType, role, tierData } = params;
  await db.run(
    `
    INSERT INTO wow_tier_list(version_id, activity_type, role, tier_data) VALUES (?1, ?2, ?3, ?4)
  `,
    [versionId, activityType, role, tierData]
  );
}

function getTierListByVersion(version) {
  return db.get(`SELECT * FROM wow_tier_list WHERE version_id = ?1`, [version]);
}

function getAllTierList() {
  return db.all(`SELECT version_id, activity_type, role FROM wow_tier_list`);
}

export function useTierListMapper(database) {
  if (database) {
    db = database;
    // 仅仅处理异常场景，正常使用 database都应该来源于外部
  } else {
    throw new Error('DB missing');
  }

  return { insertTierList, getTierListByVersion, getAllTierList };
}
