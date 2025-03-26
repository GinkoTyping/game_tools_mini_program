import { formatDateByMinute } from '../../../../util/time.js';
import wowOptions from '../../data/user-tag/wow_tag.js';
import commonOptions from '../../data/user-tag/common_tag.js';

let db;
const TABLE_NAME = 'wow_dynamic_user_tag';
const mappedCommonOptions = mapCommonOptions();
function mapCommonOptions() {
  Object.entries(commonOptions).forEach(([key, value]) => {
    commonOptions[key].options = value.options.map((item) => ({
      text: item,
      value: item,
    }));
  });
  return commonOptions;
}

async function getTagOptions() {
  return { wowOptions, commonOptions: mappedCommonOptions };
}

async function insertUserTag(params) {
  const { id, battlenetId, wowTag, commonTag } = params;
  const date = formatDateByMinute();
  return db.run(
    `INSERT INTO ${TABLE_NAME}(id, battlenet_id, wow_tag, common_tag, created_at, updated_at) VALUES(?1, ?2, ?3, ?4, ?5, ?6)`,
    [
      id,
      battlenetId,
      JSON.stringify(wowTag),
      JSON.stringify(commonTag),
      date,
      date,
    ]
  );
}

async function updateUserTag(params) {
  const { id, battlenetId, wowTag, commonTag } = params;
  const date = formatDateByMinute();
  return db.run(
    `UPDATE ${TABLE_NAME}
    SET battlenet_id = CASE
      WHEN ?1 IS NOT NULL THEN ?1
      ELSE battlenet_id
    END,
    wow_tag = CASE
      WHEN ?2 IS NOT NULL THEN ?2
      ELSE wow_tag
    END,
    common_tag = CASE
      WHEN ?3 IS NOT NULL THEN ?3
      ELSE common_tag
    END,
    updated_at = CASE
      WHEN ?4 IS NOT NULL THEN ?4
      ELSE updated_at
    END
    WHERE id = ?5
    `,
    [battlenetId, JSON.stringify(wowTag), JSON.stringify(commonTag), date, id]
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
    wow_tag: JSON.parse(item.wow_tag ?? null),
    common_tag: JSON.parse(item.common_tag ?? null),
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
    updateUserTag,
    getUserTagByIds,
  };
}
