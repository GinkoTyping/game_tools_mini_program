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

function toString(arr) {
  return arr.map((item) => item.value).join(',');
}
export function generateTimeLabels(activeTime) {
  // 通用处理函数（增加时段特殊阈值判断）
  function processPart(timeStr, prefix, getPeriod, periodOrder) {
    const hours = timeStr.split(',').map(Number);

    // 统计时间段出现次数
    const periodCounts = hours.reduce((acc, hour) => {
      const period = getPeriod(hour);
      acc[period] = (acc[period] || 0) + 1;
      return acc;
    }, {});

    // 过滤并排序有效时间段
    return Object.keys(periodCounts)
      .filter((period) => {
        if (period === 'early_morning') {
          return periodCounts[period] >= 3; // 凌晨时段需要至少3个时刻
        }

        if (['morning', 'midday'].includes(period)) {
          return periodCounts[period] >= 1;
        }

        return periodCounts[period] >= 2; // 其他时段至少1个时刻
      })
      .sort((a, b) => periodOrder[a] - periodOrder[b])
      .map((period) => `${prefix}_${period}`);
  }

  // 时间段定义保持不变
  const getPeriod = (hour) => {
    if (hour >= 6 && hour < 10) return 'morning';
    if (hour >= 10 && hour < 14) return 'midday';
    if (hour >= 14 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    if (hour >= 22 || hour < 2) return 'late_night';
    return 'early_morning';
  };

  const periodOrder = {
    /* 保持不变 */
  };

  // 调整数据解析逻辑（假设数据结构为：[{values: [...]}, {values: [...]}]）
  const [workdayData, weekendData] = activeTime;
  const workdayPart = workdayData.values
    .filter((child) => child.selected)
    .map((child) => child.value)
    .join(',');

  const weekendPart = weekendData.values
    .filter((child) => child.selected)
    .map((child) => child.value)
    .join(',');

  // 后续处理保持不变
  const workdayLabels = processPart(
    workdayPart,
    'workday',
    getPeriod,
    periodOrder
  );
  const weekendLabels = processPart(
    weekendPart,
    'weekend',
    getPeriod,
    periodOrder
  );

  return `${workdayLabels.join(',')}|${weekendLabels.join(',')}`;
}
function mapSingleTag(wowTag, commonTag) {
  const wowServer = toString(wowTag.server);
  const wowJobs = toString(wowTag.jobs);
  const wowSpec = toString(wowTag.spec);
  const wowClasses = toString(wowTag.classes);
  const wowCommunication = toString(wowTag.communication);
  const wowGameStyle = toString(wowTag.gameStyle);
  const wowActiveTime = generateTimeLabels(wowTag.activeTime);
  const wowPrivacyNeedConfirm = wowTag.privacy.needConfirm ? 1 : 0;
  const wowPrivacyDisplayWxProfile = wowTag.privacy.displayWxProfile ? 1 : 0;

  const commonStatus = toString(commonTag.status);
  const commonGame = toString(commonTag.game);
  const commonAge = toString(commonTag.age);
  const commonPersonality = toString(commonTag.personality);
  const commonRole = toString(commonTag.role);

  return [
    wowServer,
    wowJobs,
    wowSpec,
    wowClasses,
    wowCommunication,
    wowGameStyle,
    wowActiveTime,
    wowPrivacyNeedConfirm,
    wowPrivacyDisplayWxProfile,
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
    `INSERT INTO ${TABLE_NAME}(user_id, battlenet_id, wow_tag, common_tag, created_at, updated_at, wow_server, wow_jobs, wow_spec, wow_classes, wow_communication, wow_game_style,wow_active_time, wow_privacy_need_confirm, wow_privacy_wx_profile, common_status, common_game, common_age, common_personality, common_role) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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

    'wow_server',
    'wow_jobs',
    'wow_spec',
    'wow_classes',
    'wow_communication',
    'wow_game_style',
    'wow_active_time',
    'wow_privacy_need_confirm',
    'wow_privacy_wx_profile',

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

async function getUserTagByIds(ids, whereKey, hasBattlenetId) {
  let selectSql =
    'id, user_id, wow_tag, common_tag, updated_at' +
    `${hasBattlenetId ? ',battlenet_id' : ''}`;

  if (!['id', 'user_id'].includes(whereKey)) {
    throw new Error('invalid where key');
  }

  const sql = ids.reduce((pre, cur, index) => {
    if (index === 0) {
      pre += `${whereKey}=?${index + 1} `;
    } else {
      pre += `OR ${whereKey}=?${index + 1} `;
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
    .filter(
      ([key, value]) =>
        value.filter((item) => typeof item === 'number' || item?.length)?.length
    )
    .reduce(
      (pre, [column, value]) => {
        const sql = value
          .filter((item) => typeof item === 'number' || item?.length)
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
  const {
    applicantUserId,
    filter,
    pageSize = 10,
    lastId = -1,
    lastUpdatedAt,
  } = params;

  const { condition, filterParams } = generateFilterSql(filter);
  const baseWhere = `
    ${TABLE_NAME}.id != ? 
    AND ${TABLE_NAME}.updated_at ${lastUpdatedAt ? '<= ?' : '>= ?'}
    ${condition}
  `;

  const countWhere = `
    ${TABLE_NAME}.id != -1
    ${condition}
  `;

  const dataSql = `
    SELECT
      ${TABLE_NAME}.id,
      ${TABLE_NAME}.user_id,
      ${TABLE_NAME}.wow_tag,
      ${TABLE_NAME}.common_tag,
      ${TABLE_NAME}.updated_at,
      wow_dynamic_user_tag_relations.status as relation_status,
      wow_dynamic_user_tag_relations.id as relation_id,
      -- 动态返回 battlenet_id(仅当状态为 accepted 时)
      CASE 
        WHEN wow_dynamic_user_tag_relations.status = 'accepted' 
        THEN ${TABLE_NAME}.battlenet_id 
        ELSE NULL 
      END AS battlenet_id
    FROM ${TABLE_NAME}
    LEFT JOIN wow_dynamic_user_tag_relations 
    ON ${TABLE_NAME}.user_id = wow_dynamic_user_tag_relations.target_user_id
      AND ${TABLE_NAME}.id = wow_dynamic_user_tag_relations.tag_id
      AND wow_dynamic_user_tag_relations.applicant_user_id = ?
    WHERE ${baseWhere}
    ORDER BY ${TABLE_NAME}.updated_at DESC 
    LIMIT ?`;
  const countSql = `
    SELECT COUNT(*) as total
    FROM ${TABLE_NAME}
    WHERE ${countWhere}`;

  // 构建参数数组
  const baseParams = [
    applicantUserId,
    lastId,
    lastUpdatedAt?.toString() ?? '',
    ...filterParams,
    pageSize,
  ];

  // 并行执行两个查询
  const [dataResult, countResult] = await Promise.all([
    db.all(dataSql, baseParams),
    db.get(countSql, filterParams),
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

async function getTotalTagCardCount(params) {
  const data = await db.get(`SELECT COUNT(*) as total FROM ${TABLE_NAME}`);
  return data?.total ?? 0;
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
    getTotalTagCardCount,
  };
}
