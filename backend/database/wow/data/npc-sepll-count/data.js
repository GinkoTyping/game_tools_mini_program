import { getDB, getDynamicDB } from '../../../utils/index.js';
import { useNpcAndSpellMarkMapper } from '../../mapper/npcAndSpellMarkMapper.js';
import { useMythicDungeonMapper } from '../../mapper/mythicDungeonMapper.js';

const db = await getDB();
const mythicDungeonMapper = useMythicDungeonMapper(db);

const dynamicDB = await getDynamicDB();
const npcAndSpellMarkMapper = useNpcAndSpellMarkMapper(dynamicDB);

// 提取 wow_mythic_dungeon 中的攻略数据
async function main() {
  const data = await mythicDungeonMapper.getMythicDungeonAll();
  const dungeons = data.map((item) => JSON.parse(item.enemy_tips));

  const npcs = [];
  const spells = [];

  dungeons.forEach((dungeon, dungeonIdex) => {
    dungeon.forEach((part) => {
      part.data.forEach((item) => {
        if (part.type === 'trash') {
          if (!npcs.some((npc) => npc.trashId === item.trashId)) {
            npcs.push({
              ...item,
              dungeonId: data[dungeonIdex].id,
            });
          }
        } else {
          if (
            item.spellId &&
            !spells.some((spell) => spell.spellId === item.spellId)
          ) {
            spells.push({
              ...item,
              dungeonId: data[dungeonIdex].id,
            });
          }
        }
      });
    });
  });

  await Promise.allSettled(
    npcs.map((npc) =>
      npcAndSpellMarkMapper.insertNpc({
        id: npc.trashId,
        name_zh: npc.trashName,
        content: JSON.stringify(npc),
        dungeon_id: npc.dungeonId,
      })
    )
  );
  await Promise.allSettled(
    spells.map((spell) =>
      npcAndSpellMarkMapper.insertSpell({
        id: spell.spellId,
        name_zh: spell.spellNameZH,
        content: JSON.stringify(spell),
        dungeon_id: spell.dungeonId,
      })
    )
  );
}

main();
