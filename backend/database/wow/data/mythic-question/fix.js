import { mapStringToList } from '../../../../util/stringListHandler.js';
import { getDB, getDynamicDB } from '../../../utils/index.js';
import { useNpcAndSpellMarkMapper } from '../../mapper/npcAndSpellMarkMapper.js';
import { useUserMarkMapper } from '../../mapper/userMarkMapper.js';

const dynamicDB = await getDynamicDB();
const npcAndSpellMapper = useNpcAndSpellMarkMapper(dynamicDB);
const userMarkMapper = useUserMarkMapper(dynamicDB);

async function updateNpcSpellMark(userMarkItem) {
  const npcMarkList = mapStringToList(userMarkItem.npc_mark_list);
  const spellMarkList = mapStringToList(userMarkItem.spell_mark_list);
  const npcResults = await Promise.all(
    npcMarkList.map((markId) =>
      npcAndSpellMapper.updateNpcOrSpellMark(
        true,
        true,
        userMarkItem.id,
        markId
      )
    )
  );
  const spellResults = await Promise.all(
    spellMarkList.map((markId) =>
      npcAndSpellMapper.updateNpcOrSpellMark(
        false,
        true,
        userMarkItem.id,
        markId
      )
    )
  );
  return { npcResults, spellResults };
}
const results = [];
async function main() {
  const userMarkList = await userMarkMapper.getAllList();
  const total = userMarkList.length;
  for (const [index, userMarkItem] of userMarkList.entries()) {
    let status;
    try {
      const value = await updateNpcSpellMark(userMarkItem);
      status = 'fulfilled';
      results.push({ status: 'fulfilled', value });
    } catch (error) {
      status = 'rejected';
      results.push({ status: 'rejected', reason });
    } finally {
      console.log(`${status}: ${index + 1} / ${total}`);
    }
  }
  console.log(results);
}

main();
