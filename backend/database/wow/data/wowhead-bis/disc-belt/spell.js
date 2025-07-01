import path from 'path';
import { fileURLToPath } from 'url';
import { getDB } from '../../../../utils/index.js';
import { useSpellMapper } from '../../../mapper/spellMapper.js';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const db = await getDB();
const spellMapper = useSpellMapper(db);

async function main() {
  const rawData = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, './index.json')),
  );
  const spellList = Object.entries(rawData).reduce(
    (pre, [roleClass, specItems]) => {
      specItems.forEach((item) => {
        item.data.forEach((suggestItem) => {
          const spells = Array.isArray(suggestItem.value) ? suggestItem.value : [suggestItem.value];
          spells.forEach(spellId => {
            if (!pre.includes(spellId)) {
              pre.push(spellId);
            }
          });
        });

      });

      return pre;
    },
    [],
  );

  const results = await Promise.allSettled(spellList.map(async id => {
    const existed = await spellMapper.getSpellById(id);
    if (!existed) {
      return spellMapper.insertSpell({ id });
    }
  }));
  return results;
}

main();