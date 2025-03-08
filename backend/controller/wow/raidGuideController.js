import { getDB } from '../../database/utils/index.js';
import { useRaidGuideMapper } from '../../database/wow/mapper/raidGuide.js';

const db = await getDB();
const raidGuideMapper = useRaidGuideMapper(db);

export async function queryRaidGuide(req, res) {
  const raidGuide = await raidGuideMapper.getRaidGuild();
  res.json({
    ...raidGuide,
    guide: JSON.parse(raidGuide.guide),
  });
}
