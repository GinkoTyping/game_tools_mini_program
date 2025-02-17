import { BlizzAPI } from 'blizzapi';
import { configDotenv } from 'dotenv';

import path from 'path';
import { fileURLToPath } from 'url';

import { getDB } from '../../database/utils/index.js';

import { useBisMapper } from '../../database/wow/mapper/bisMapper.js';
import { useItemMapper } from '../../database/wow/mapper/itemMapper.js';

let api;
const database = await getDB();
const bisMapper = useBisMapper(database);
const itemMapper = useItemMapper(database);
function setBlizzAPI() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  configDotenv({ path: path.resolve(__dirname, '../../.env') });
  api = new BlizzAPI({
    region: 'us',
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
  });
}
setBlizzAPI();

export async function getItemPreviewById(req, res) {
  const db = await getDB();
  const item = await db.get(
    `
  SELECT preview FROM wow_item WHERE id=?1`,
    [req.params.id]
  );
  if (item?.preview) {
    console.log('cached.', item.preview);
    res.json(JSON.parse(item.preview));
  } else {
    try {
      console.log('fetching data...');
      const data = await api.query(`/data/wow/item/${req.params.id}`, {
        params: {
          namespace: 'static-us',
          locale: 'zh_CN',
        },
      });

      if (item) {
        db.run(`UPDATE wow_item SET preview=?1 WHERE id=?2`, [
          JSON.stringify(data),
          data.id,
        ]);
      } else {
        db.run(`INSERT INTO wow_item(id, name, preview) VALUES(?1, ?2, ?3)`, [
          data.id,
          data.name,
          JSON.stringify(data),
        ]);
      }

      res.json(data);
    } catch (error) {
      console.log(error);
      res.json(null);
    }
  }
}

export async function getBisBySpec(req, res) {
  const roleClass = req.params.roleClass;
  const classSpec = req.params.classSpec;

  const bisData = await bisMapper.getBisByClassAndSpec(roleClass, classSpec);

  const bis_items = await mapBisItems(JSON.parse(bisData.bis_items));
  res.json({
    ...bisData,
    bis_items,
    stats_priority: JSON.parse(bisData.stats_priority),
    ratings: JSON.parse(bisData.ratings),
    bis_trinkets: JSON.parse(bisData.bis_trinkets),
  });
}

async function mapBisItems(bisItems) {
  async function queryItem(name) {
    const data = await itemMapper.getItemByName(name);
    return {
      ...data,
      source: JSON.parse(data.source),
    }
  }
  async function mapBisItemsByType(bisItemsByType) {
    const promises = bisItemsByType.items.split('@').map((item) => queryItem(item));
    const data = await Promise.allSettled(promises);
    return {
      title: bisItemsByType.title,
      items: data.map(item => item.value),
    };
  }
  const promises = bisItems.map((item) => mapBisItemsByType(item));
  const bisItemResult = await Promise.allSettled(promises);
  return bisItemResult.map((item) => item.value);
}
