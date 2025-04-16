import { BlizzAPI } from 'blizzapi';
import pLimit from 'p-limit';
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
import { classSpecMap } from '../../util/wow.js';
import { collectBisOverview } from '../../database/wow/data/archon-bis/crawler.js';

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
  if (!req.params.id || req.params.id === 'null') {
    res.status(404).json({ message: '物品的ID为空' });
    return;
  }

  const db = await getDB();
  const item = await db.get(
    `
  SELECT preview,source,image FROM wow_item WHERE id=?1`,
    [req.params.id]
  );
  if (item?.preview) {
    res.json({
      ...JSON.parse(item.preview),
      source: JSON.parse(item.source),
      image: item.image,
    });
  } else {
    try {
      const data = await queryBlizzItemById(req.params.id);

      if (item) {
        // 如果之前的装备名称是英文，也可以把英文名称更新为中文
        itemMapper.updateItemPreivewById(req.params.id, data);
      } else {
        const insertResult = await db.run(
          `INSERT INTO wow_item(id, name, preview) VALUES(?1, ?2, ?3)`,
          [data.id, data.name, JSON.stringify(data)]
        );
        console.log(
          `新增物品${insertResult?.changes ? '成功' : '失败'}: ${data.id},${
            data.name
          }`
        );
      }

      res.json(data);
    } catch (error) {
      console.log(error?.config?.url, error.response.statusText);
      res.statusCode = 404;
      res.json({ message: '获取物品信息失败' });
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
    archon_stats_priority: JSON.parse(bisData.archon_stats_priority),
    ratings: JSON.parse(bisData.ratings),
    bis_trinkets: JSON.parse(bisData.bis_trinkets),
    talents: JSON.parse(bisData.talents),
    enhancement: JSON.parse(bisData.enhancement),
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
      ...bisItemsByType,
      title: bisItemsByType.title,
      items: data.map((item) => item.value),
    };
  }
  const promises = bisItems.map((item) => mapBisItemsByType(item));
  const bisItemResult = await Promise.allSettled(promises);
  return bisItemResult.map((item) => item.value);
}

export async function getTrendData() {
  const data = await specBisCountMapper.getAllSpecBisCount();
  const updateInfo = await bisMapper.getAllBisDateInfo();
  const updateMap = updateInfo.reduce((pre, cur) => {
    if (pre[cur.role_class]) {
      pre[cur.role_class][cur.class_spec] = cur.updated_at;
    } else {
      pre[cur.role_class] = { [cur.class_spec]: cur.updated_at };
    }
    return pre;
  }, {});
  const mappedData = data
    .reduce((pre, cur) => {
      const found = pre.find((item) => item.role_class === cur.role_class);
      const updated_at = updateMap[cur.role_class][cur.class_spec];
      if (found) {
        found.access_count += cur.count;
        found.updated_at =
          updated_at > found.updated_at ? updated_at : found.updated_at;
        found.specs.push({
          class_spec: cur.class_spec,
          access_count: cur.count,
          updated_at,
        });
      } else {
        pre.push({
          role_class: cur.role_class,
          access_count: cur.count,
          updated_at,
          specs: [
            { class_spec: cur.class_spec, access_count: cur.count, updated_at },
          ],
        });
      }

      return pre;
    }, [])
    .sort((a, b) => b.access_count - a.access_count);
  return {
    trend: mappedData,
    sprite: spriteMap,
  };
}

export async function queryBisTrends(req, res) {
  const { trend, sprite } = await getTrendData();
  res.json({
    trend,
    sprite,
  });
}

export async function queryBlankSourceItem(req, res) {
  const data = await itemMapper.getBlankSourceItem();
  res.json(data);
}

export async function queryUpdateItem(req, res) {
  const { id, source, image } = req.body;
  const result = await itemMapper.updateItemById({
    id,
    source,
    itemIcon: image,
  });
  res.json(`更新物品${result.changes ? '成功' : '失败'}, ID:${id}`);
}

//#region 内部接口
export async function queryRegisterItem(req, res) {
  try {
    const data = await itemMapper.insertItem(req.body);
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
}

const limit = pLimit(5);
export async function queryUpdateArchonBisOverview(req, res) {
  try {
    const flatSpecs = Object.entries(classSpecMap).reduce(
      (pre, [roleClass, specs]) => {
        specs.forEach((spec) => {
          pre.push({ roleClass, classSpec: spec });
        });
        return pre;
      },
      []
    );

    const results = await Promise.allSettled(
      flatSpecs.map((item) =>
        limit(async () => {
          const data = await collectBisOverview(
            item.classSpec,
            item.roleClass,
            req.body.useCache
          );
          return bisMapper.updateOverviewBis(
            item.roleClass,
            item.classSpec,
            data
          );
        })
      )
    );
    const errors = results.filter((item) => item.status !== 'fulfilled');
    if (errors.length) {
      res.json({ message: '更新 ARCHON OVERVIEW 失败。' });
    } else {
      res.json({ message: '更新 ARCHON OVERVIEW 成功。' });
    }
  } catch (error) {
    res.status(500).json({ error: error?.message });
  }
}
//#endregion
