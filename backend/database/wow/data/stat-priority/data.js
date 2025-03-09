import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { getDB } from '../../../utils/index.js';
import { useBisMapper } from '../../mapper/bisMapper.js';
import { useDeepseek } from '../../../../../crawler/util/deepseek.js';

const db = await getDB();
const bisMapper = useBisMapper(db);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const statsData = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, 'index.json'))
);

const deepseek = useDeepseek(path.resolve(__dirname, 'translateCache.json'));

async function translateStatItem(item) {
  async function translate(info) {
    let text = await deepseek.translate(info.text);
    return {
      ...info,
      text,
    };
  }

  const results = await Promise.allSettled(
    item.overview.map((info) => translate(info))
  );
  return {
    ...item,
    overview: results.map((result) => result.value),
  };
}

async function main() {
  process.on('exit', () => deepseek.saveTranslationCache());
  process.on('SIGINT', () => {
    deepseek.saveTranslationCache().then(() => process.exit());
  });

  const tranlatedResults = await Promise.allSettled(
    statsData.map((item) => translateStatItem(item))
  );
  const translatedData = tranlatedResults.map((item) => item.value);
  deepseek.saveTranslationCache();

  const results = await Promise.allSettled(
    translatedData.map((item) =>
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
