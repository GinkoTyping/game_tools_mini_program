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

export async function queryUserTagOptions(req, res) {
  const data = await userTagMapper.getTagOptions();
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
  res.json({
    ...data,
    specs: trendDataCache,
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
  const { filter = {} } = req.body;
  const list = await userTagMapper.getUserTagByFilter(filter);
  res.json(list);
}
