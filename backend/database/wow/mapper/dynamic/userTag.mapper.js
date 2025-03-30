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

function mapSingleTag(wowTag, commonTag) {
  function toString(arr) {
    return arr.map((item) => item.value).join(',');
  }
  const wowJobs = toString(wowTag.jobs);
  const wowSpec = toString(wowTag.spec);
  const wowClasses = toString(wowTag.classes);
  const wowGameStyle = toString(wowTag.gameStyle);
  const wowActiveTime = wowTag.activeTime
    .map((item) => toString(item.values.filter((child) => child.selected)))
    .join('|');
  const wowPrivacy = wowTag.privacy ? 1 : 0;

  const commonStatus = toString(commonTag.status);
  const commonGame = toString(commonTag.game);
  const commonAge = toString(commonTag.age);
  const commonPersonality = toString(commonTag.personality);
  const commonRole = toString(commonTag.role);

  return [
    wowJobs,
    wowSpec,
    wowClasses,
    wowGameStyle,
    wowActiveTime,
    wowPrivacy,
    commonStatus,
    commonGame,
    commonAge,
    commonPersonality,
    commonRole,
  ];
}

async function insertUserTag(params) {
  const { id, battlenetId, wowTag, commonTag } = params;
  const date = formatDateByMinute();
  return db.run(
    `INSERT INTO ${TABLE_NAME}(user_id, battlenet_id, wow_tag, common_tag, created_at, updated_at, wow_jobs, wow_spec, wow_classes, wow_game_style,wow_active_time, wow_privacy, common_status, common_game, common_age, common_personality, common_role) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      battlenetId,
      JSON.stringify(wowTag),
      JSON.stringify(commonTag),
      date,
      date,
      ...mapSingleTag(wowTag, commonTag),
    ]
  );
}

async function updateUserTag(params) {
  const { id, battlenetId, wowTag, commonTag } = params;
  const date = formatDateByMinute();
  const columns = [
    'battlenet_id',
    'wow_tag',
    'common_tag',
    'updated_at',

    'wow_jobs',
    'wow_spec',
    'wow_classes',
    'wow_game_style',
    'wow_active_time',
    'wow_privacy',

    'common_status',
    'common_game',
    'common_age',
    'common_personality',
    'common_role',
  ];
  let sql = columns.reduce((pre, cur, index) => {
    pre += `${cur} = COALESCE(?, ${cur})`;
    if (index !== columns.length - 1) {
      pre += ', ';
    }
    return pre;
  }, `UPDATE ${TABLE_NAME} SET `);

  sql += ` WHERE user_id = ?`;

  return db.run(sql, [
    battlenetId,
    JSON.stringify(wowTag),
    JSON.stringify(commonTag),
    date,

    ...mapSingleTag(wowTag, commonTag),

    id,
  ]);
}

async function getUserTagByIds(ids, hasBattlenetId) {
  let selectSql =
    'user_id, wow_tag, common_tag' + `${hasBattlenetId ? ',battlenet_id' : ''}`;
  const sql = ids.reduce((pre, cur, index) => {
    if (index === 0) {
      pre += `user_id=?${index + 1} `;
    } else {
      pre += `OR user_id=?${index + 1} `;
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

function generateFilterSql(filterParams) {
  return Object.entries(filterParams)
    .filter(([key, value]) => value.filter((item) => item?.length)?.length)
    .reduce(
      (pre, [column, value]) => {
        const sql = value
          .filter((item) => item?.length)
          .reduce((child, item, index) => {
            child += `${column} LIKE ?`;
            if (index !== value.length - 1) {
              child += ' OR ';
            }
            pre.filterParams.push(`%${item}%`);
            return child;
          }, '');
        pre.condition += ` AND (${sql})`;
        return pre;
      },
      { condition: '', filterParams: [] }
    );
}

async function getUserTagByFilter(params) {
  const { filter, pageSize = 10, lastId = -1, lastUpdatedAt } = params;

  const { condition, filterParams } = generateFilterSql(filter);
  const baseWhere = `
    id != ? 
    AND updated_at ${lastUpdatedAt ? '<= ?' : '>= ?'}
    ${condition}
  `;
  const dataSql = `
    SELECT id, wow_tag, common_tag, updated_at
    FROM ${TABLE_NAME}
    WHERE ${baseWhere}
    ORDER BY updated_at DESC 
    LIMIT ?`;
  const countSql = `
    SELECT COUNT(*) as total
    FROM ${TABLE_NAME}
    WHERE ${baseWhere}`;

  // 构建参数数组
  const baseParams = [lastId, lastUpdatedAt?.toString() ?? '', ...filterParams];

  // 并行执行两个查询
  const [dataResult, countResult] = await Promise.all([
    db.all(dataSql, [...baseParams, pageSize]),
    db.get(countSql, baseParams),
  ]);

  return {
    data: dataResult.map((item) => ({
      ...item,
      wow_tag: JSON.parse(item.wow_tag || 'null'),
      common_tag: JSON.parse(item.common_tag || 'null'),
    })),
    total: countResult.total,
  };
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
    getUserTagByFilter,
  };
}
