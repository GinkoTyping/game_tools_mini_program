import { getDB } from '../../database/utils/index.js';
import { useTierListMapper } from '../../database/wow/mapper/tierListMapper.js';

const db = await getDB();
const tierListMapper = useTierListMapper(db);

export async function queryTierList(req, res) {
  const { versionId, role, activityType } = req.body;

  if (versionId) {
    const data = await tierListMapper.getTierListByVersion({
      versionId,
      role,
      activityType,
    });
    if (data?.[0]) {
      res.json({
        ...data?.[0],
        tier_data: JSON.parse(data?.[0].tier_data),
      });
    } else {
      res.json(null);
    }
  } else {
    res.json(null);
  }
}
