import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { getDB } from '../../../utils/index.js';
import { useWotlkBisMapper } from '../../mapper/static/wotlkBisMapper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const data = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, './wowhead.json')));

const db = await getDB();
const wotlkBisMapper = useWotlkBisMapper(db);

async function main() {
  const results = await Promise.allSettled(data.map(async item => {
    return wotlkBisMapper.addBis({
      role_class: item.roleClass,
      class_spec: item.classSpec,
      type: item.type,
      talent: {
        build: item.build,
        leveling: item.leveling,
      },
    });
  }));
  console.log(results);
}

main();