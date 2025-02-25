import { getDB } from '../../database/utils/index.js';
import { useDungeonMapper } from '../../database/wow/mapper/dungeonMapper.js';

const db = await getDB();
const dungeonMapper = useDungeonMapper(db);

const SEASON_DUNGEONS = [506, 504, 370, 525, 499, 500, 247, 382];
export async function getDungeonList(req, res) {
  const dungeons = await dungeonMapper.getDungeonsById(SEASON_DUNGEONS);
  res.json(dungeons);
}

export async function getDungeonByName(req, res) {
  const { nameZH, nameEN } = req.body;
  const data = await dungeonMapper.getDungeonByName({
    name_zh: nameZH,
    name_en: nameEN,
  });
  res.json(data);
}
