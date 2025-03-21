import { getCommonDynamicDB } from '../../../database/utils/index.js';
import { useTarotMapper } from '../../../database/common/mapper/dynamic/tarotMapper.js';
import { formatDate } from '../../../util/time.js';
import { useUserTarotMapper } from '../../../database/common/mapper/dynamic/userTaroMapper.js';

const db = await getCommonDynamicDB();
const tarotMapper = useTarotMapper(db);
const userTarotMapper = useUserTarotMapper(db);

async function checkUpdateTarotCount(date, tarotId) {
  let { count, totalCount } = await tarotMapper.getTarotCountByDateAndTarotId(
    date,
    tarotId
  );
  if (totalCount) {
    const updateTarotResult = await tarotMapper.updateTarotCount(date, tarotId);
    if (!updateTarotResult?.changes) {
      console.log('UPDATE CAROT失败');
    }
  } else {
    const insertTarotResult = await tarotMapper.insertTartoCount(date, tarotId);

    // 无论是否成功，都返回用户抽卡的结果。优化用户的体验
    if (!insertTarotResult?.changes) {
      console.log('INSERT CAROT失败');
    }
  }
  return { count, totalCount };
}
async function checkUserTarotCount(userId, date, tarotId, isPositive) {
  const output = {
    hasDraw: false,
    lastTarotId: null,
    isPositive: null,
  };
  const exsisted = await userTarotMapper.getUserTarotById(userId);
  if (exsisted) {
    const lastDraw = exsisted.tarot_list[exsisted.tarot_list?.length - 1];
    output.hasDraw = date === lastDraw.date;
    output.lastTarotId = lastDraw.id;
    output.isPositive = lastDraw.isPositive;

    // 每天只能抽一次
    if (!output.hasDraw && tarotId) {
      await userTarotMapper.updateUserTarot(userId, date, tarotId, isPositive);
      output.lastTarotId = tarotId;
      output.isPositive = isPositive;
    }
  } else if (tarotId) {
    await userTarotMapper.insertUserTarot(userId, date, tarotId, isPositive);
  }

  return output;
}

export async function queryCheckDrawTarot(req, res) {
  const { userId } = req.body;
  const date = formatDate();

  const { hasDraw, lastTarotId, isPositive } = await checkUserTarotCount(
    userId,
    date
  );

  let tarotInfo = null;
  let countInfo = null;
  if (lastTarotId !== null) {
    tarotInfo = await tarotMapper.getTarotInfoById(lastTarotId);
    tarotInfo.isPositive = isPositive;

    countInfo = await tarotMapper.getTarotCountByDateAndTarotId(
      date,
      lastTarotId
    );
  }

  res.json({
    hasDraw,
    lastTarotId,
    ...countInfo,
    tarot: tarotInfo,
  });
}

export async function queryDrawTarot(req, res) {
  const { userId } = req.body;
  let drawCardId = Math.floor(Math.random(0, 1) * 22);
  let isPositive = Math.floor(Math.random(0, 1) * 2);
  const date = formatDate();
  const {
    hasDraw,
    lastTarotId,
    isPositive: lastIsPositive,
  } = await checkUserTarotCount(userId, date, drawCardId, isPositive);

  // 每个用户每天只有抽的第一次才更新数据
  let countData;
  if (hasDraw) {
    drawCardId = lastTarotId;
    isPositive = lastIsPositive;
  } else {
    countData = await checkUpdateTarotCount(date, drawCardId);
  }
  const tarotInfo = await tarotMapper.getTarotInfoById(drawCardId);
  let tarot = null;
  if (tarotInfo) {
    tarot = {
      ...tarotInfo,
      isPositive,
    };
  }

  res.json({
    ...countData,
    hasDraw,
    drawCardId,
    tarot,
  });
}
