import { BlizzAPI } from 'blizzapi';
import { configDotenv } from 'dotenv';

import path from 'path';
import { fileURLToPath } from 'url';

import { getDB } from '../../database/wow/init.js';

import useBisMapper from '../../database/wow/mapper/bisMapper.js';

let api;
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

  const db = await getDB();

  const data = await db.all(
    `
    SELECT * FROM wow_bis WHERE role_class=?1 and class_spec=?2`,
    [roleClass, classSpec]
  );
  async function mapBisItem(item) {
    const bisItemNames = item.bis_items.split('@');
    async function queryItem(name) {
      return db.get(
        `
        SELECT * FROM wow_item WHERE name=?1`,
        [name]
      );
    }
    const bisItemPromise = bisItemNames.map((item) => queryItem(item));
    const promisesData = await Promise.allSettled(bisItemPromise);
    return {
      ...item,
      bis_items: promisesData.map((res) => res.value),
      bis_trinkets: JSON.parse(item.bis_trinkets),
    };
  }
  const outputPromises = data.map((item) => mapBisItem(item));
  const outputReses = await Promise.allSettled(outputPromises);
  const output = outputReses.map((res) => res.value);

  res.json(output);
}
