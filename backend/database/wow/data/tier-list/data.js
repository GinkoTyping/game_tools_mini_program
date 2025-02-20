import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { getDB } from '../../../utils/index.js';
import { useTierListMapper } from '../../mapper/tierListMapper.js';

const db = await getDB();
const tierListMapper = useTierListMapper(db);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tierListData = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, './mythic-ptr-dps-tier-list.json'))
);

async function insertData() {
  await tierListMapper.insertTierList({
    versionId: '11.1.0 - PTR',
    activityType: 'MYTHIC',
    role: 'DPS',
    tierData: JSON.stringify(tierListData),
  });
}

insertData();
