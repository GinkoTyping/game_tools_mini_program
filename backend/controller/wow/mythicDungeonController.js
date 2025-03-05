import { getDB } from '../../database/utils/index.js';
import { useMythicDungeonMapper } from '../../database/wow/mapper/mythicDungeonMapper.js';

const db = await getDB();
const mythicDungeonMapper = useMythicDungeonMapper(db);

export async function queryMythicDungeonById(req, res) {
  const id = req.params.id;

  const data = await mythicDungeonMapper.getMythicDungeonById(id);
  res.json({
    nameZH: data.name_zh,
    nameEN: data.name_en,
    routes: JSON.parse(data.routes),
    ratings: JSON.parse(data.ratings),
    utilityNeeds: JSON.parse(data.utility_needs),
    enemyTips: JSON.parse(data.enemy_tips),
    lootPool: JSON.parse(data.loot_pool),
  });
}

export async function queryMythicDungeonList(req, res) {
  const data = await mythicDungeonMapper.getMythicDunegonList();
  res.json(
    data.map((item) => ({
      ...item,
      ratings: JSON.parse(item.ratings),
    }))
  );
}
