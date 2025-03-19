import { getDailyDB } from '../../database/utils/index.js';
import { getSpecDpsRankData } from '../../database/wow/data/dps-rank/data.js';
import { useSpecStatMapper } from '../../database/wow/mapper/daliy/specStatMapper.js';

import spriteMap from '../../assets/wow/sprites/sprite-map.js';
import { getWeekCount } from '../../util/wow.js';

const db = await getDailyDB();
const specStatMapper = useSpecStatMapper(db);

const UPDATE_INTERVAL_HOUR = 4;
const UPDATE_INTERVAL = UPDATE_INTERVAL_HOUR * 3600 * 1000;
let lastUpdateAt = 0;

function formateDate(dateString) {
  let date;
  if (dateString) {
    date = new Date(dateString);
  } else {
    date = new Date();
  }

  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

export async function querySpecDpsRank(req, res) {
  const weekCountMax = getWeekCount();
  const weekId = Math.min(Number(req.body.weekId), weekCountMax);
  const isLatestWeek = weekId >= weekCountMax;
  let toUpdateLatestWeek = false;
  if (isLatestWeek) {
    toUpdateLatestWeek = Date.now() - lastUpdateAt > UPDATE_INTERVAL;
  }

  const databaseData = await specStatMapper.getSpecDpsRank({ week_id: weekId });

  let output;

  if (databaseData?.data) {
    if (toUpdateLatestWeek) {
      output = await getSpecDpsRankData(weekId, weekCountMax);
      await specStatMapper.updateSpecDpsRank({
        week_id: weekId,
        data: JSON.stringify(output),
      });

      lastUpdateAt = Date.now();
    } else {
      output = {
        ...JSON.parse(databaseData.data),
      };
    }
  } else {
    output = await getSpecDpsRankData(weekId, weekCountMax);
    await specStatMapper.insertSpecDpsRank({
      week_id: weekId,
      data: JSON.stringify(output),
    });

    if (isLatestWeek) {
      lastUpdateAt = Date.now();
    }
  }

  res.json({
    ...output,
    sprite: spriteMap,
    current_week_updated_at: isLatestWeek ? formateDate(lastUpdateAt) : null,
  });
}
