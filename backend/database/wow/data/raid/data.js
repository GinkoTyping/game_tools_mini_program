import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { getDB } from '../../../utils/index.js';
import { useRaidGuideMapper } from '../../mapper/raidGuide.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = await getDB();
const raidMapper = useRaidGuideMapper(db);
const data = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, './index.json'))
);

async function main() {
  await raidMapper.insertRaidGuild({
    id: 1296,
    name_zh: '解放安德麦',
    guide: JSON.stringify(data),
  });
}

main();
