import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDB } from '../../../utils/index.js';
import { useBisMapper } from '../../mapper/bisMapper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = await getDB();
const bisMapper = useBisMapper(db);

function adaptFlatList(propKey, filePath) {
  const rawData = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, filePath)),
  );

  return Object.entries(rawData).reduce(
    (pre, [roleClass, specItems]) => {
      specItems.forEach((item) => {
        pre.push({
          roleClass: roleClass,
          classSpec: item.spec,
          updatedAt: item.updatedAt,
          [propKey]: item.data,
        });
      });

      return pre;
    },
    [],
  );
}

async function updateItem(item, propKey) {
  const existed = await bisMapper.getBisByClassAndSpec(
    item.roleClass,
    item.classSpec,
  );
  existed.wowheadBis = JSON.parse(existed.wowhead_bis);

  console.log(`更新${item.classSpec} ${item.roleClass}...`);

  return bisMapper.updateBisByClassAndSpec({
    roleClass: item.roleClass,
    classSpec: item.classSpec,
    wowheadBis: {
      ...existed.wowheadBis,
      updatedAt: item.updatedAt,
      [propKey]: item[propKey],
    },
  });
}

async function main(propKey, filePath) {
  const flatList = adaptFlatList(propKey, filePath);
  await Promise.allSettled(
    flatList.map((item) => updateItem(item, propKey)),
  );
}

main('discBelt', './disc-belt/index.json');
