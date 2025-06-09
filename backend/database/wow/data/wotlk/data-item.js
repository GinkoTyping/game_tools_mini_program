import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { getDB } from '../../../utils/index.js';
import { useItemMapper } from '../../mapper/itemMapper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const data = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, './wowhead.json')));

const db = await getDB();
const itemMapper = useItemMapper(db);

async function main() {
  let glyphIds = data.reduce((pre, cur) => {
    ['build', 'leveling'].forEach(key => {
      const ids = cur[key].glyphs.map(item => item.glyphs)
        .flat();
      pre.push(...ids);
    });
    return pre;
  }, []);

  glyphIds = [...new Set(glyphIds)];

  const results = await Promise.allSettled(glyphIds.map(async id => itemMapper.insertItem({
    id: id,
  }, 'wotlk')));
  console.log(results);
}

main();