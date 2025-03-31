import classLocale from '../../util/classLocale.js';
import { getDynamicDB } from '../../database/utils/index.js';
import { useUserTagMapper } from '../../database/wow/mapper/dynamic/userTag.mapper.js';
import { getTrendData } from './bisController.js';
import { useScheduleCheck } from '../../util/use-schedule-check.js';

const db = await getDynamicDB();
const userTagMapper = useUserTagMapper(db);

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
  const { ids } = req.body;
  const list = await userTagMapper.getUserTagByIds(ids, true);
  res.json(list);
}

export async function queryFilterUserTag(req, res) {
  const list = await userTagMapper.getUserTagByFilter(req.body);
  res.json(list);
}

async function mapFilterDetail(wowOptions, commonOptions) {
  await mapSpecOptions();
  const wowFilter = Object.values(wowOptions).reduce(
    (pre, cur) => {
      if (cur.value === 'wow_active_time') {
      } else if (cur.value === 'wow_spec') {
        pre.options.push({
          ...cur,
          options: trendDataCache.trend,
        });
      } else {
        pre.options.push(cur);
      }
      return pre;
    },
    {
      text: 'WOW',
      value: 'wow_basic',
      options: [],
    }
  );

  const commonFilters = Object.values(commonOptions).reduce(
    (pre, cur) => {
      if (['common_age', 'common_personality', 'common_status'].includes(cur.value)) {
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

  return [wowFilter, ...commonFilters];
}

export async function queryFilterDetails(req, res) {
  const data = await userTagMapper.getTagOptions();
  const filters = await mapFilterDetail(data.wowOptions, data.commonOptions);
  res.json(filters);
}
