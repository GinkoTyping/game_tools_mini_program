import { getDB, getDynamicDB } from '../../../utils/index.js';
import { useNpcMapper } from '../../mapper/npcMapper.js';
import { useSpellMapper } from '../../mapper/spellMapper.js';
import { useTrashAndSpellMapper } from '../../mapper/trashAndSpellMapper.js';
import { useMythicDungeonMapper } from '../../mapper/mythicDungeonMapper.js';

const db = await getDB();
const npcMapper = useNpcMapper(db);
const spellMapper = useSpellMapper(db);
const mythicDungeonMapper = useMythicDungeonMapper(db);

const dynamicDB = await getDynamicDB();
const trashAndSpellMapper = useTrashAndSpellMapper(dynamicDB);

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
          if (!npcs.some(npc => npc.trashId === item.trashId)) {
            npcs.push(item);
          }
        } else {
          if (item.spellId && !spells.some(spell => spell.spellId === item.spellId)) {
            spells.push(item);
          }
        }
      });
    });
  });


}

main();
