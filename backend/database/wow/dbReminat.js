import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { getDB } from './init.js';
import { useDungeonTipMapper } from './mapper/dungeonTipMapper.js';

const database = await getDB();
const dungeonTipMapper = useDungeonTipMapper(database);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function exportDundegonTip() {
  const filePath = path.resolve(__dirname, './data/dungeon-tip.json');
  const data = await dungeonTipMapper.getAllDungeonTips();
  const parsedData = data.map((item) => ({
    ...item,
    tips: undefined,
    tips_en: JSON.parse(item.tips_en),
  }));

  fs.writeFileSync(
    path.resolve(__dirname, filePath),
    JSON.stringify(parsedData, null, 2),
    'utf-8'
  );
}

exportDundegonTip();
