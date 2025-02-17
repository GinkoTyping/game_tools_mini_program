import { getDB } from '../../database/utils/index.js';
import { useDungeonMapper } from '../../database/wow/mapper/dungeonMapper.js';

const db = await getDB();
const dungeonMapper = useDungeonMapper(db);

const SEASON_DUNGEONS = [503, 501, 502, 353, 376, 375, 505, 507];
export async function getDungeonList(req, res) {
  const dungeons = await dungeonMapper.getDungeonsById(SEASON_DUNGEONS);
  res.json(dungeons);
}
