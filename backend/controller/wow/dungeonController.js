import { getDB } from '../../database/utils/index.js';
import { useDungeonMapper } from '../../database/wow/mapper/dungeonMapper.js';

const db = await getDB();
const dungeonMapper = useDungeonMapper(db);

const SEASON_DUNGEONS = [506, 504, 370, 525, 499, 500, 247, 382];
const SEASON3_DUNGEONS = [
  1271,
  1272,
  1274,
  1210,
  1267,
  1270,
  1268,
  1269,
  1298,
  1303,
];

export async function getDungeonList(req, res) {
  const dungeons = await dungeonMapper.getDungeonsById(SEASON3_DUNGEONS);
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
