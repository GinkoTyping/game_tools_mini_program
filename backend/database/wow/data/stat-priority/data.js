import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { getDB } from '../../../utils/index.js';
import { useBisMapper } from '../../mapper/bisMapper.js';

const db = await getDB();
const bisMapper = useBisMapper(db);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const statsData = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, 'index.json'))
);

async function main() {
  const results = await Promise.allSettled(
    statsData.map((item) =>
      bisMapper.updateBisByClassAndSpec({
        roleClass: item.roleClass,
        classSpec: item.classSpec,
        detailedStats: { overview: item.overview, best: item.best },
      })
    )
  );
  const errors = results.filter((result) => result.status !== 'fulfilled');
  console.log(`更新属性优先级失败： ${errors.length}`);
}

main();
