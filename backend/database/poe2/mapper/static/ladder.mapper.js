import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function getData() {
  try {
    const jsonPath = path.join(__dirname, '../../data/ladders/ladders.json');
    const rawData = await fs.readFile(jsonPath, 'utf8');
    const data = JSON.parse(rawData);
    return data;
  } catch (err) {
    console.error('读取JSON文件失败:', err);
    throw err;
  }
}

export function useLadderMapper() {
  return {
    getData,
  };
}
