let db;

async function insertRaidGuild(params) {
  const { id, name_zh, guide } = params;
  return db.run(
    `INSERT INTO wow_raid_guide(id, name_zh, guide) VALUES(?1, ?2, ?3)`,
    [id, name_zh, guide]
  );
}

export function useRaidGuideMapper(database) {
  if (database) {
    db = database;
    // 仅仅处理异常场景，正常使用 database都应该来源于外部
  } else {
    throw new Error('DB missing');
  }

  return { insertRaidGuild };
}
