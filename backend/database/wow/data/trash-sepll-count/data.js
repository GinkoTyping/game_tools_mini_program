import { getDB, getDynamicDB } from '../../../utils/index.js';
import { useNpcAndSpellMapper } from '../../mapper/npcAndSpellMapper.js';
import { useMythicDungeonMapper } from '../../mapper/mythicDungeonMapper.js';

const db = await getDB();
const mythicDungeonMapper = useMythicDungeonMapper(db);

const dynamicDB = await getDynamicDB();
const npcAndSpellMapper = useNpcAndSpellMapper(dynamicDB);

// 提取 wow_mythic_dungeon 中的攻略数据
async function main() {
  const data = await mythicDungeonMapper.getMythicDungeonAll();
  const dungeons = data.map((item) => JSON.parse(item.enemy_tips));

  const npcs = [];
  const spells = [];

  dungeons.forEach((dungeon) => {
    dungeon.forEach((part) => {
      part.data.forEach((item) => {
        if (part.type === 'trash') {
          if (!npcs.some((npc) => npc.trashId === item.trashId)) {
            npcs.push(item);
          }
        } else {
          if (
            item.spellId &&
            !spells.some((spell) => spell.spellId === item.spellId)
          ) {
            spells.push(item);
          }
        }
      });
    });
  });

  await Promise.allSettled(
    npcs.map((npc) =>
      npcAndSpellMapper.insertNpc({
        id: npc.trashId,
        name_zh: npc.trashName,
        content: JSON.stringify(npc),
      })
    )
  );
  await Promise.allSettled(
    spells.map((spell) => npcAndSpellMapper.insertSpell({
      id: spell.spellId,
      name_zh: spell.spellNameZH,
      content: JSON.stringify(spell),
    }))
  );
}

main();
