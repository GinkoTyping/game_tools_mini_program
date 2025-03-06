import { getDB, getDynamicDB } from '../../database/utils/index.js';
import { useMythicDungeonMapper } from '../../database/wow/mapper/mythicDungeonMapper.js';
import { useMythicDungeonCountMapper } from '../../database/wow/mapper/mythicDungeonCountMapper.js';

const db = await getDB();
const dynamicDB = await getDynamicDB();
const mythicDungeonMapper = useMythicDungeonMapper(db);
const mythicDungeonCountMapper = useMythicDungeonCountMapper(dynamicDB);

export async function queryMythicDungeonById(req, res) {
  const id = req.params.id;

  const data = await mythicDungeonMapper.getMythicDungeonById(id);

  // 访问计数 +1
  mythicDungeonCountMapper.addMythicDungeonCountById(id);

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
  const counts = await mythicDungeonCountMapper.getMythicDungeonCountList();
  res.json(
    data.map((item) => ({
      ...item,
      count: counts?.find((countItem) => countItem.id === item.id)?.count ?? 0,
      ratings: JSON.parse(item.ratings),
    }))
  );
}
