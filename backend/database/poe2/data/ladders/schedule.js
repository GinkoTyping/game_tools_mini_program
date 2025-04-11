import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { getDynamicPoeDB } from '../../../utils/index.js';
import { useLadderMapper } from '../../mapper/static/ladder.mapper.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const jsonPath = path.join(__dirname, '../../data/ladders/ladders.json');
const rawData = await fs.readFile(jsonPath, 'utf8');
const laddersData = JSON.parse(rawData);

// const db = await getDynamicPoeDB();
// const laddersMapper = useLadderMapper(db);
let current = 0;
let total = 0;

async function updateLadderItem(type, item, mapper) {
  const result = await mapper.insertLadders(type, item);
  current++;
  console.log(`${result.changes ? '成功' : '失败'}: ${current}/ ${total}`);
}

function mapLadderType(index) {
  const types = [
    'DotH_standard',
    'DotH_hc',
    'DotH_ssf',
    'DotH_hc_ssf',
    'standard',
    'hc',
    'ssf',
    'hc_ssf',
  ];
  return types[index];
}

export async function updateLadderData(rawData, mapper) {
  try {
    const lists = rawData.map((item, index) => {
      const request = item.data.map((row) => {
        const className = row[3].split('|')[0];
        const classNameEn = row[3].split('|')[1];
        row.splice(3, 1, className, classNameEn);
        return updateLadderItem(mapLadderType(index), row, mapper);
      });
      return request;
    });

    const allList = lists.flat();
    total = allList.length;
    const results = await Promise.allSettled(allList);
    const errors = results.filter((item) => item.status !== 'fulfilled');
    if (errors) {
      console.log('失败:' + errors.length);
    }
  } catch (err) {
    console.error('失败:', err);
    throw err;
  }
}
