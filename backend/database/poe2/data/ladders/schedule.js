import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { getDynamicPoeDB } from '../../../utils/index.js';
import { useLadderMapper } from '../../mapper/static/ladder.mapper.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const jsonPath = path.join(__dirname, '../../data/ladders/ladders.json');
const rawData = await fs.readFile(jsonPath, 'utf8');
const laddersData = JSON.parse(rawData);

const db = await getDynamicPoeDB();
const laddersMapper = useLadderMapper(db);
async function updateLadderItem(type, item) {
  const existingItem = await laddersMapper.getLaddersByRankType(
    type,
    Number(item[0])
  );

  if (existingItem) {
    return laddersMapper.updateLadders(type, item);
  }
  return laddersMapper.insertLadders(type, item);
}

function mapLadderType(index) {
  const types = ['standard', 'hc', 'ssf', 'hc_ssf'];
  return types[index];
}

async function updateLadderData() {
  try {
    const lists = laddersData.data.map((item, index) => {
      const request = item.data.map((row) =>
        laddersMapper.insertLadders(mapLadderType(index), row)
      );
      return request;
    });
    const results = await Promise.allSettled(lists.flat());
    const errors = results.filter((item) => item.status !== 'fulfilled');
    if (errors) {
      console.log('失败:' + errors.length);
    }
  } catch (err) {
    console.error('失败:', err);
    throw err;
  }
}

updateLadderData();
