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
    res.json({
      ...data,
      tier_data: JSON.parse(data.tier_data),
    });
  } else {
    res.json(null);
  }
}
