let db;

let TABLE_NAME = 'common_dynamic_user_ad';

async function getUserAd(id) {
  const data = await db.get(`SELECT * FROM ${TABLE_NAME} WHERE id = ?1`, [id]);
  if (data) {
    return {
      id: data.id,
      ad_list: data.ad_list ? JSON.parse(data.ad_list) : [],
    };
  }
  return null;
}

async function insertUserAd(id, adList) {
  const adListString = adList ? JSON.stringify(adList) : null;
  return db.run(`INSERT INTO ${TABLE_NAME}(id, ad_list) VALUES(?1, ?2)`, [
    id,
    adListString,
  ]);
}

async function updateUserAd(id, adList) {
  const adListString = adList ? JSON.stringify(adList) : null;
  return db.run(`UPDATE ${TABLE_NAME} SET ad_list=?1 WHERE id=?2`, [
    adListString,
    id,
  ]);
}

export function useUserAdMapper(database) {
  if (database) {
    db = database;
    // 仅仅处理异常场景，正常使用 database都应该来源于外部
  } else {
    throw new Error('DB missing');
  }

  return { getUserAd, insertUserAd, updateUserAd };
}
