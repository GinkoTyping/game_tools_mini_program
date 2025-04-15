import { getDB } from '../../database/utils/index.js';
import { collectMythicTierList } from '../../database/wow/data/archon-tier-list/crawler.js';
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

export async function queryUpdateArchonMythicTier(req, res) {
  try {
    const tierData = await collectMythicTierList(req.body.useCache);

    const results = await Promise.allSettled(
      tierData.map((roleTier) => tierListMapper.updateTierList(roleTier))
    );
    const err = results.filter((item) => item.status !== 'fulfilled');
    if (err.length) {
      res.status(500).json({ error: '更新大秘境专精排名失败' });
    }
    res.json({ message: '更新大秘境专精排名成功' });
  } catch (error) {
    res.status(500).json({ error: error?.message });
  }
}
