import { getDB, getDynamicDB } from '../../database/utils/index.js';
import { useMythicDungeonMapper } from '../../database/wow/mapper/mythicDungeonMapper.js';
import { useMythicDungeonCountMapper } from '../../database/wow/mapper/mythicDungeonCountMapper.js';
import { useNpcAndSpellMapper } from '../../database/wow/mapper/npcAndSpellMapper.js';
import { isLocal } from '../../auth/validateAdmin.js';

const db = await getDB();
const dynamicDB = await getDynamicDB();
const mythicDungeonMapper = useMythicDungeonMapper(db);
const mythicDungeonCountMapper = useMythicDungeonCountMapper(dynamicDB);
const npcAndSpellMapper = useNpcAndSpellMapper(dynamicDB);

export async function queryMythicDungeonById(req, res) {
  const id = req.params.id;

  const data = await mythicDungeonMapper.getMythicDungeonById(id);

  if (!isLocal(req)) {
    // 访问计数 +1
    await mythicDungeonCountMapper.addMythicDungeonCountById(id);
  }

  const dungeons = JSON.parse(data.enemy_tips);
  async function getNpcAndSpellCounts() {
    const npcs = [];
    const spells = [];
    dungeons.forEach((part) => {
      part.data.forEach((item) => {
        if (part.type === 'trash') {
          if (!npcs.some((item) => item === item.trashId)) {
            npcs.push(item.trashId);
          }
        } else {
          if (item.spellId && !spells.some((item) => item === item.spellId)) {
            spells.push(item.spellId);
          }
        }
      });
    });

    const npcCounts = await npcAndSpellMapper.getNpcOrSpellCountByIds(
      npcs,
      true
    );
    const spellCounts = await npcAndSpellMapper.getNpcOrSpellCountByIds(
      spells,
      false
    );

    return {
      npcs: npcCounts,
      spells: spellCounts,
    };
  }
  const { spells, npcs } = await getNpcAndSpellCounts();

  function setTipCounts() {
    dungeons.forEach((part) => {
      const reference = part.type === 'trash' ? npcs : spells;
      const key = part.type === 'trash' ? 'trashId' : 'spellId';
      part.data = part.data.map((item) => ({
        ...item,
        count: reference.find(
          (referenceItem) => Number(referenceItem.id) === Number(item[key])
        )?.count,
      }));
    });
  }
  setTipCounts();

  res.json({
    nameZH: data.name_zh,
    nameEN: data.name_en,
    routes: JSON.parse(data.routes),
    ratings: JSON.parse(data.ratings),
    utilityNeeds: JSON.parse(data.utility_needs),
    enemyTips: dungeons,
    lootPool: JSON.parse(data.loot_pool),
  });
}

export async function queryMythicDungeonList(req, res) {
  const data = await mythicDungeonMapper.getMythicDunegonList();
  const counts = await mythicDungeonCountMapper.getMythicDungeonCountList();
  res.json(
    data
      .map((item) => ({
        ...item,
        count:
          counts?.find((countItem) => countItem.id === item.id)?.count ?? 0,
        ratings: JSON.parse(item.ratings),
      }))
      .sort((a, b) => b.count - a.count)
  );
}
