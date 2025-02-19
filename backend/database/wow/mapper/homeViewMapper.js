let db;

export async function getHomeView(time) {
  return db.get(`SELECT * FROM wow_home_view WHERE time = ?1`, [time]);
}

export async function insertHomeView(params) {
  const { time, carousels, tierLists, hotTopics } = params;
  await db.run(
    `INSERT INTO wow_home_view(time, carousels, tier_lists, hot_topics) VALUES(?1, ?2, ?3, ?4)`,
    [time, carousels, tierLists, hotTopics]
  );
}

export function useHomeViewMapper(database) {
  if (database) {
    db = database;
    // 仅仅处理异常场景，正常使用 database都应该来源于外部
  } else {
    throw new Error('DB missing');
  }

  return { getHomeView, insertHomeView };
}
