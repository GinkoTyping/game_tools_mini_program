import { getDailyDB } from '../../database/utils/index.js';
import { getSpecDpsRankData } from '../../database/wow/data/dps-rank/data.js';
import { useSpecStatMapper } from '../../database/wow/mapper/daliy/specStatMapper.js';

import spriteMap from '../../assets/wow/sprites/sprite-map.js';

const db = await getDailyDB();
const specStatMapper = useSpecStatMapper(db);

export async function querySpecDpsRank(req, res) {
  const weekId = req.body.weekId;
  const databaseData = await specStatMapper.getSpecDpsRank({ week_id: weekId });

  let output;
  if (databaseData?.data) {
    output = {
      ...JSON.parse(databaseData.data),
    };
  } else {
    output = await getSpecDpsRankData(weekId);
    await specStatMapper.insertSpecDpsRank({
      week_id: weekId,
      data: JSON.stringify(output),
    });
  }

  res.json({
    ...output,
    sprite: spriteMap,
  });
}
