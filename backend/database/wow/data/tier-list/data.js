import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { getDB } from '../../../utils/index.js';
import { useTierListMapper } from '../../mapper/tierListMapper.js';

const db = await getDB();
const tierListMapper = useTierListMapper(db);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function insertData() {
  const promises = [
    'mythic-ptr-dps-tier-list',
    'mythic-ptr-healer-tier-list',
    'mythic-ptr-tank-tier-list',
  ].map((filename) => insertTierList(filename));
  const results = await Promise.allSettled(promises);
  const errors = results.filter((result) => result.status !== 'fulfilled');
  if (errors.length) {
    console.log('Error inserting tier lists.');
  }
}

async function insertTierList(filename) {
  const tierListData = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, `./${filename}.json`)),
  );

  const tierLists = await tierListMapper.getTierListByVersion({
    versionId: tierListData.versionId,
    role: tierListData.role,
    activityType: tierListData.activityType,
  });
  const existed = tierLists.find(
    (item) => item.created_at === tierListData.updatedAt,
  );
  const params = {
    versionId: tierListData.versionId,
    activityType: tierListData.activityType,
    role: tierListData.role,
    createdAt: tierListData.updatedAt,
    tierData: JSON.stringify(tierListData.data),
  };
  if (existed) {
    await tierListMapper.updateTierList(params);
  } else {
    await tierListMapper.insertTierList(params);
  }
}

insertData();
