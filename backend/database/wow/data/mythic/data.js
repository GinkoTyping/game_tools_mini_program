import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { getDB } from '../../../utils/index.js';
import { useMythicDungeonMapper } from '../../mapper/mythicDungeonMapper.js';

const db = await getDB();
const mythicDungeonMapper = useMythicDungeonMapper(db);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const data = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, './mythic-dungeon.json'))
);

async function main() {
  await Promise.allSettled(data.map((item) => updateData(item)));
}

async function updateData(item) {
  const existed = await mythicDungeonMapper.getMythicDungeonById(
    item.dungeonId
  );
  const params = {
    id: item.dungeonId,
    routes: JSON.stringify(item.routes),
    ratings: JSON.stringify(item.ratings),
    utilityNeeds: JSON.stringify(item.utilityNeeds),
    enemyTips: JSON.stringify(item.enemyTips),
    lootPool: JSON.stringify(item.lootPool),
  };
  if (existed) {
    await mythicDungeonMapper.updateMythicDungeonById(params);
  } else {
    await mythicDungeonMapper.insertMythicDungeon(params);
  }
}

main();
