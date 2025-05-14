import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDB } from '../../../../utils/index.js';
import { useBisMapper } from '../../../mapper/bisMapper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const puzzlingCartelChipData = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, `./detailed.json`)),
);

const flatList = Object.entries(puzzlingCartelChipData).reduce(
  (pre, [roleClass, specItems]) => {
    specItems.forEach((item) => {
      pre.push({
        roleClass: roleClass,
        classSpec: item.spec,
        updatedAt: item.updatedAt,
        puzzlingCartelChipAdvice: item.advice,
      });
    });

    return pre;
  },
  [],
);

const db = await getDB();
const bisMapper = useBisMapper(db);

async function updateItem(item) {
  const exisited = await bisMapper.getBisByClassAndSpec(
    item.roleClass,
    item.classSpec,
  );
  exisited.wowheadBis = JSON.parse(exisited.wowhead_bis)
  const lastUpdatedAt = exisited.wowheadBis?.updatedAt;
  if (lastUpdatedAt === item.updatedAt) {
    // return null;
  }

  console.log(`更新${item.classSpec} ${item.roleClass}： ${lastUpdatedAt} => ${item.puzzlingCartelChipAdvice}`);

  return bisMapper.updateBisByClassAndSpec({
    roleClass: item.roleClass,
    classSpec: item.classSpec,
    wowheadBis: {
      ...exisited.wowheadBis,
      updatedAt: item.updatedAt,
      detailedPuzzlingCartelChipAdvice: item.puzzlingCartelChipAdvice,
    },
  });
}

async function main() {
  const results = await Promise.allSettled(
    flatList.map((item) => updateItem(item)),
  );
  return results;
}

main();
