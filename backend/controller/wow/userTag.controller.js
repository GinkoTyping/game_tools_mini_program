import classLocale from '../../util/classLocale.js';
import { getAuthDB, getDynamicDB } from '../../database/utils/index.js';
import { useUserTagMapper } from '../../database/wow/mapper/dynamic/userTag.mapper.js';
import { getTrendData } from './bisController.js';
import { useScheduleCheck } from '../../util/use-schedule-check.js';
import { useAuthMapper } from '../../database/auth/mapper/authMapper.js';
import { useUserTagRelationMapper } from '../../database/wow/mapper/dynamic/userTagRelation.mapper.js';

const db = await getDynamicDB();
const userTagMapper = useUserTagMapper(db);
const userTagRelationMapper = useUserTagRelationMapper(db);

const authDb = await getAuthDB();
const authMapper = useAuthMapper(authDb);

const UPDATE_INTERVAL_HOUR = 24;
const optionSchedule = useScheduleCheck(UPDATE_INTERVAL_HOUR);
let trendDataCache;

async function mapSpecOptions() {
  if (optionSchedule.isSchedule()) {
    const trendData = await getTrendData();
    trendData.trend = trendData.trend.reduce((pre, cur) => {
      cur.specs.forEach((spec) => {
        pre.push({
          text: classLocale[cur.role_class][spec.class_spec],
          value: `${spec.class_spec}|${cur.role_class}`,
          roleClass: cur.role_class,
          classSpec: spec.class_spec,
        });
      });
      return pre;
    }, []);
    trendDataCache = trendData;
    optionSchedule.setLastUpdate();
  }
  return trendDataCache;
}

export async function queryUserTagOptions(req, res) {
  const data = await userTagMapper.getTagOptions();
  await mapSpecOptions();
  res.json({
    ...data,
    specs: trendDataCache.trend,
  });
}

export async function queryAddUserTag(req, res) {
  const { id, battlenetId, wowTag, commonTag } = req.body;
  try {
    const result = await userTagMapper.insertUserTag({
      id,
      wowTag,
      commonTag,
      battlenetId,
    });
    if (result.changes) {
      res.json({ message: '注册成功！' });
    } else {
      res.status(500).json({ message: '注册失败' });
    }
  } catch (error) {
    res.status(500).json({ message: '注册失败', error: error.code });
  }
}

export async function queryUpdateUserTag(req, res) {
  const { id, battlenetId, wowTag, commonTag } = req.body;
  try {
    const result = await userTagMapper.updateUserTag({
      id,
      wowTag,
      commonTag,
      battlenetId,
    });
    if (result.changes) {
      res.json({ message: '更新成功！' });
    } else {
      res.status(500).json({ message: '更新失败' });
    }
  } catch (error) {
    res.status(500).json({ message: '更新失败', error: error.code });
  }
}

export async function queryUserTagByIds(req, res) {
  try {
    const { ids, userIds, applicantUserId } = req.body;
    const whereKey = ids ? 'id' : 'user_id';

    let list = await userTagMapper.getUserTagByIds(
      ids ?? userIds,
      whereKey,
      true,
      applicantUserId
    );
    list = await mapUserProfileInfo(list);
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error?.message });
  }
}

async function mapUserProfileInfo(list) {
  const users = await authMapper.getUsersByIds(
    list.map((item) => item.user_id)
  );
  return list.map((item) => {
    const existed = users.find((user) => user.id === item.user_id);
    return {
      ...item,
      nickName: existed?.nick_name ?? null,
      avatarUrl: existed?.avatar_url ?? null,
    };
  });
}

export async function queryUserTagByFilter(req, res) {
  const allData = await userTagMapper.getUserTagByFilter(req.body);
  allData.data = await mapUserProfileInfo(allData.data);
  res.json(allData);
}

async function mapFilterDetail(wowOptions, commonOptions) {
  await mapSpecOptions();
  const wowFilter = Object.values(wowOptions).reduce(
    (pre, cur) => {
      if (cur.value === 'wow_active_time') {
        const target = pre.find((item) => item.value === 'active_time');
        target.options.push(...cur.options);
      } else if (cur.value === 'wow_spec') {
        const target = pre.find((item) => item.value === 'wow_basic');
        target.options.push({
          ...cur,
          options: trendDataCache.trend,
        });
      } else {
        const target = pre.find((item) => item.value === 'wow_basic');
        target.options.push(cur);
      }
      return pre;
    },
    [
      {
        text: 'WOW',
        value: 'wow_basic',
        options: [],
      },
      {
        text: '活跃时间',
        value: 'active_time',
        options: [],
      },
    ]
  );

  const commonFilters = Object.values(commonOptions).reduce(
    (pre, cur) => {
      if (
        ['common_age', 'common_personality', 'common_status'].includes(
          cur.value
        )
      ) {
        const parent = pre.find((item) => item.value === 'personal');
        parent.options.push(cur);
      } else if (['common_role'].includes(cur.value)) {
        const parent = pre.find((item) => item.value === 'role');
        parent.options.push(cur);
      } else {
        const parent = pre.find((item) => item.value === 'likes');
        parent.options.push(cur);
      }

      return pre;
    },
    [
      { text: '铭牌主', value: 'personal', options: [] },
      { text: '自我定位', value: 'role', options: [] },
      { text: '其他爱玩', value: 'likes', options: [] },
    ]
  );

  return [...wowFilter, ...commonFilters];
}

export async function queryFilterDetails(req, res) {
  const data = await userTagMapper.getTagOptions();
  const filters = await mapFilterDetail(data.wowOptions, data.commonOptions);
  res.json(filters);
}

export async function queryUpdateLastViewRelation(req, res) {
  try {
    const result = await userTagMapper.updateLastViewRelation(req.body.userId);
    if (result.changes) {
      res.json({ message: '更新成功！' });
    } else {
      res.status(500).json({ message: '更新失败' });
    }
  } catch (error) {
    res.status(500).json({ message: '更新失败', error: error.code });
  }
}

export async function queryNotViewedRelations(req, res) {
  const { userId } = req.body;

  const results = await Promise.allSettled([
    userTagMapper.getLastViewRelation(userId),
    userTagRelationMapper.getRelationsByTargetUser(userId),
  ]);
  const [lastViewData, targetRelastions] = results.map((item) => item.value);

  let notViewList;
  if (lastViewData?.last_view_relation_at) {
    notViewList = [...targetRelastions].filter(
      (item) => item.updated_at > lastViewData.last_view_relation_at
    );
  } else {
    notViewList = [...targetRelastions];
  }
  res.json({
    last: lastViewData?.last_view_relation_at ?? null,
    list: notViewList,
    count: notViewList.length,
  });
}
