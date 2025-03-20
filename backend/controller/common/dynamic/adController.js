import { getCommonDynamicDB } from '../../../database/utils/index.js';
import { useAdMapper } from '../../../database/common/mapper/dynamic/adMapper.js';
import { useUserAdMapper } from '../../../database/common/mapper/dynamic/userAdMapper.js';
import { formatDateByMinute, formatNextDay } from '../../../util/time.js';

const db = await getCommonDynamicDB();
const adMapper = useAdMapper(db);
const userAdMapper = useUserAdMapper(db);

const UPDATE_INTERVAL = 24 * 60 * 60 * 1000;
async function updateUserAdById(id) {
  const date = formatDateByMinute();
  const existed = await userAdMapper.getUserAd(id);
  let result;
  if (existed) {
    existed.ad_list.push(date);
    result = await userAdMapper.updateUserAd(id, existed.ad_list);
  } else {
    result = await userAdMapper.insertUserAd(id, [date]);
  }

  return { ...result, freeDate: formatNextDay(date) };
}

async function updateAdCount() {
  const date = new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  const data = await adMapper.getAdCount(date);

  let result;
  if (data) {
    result = await adMapper.updateAdCount(date, data.count + 1);
  } else {
    result = await adMapper.insertAd(date, 1);
  }
  return result;
}

export async function queryUpdateAdCount(req, res) {
  try {
    const date = new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());

    const data = await adMapper.getAdCount(date);

    if (data) {
      await adMapper.updateAdCount(date, data.count + 1);
    } else {
      await adMapper.insertAd(date, 1);
    }

    res.json({ message: '投喂成功' });
  } catch (error) {
    console.log(`后端投喂计数异常: ${error}`);
    res.status(401).json({ error: `后端投喂计数异常。` });
  }
}

export async function queryAdCount(req, res) {
  try {
    const date = new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());

    const data = await adMapper.getAdCount(date);
    if (data) {
      res.json(data);
    } else {
      const defaultCount = Math.floor(Math.random() * 8) + 2;
      await adMapper.insertAd(date, defaultCount);
      res.json({
        date,
        count: defaultCount,
      });
    }
  } catch (error) {
    console.log(`后端服务异常: ${error}`);
    res.status(401).json({ error: `后端服务异常。` });
  }
}

// 新接口
export async function getFreeAdInfo(id) {
  const userAd = await userAdMapper.getUserAd(id);
  let output = {
    isFreeAd: false,
    freeLeft: null,
    lastUntil: null,
  };
  if (userAd?.ad_list?.length) {
    const freeUntil = formatNextDay(userAd.ad_list.pop());
    const diff = Math.abs(new Date().getTime() - new Date(freeUntil).getTime());
    output.lastUntil = freeUntil;
    if (diff < UPDATE_INTERVAL) {
      const hour = Math.floor(diff / 3600 / 1000);
      const minute = Math.floor((diff - hour * 3600 * 1000) / 60 / 1000);
      output.isFreeAd = true;
      output.freeLeft = `${hour}时${minute}分`;
    }
  }
  return output;
}
export async function queryUpdateAdCountByUser(req, res) {
  try {
    const { id } = req.body;
    const adResult = await updateAdCount();
    const userAdResult = await updateUserAdById(id);
    if (adResult.changes && userAdResult.changes) {
      const freeAdInfo = await getFreeAdInfo(id);
      res.json({ message: '投喂成功', ...freeAdInfo });
    } else {
      res.status(401).json({ error: '后端投喂计数异常。' });
    }
  } catch (error) {
    console.log(error);
    res.status().json({ error: '后端投喂计数异常。' });
  }
}
export async function queryAdCountByUser(req, res) {
  try {
    const { id } = req.body;
    const date = new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());

    const data = await adMapper.getAdCount(date);
    const userAd = await userAdMapper.getUserAd(id);
    const freeAdInfo = await getFreeAdInfo(id);
    if (data) {
      res.json({
        ...data,
        ...freeAdInfo,
      });
    } else {
      const defaultCount = Math.floor(Math.random() * 8) + 2;
      await adMapper.insertAd(date, defaultCount);
      res.json({
        date,
        count: defaultCount,
        ...freeAdInfo,
      });
    }
  } catch (error) {
    console.log(`后端服务异常: ${error}`);
    res.status(401).json({ error: `后端服务异常。` });
  }
}
