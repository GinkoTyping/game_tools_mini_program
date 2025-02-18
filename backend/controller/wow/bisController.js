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

  // 访问次数 +1
  await bisMapper.updateBisByClassAndSpec({
    roleClass,
    classSpec,
    accessCount: bisData.access_count + 1,
  });

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
    };
  }
  async function mapBisItemsByType(bisItemsByType) {
    const promises = bisItemsByType.items
      .split('@')
      .map((item) => queryItem(item));
    const data = await Promise.allSettled(promises);
    return {
      title: bisItemsByType.title,
      items: data.map((item) => item.value),
    };
  }
  const promises = bisItems.map((item) => mapBisItemsByType(item));
  const bisItemResult = await Promise.allSettled(promises);
  return bisItemResult.map((item) => item.value);
}

export async function queryBisTrends(req, res) {
  const data = await bisMapper.getAllBis();
  const mappedData = data
    .reduce((pre, cur) => {
      const found = pre.find((item) => item.role_class === cur.role_class);
      if (found) {
        found.access_count += cur.access_count;
        found.specs.push({
          class_spec: cur.class_spec,
          access_count: cur.access_count,
        });
      } else {
        pre.push({
          role_class: cur.role_class,
          access_count: cur.access_count,
          specs: [
            { class_spec: cur.class_spec, access_count: cur.access_count },
          ],
        });
      }

      return pre;
    }, [])
    .sort((a, b) => b.access_count - a.access_count);

  res.json({
    trend: mappedData,
    sprite: {
      'death-knight': {
        blood: 0,
        frost: 1,
        unholy: 2,
        sort: 0,
      },
      'demon-hunter': {
        havoc: 0,
        vengeance: 1,
        sort: 1,
      },
      druid: {
        balance: 0,
        feral: 1,
        guardian: 2,
        restoration: 3,
        sort: 2,
      },
      mage: {
        arcane: 0,
        fire: 1,
        frost: 2,
        sort: 3,
      },
      monk: {
        brewmaster: 0,
        mistweaver: 1,
        windwalker: 2,
        sort: 4,
      },
      paladin: {
        holy: 0,
        protection: 1,
        retribution: 2,
        sort: 5,
      },
      rogue: {
        assassination: 0,
        outlaw: 1,
        subtlety: 2,
        sort: 6,
      },
      shaman: {
        elemental: 0,
        enhancement: 1,
        restoration: 2,
        sort: 7,
      },
      warlock: {
        affliction: 0,
        demonology: 1,
        destruction: 2,
        sort: 8,
      },
      warrior: {
        arms: 0,
        fury: 1,
        protection: 2,
        sort: 9,
      },
      evoker: {
        devastation: 2,
        preservation: 3,
        augmentation: 4,
        sort: 10,
      },
      hunter: {
        'beast-mastery': 0,
        marksmanship: 1,
        survival: 2,
        sort: 11,
      },
      priest: {
        discipline: 0,
        holy: 1,
        shadow: 2,
        sort: 12,
      },
    },
  });
}
