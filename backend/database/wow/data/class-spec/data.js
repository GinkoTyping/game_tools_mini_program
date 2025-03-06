import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { useClassSpecMapper } from '../../mapper/classSpecMapper.js';
import { getDB } from '../../../utils/index.js';

const db = await getDB();
const classSpecMapper = useClassSpecMapper(db);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const specData = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, 'spec.json'))
);
const classData = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, 'class.json'))
);

async function main() {
  await Promise.allSettled(
    specData.map((item) =>
      classSpecMapper.insertSpec({
        id: item.id,
        name_zh: item.name.zh_CN,
        name_en: item.name.en_US,
      })
    )
  );
  await Promise.allSettled(
    classData.map((item) =>
      classSpecMapper.insertClass({
        id: item.id,
        name_zh: item.name.zh_CN,
        name_en: item.name.en_US,
      })
    )
  );
}

main();
