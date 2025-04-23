import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDB } from '../../../../utils/index.js';
import { useBisMapper } from '../../../mapper/bisMapper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const puzzlingCartelChipData = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, `./index.json`))
);

const flatList = Object.entries(puzzlingCartelChipData).reduce(
  (pre, [roleClass, specItems]) => {
    specItems.forEach((item) => {
      pre.push({
        roleClass: roleClass,
        classSpec: item.spec,
        updatedAt: item.updatedAt,
        advice: item.advice,
      });
    });

    return pre;
  },
  []
);

const db = await getDB();
const bisMapper = useBisMapper(db);
async function updateItem(item) {
  return bisMapper.updateBisByClassAndSpec({
    roleClass: item.roleClass,
    classSpec: item.classSpec,
    wowheadBis: {
      updatedAt: item.updatedAt,
      advice: item.advice,
    },
  });
}

async function main() {
  const results = await Promise.allSettled(
    flatList.map((item) => updateItem(item))
  );
  return results;
}

main();
