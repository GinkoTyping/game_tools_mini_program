import { BlizzAPI } from 'blizzapi';
import { configDotenv } from 'dotenv';

import path from 'path';
import { fileURLToPath } from 'url';

import { getDB } from '../../database/utils/index.js';
import { getDynamicDB } from '../../database/utils/index.js';

import { useBisMapper } from '../../database/wow/mapper/bisMapper.js';
import { useItemMapper } from '../../database/wow/mapper/itemMapper.js';
import { useSpecBisCountMapper } from '../../database/wow/mapper/specBisCountMapper.js';
import { isLocal } from '../../auth/validateAdmin.js';
import spriteMap from '../../assets/wow/sprites/sprite-map.js';

let api;
const database = await getDB();
const bisMapper = useBisMapper(database);
const itemMapper = useItemMapper(database);

const dynamicDB = await getDynamicDB();
const specBisCountMapper = useSpecBisCountMapper(dynamicDB);

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

export async function queryBlizzItemById(id) {
  return api.query(`/data/wow/item/${id}`, {
    params: {
      namespace: 'static-us',
      locale: 'zh_CN',
    },
  });
}

export async function getItemPreviewById(req, res) {
  const db = await getDB();
  const item = await db.get(
    `
  SELECT preview,source FROM wow_item WHERE id=?1`,
    [req.params.id]
  );
  if (item?.preview) {
    res.json({
      ...JSON.parse(item.preview),
      source: JSON.parse(item.source),
    });
  } else {
    try {
      const data = await queryBlizzItemById(req.params.id);

      if (item) {
        // 如果之前的装备名称是英文，也可以把英文名称更新为中文
        itemMapper.updateItemPreivewById(req.params.id, data);
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
      res.statusCode = 404;
      res.json({ message: '抱歉，11.1副本的装备数据暂未更新。' });
    }
  }
}

export async function getBisBySpec(req, res) {
  const roleClass = req.params.roleClass;
  const classSpec = req.params.classSpec;

  const bisData = await bisMapper.getBisByClassAndSpec(roleClass, classSpec);
  const bis_items = await mapBisItems(JSON.parse(bisData.bis_items));

  // 避免本地调测时，引起本地的数据和服务器不一致
  if (!isLocal(req)) {
    // 访问次数 +1
    await specBisCountMapper.addSpecBisCountByClassAndSpec({
      roleClass,
      classSpec,
    });
  }

  res.json({
    ...bisData,
    bis_items,
    stats_priority: JSON.parse(bisData.stats_priority),
    detailed_stats_priority: JSON.parse(bisData.detailed_stats_priority),
    ratings: JSON.parse(bisData.ratings),
    bis_trinkets: JSON.parse(bisData.bis_trinkets),
    talents: JSON.parse(bisData.talents),
  });
}

async function mapBisItems(bisItems) {
  async function queryItem(id) {
    // 避免返回的data为null，导致前台报错
    const data = (await itemMapper.getItemById(id)) ?? {
      slot: 'N/A',
      name: 'N/A',
      source: '{"source": "N/A"}',
    };
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

export async function getSortedBisTrend() {
  const data = await bisMapper.getAllBis();
  return data
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
}

export async function getSortedSpecsTrend() {
  const data = await bisMapper.getAllBis();
  return data.sort((a, b) => b.access_count - a.access_count);
}

export async function queryBisTrends(req, res) {
  const data = await specBisCountMapper.getAllSpecBisCount();
  const mappedData = data
    .reduce((pre, cur) => {
      const found = pre.find((item) => item.role_class === cur.role_class);

      if (found) {
        found.access_count += cur.count;
        found.specs.push({
          class_spec: cur.class_spec,
          access_count: cur.count,
        });
      } else {
        pre.push({
          role_class: cur.role_class,
          access_count: cur.count,
          specs: [{ class_spec: cur.class_spec, access_count: cur.count }],
        });
      }

      return pre;
    }, [])
    .sort((a, b) => b.access_count - a.access_count);

  res.json({
    trend: mappedData,
    sprite: spriteMap,
  });
}

export async function queryBlankSourceItem(req, res) {
  const data = await itemMapper.getBlankSourceItem();
  res.json(data);
}

export async function queryUpdateItem(req, res) {
  const { id, source } = req.body;
  await itemMapper.updateItemById({ id, source });
  res.json(`更新物品OK, ID:${id}`);
}
