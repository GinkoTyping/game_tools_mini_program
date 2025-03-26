import friendOptions from '../../data/friend/tag.js';

let db;
const TABLE_NAME = 'wow_dynamic_use_tag';

async function getTagOptions() {
  return friendOptions;
}

async function insertUserTag(params) {
  const { id, wowTag, commonTag } = params;
  return db.run(
    `INSERT INTO ${TABLE_NAME}(id, wow_tag, common_tag) VALUES(?1, ?2, ?3)`,
    [id, JSON.stringify(wowTag), JSON.stringify(commonTag)]
  );
}

async function getUserTagByIds(ids) {
  const selectSql = 'id, wow_tag, common_tag';
  const sql = ids.reduce((pre, cur, index) => {
    if (index === 0) {
      pre += `id=?${index + 1} `;
    } else {
      pre += `OR id=?${index + 1} `;
    }
    return pre;
  }, `SELECT ${selectSql} FROM ${TABLE_NAME} WHERE `);
  const data = await db.all(sql, ids);

  return data.map((item) => ({
    ...item,
    wow_tag: JSON.parse(item.wowTag),
    common_tag: JSON.parse(item.commonTag),
  }));
}

export function useUserTagMapper(database) {
  if (database) {
    db = database;
    // 仅仅处理异常场景，正常使用 database都应该来源于外部
  } else {
    throw new Error('DB missing');
  }

  return {
    getTagOptions,

    insertUserTag,
    getUserTagByIds,
  };
}
