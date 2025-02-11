import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url'; // 导入 fileURLToPath

import useBlizzAPI from '../../util/blizz.js';
import { useBisMapper } from './mapper/bisMapper.js';
import { useDungeonMapper } from './mapper/dungeonMapper.js';
import { useItemMapper } from './mapper/itemMapper.js';

const blizzAPI = useBlizzAPI();

// 获取当前文件的路径和目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const wowheadData = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, './data/wowhead.json'))
);
const maxrollData = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, './data/maxroll.json'))
);

const database = await getDB();
const bisMapper = await useBisMapper(database);
const dungeonMapper = useDungeonMapper(database);
const itemMapper = useItemMapper(database);
export async function getDB() {
  return open({
    filename: path.resolve(__dirname, './database.db'),
    driver: sqlite3.verbose().Database,
  });
}

//#region BIS
async function createBisTable(db) {
  if (!db) {
    throw new Error('DB missing.');
  }
  // bis_type 0：overall 1：raid 2：mythic
  await db.run(`
    CREATE TABLE IF NOT EXISTS wow_bis (
      id INTEGER PRIMARY KEY,
      role_class TEXT NOT NULL,
      class_spec TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      origin_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      stats_priority TEXT NOT NULL,
      ratings TEXT NOT NULL,
      bis_items TEXT NOT NULL,
      bis_trinkets TEXT NOT NULL
    )`);
  console.log('创建 wow_bis表 完成。');
}
async function updateWowheadData() {
  function mapItems(items) {
    return items
      .filter((item) => item.item.toLowerCase() !== 'item')
      .map((item) => item.item.trim())
      .join('@');
  }
  const formattedData = Object.entries(wowheadData).reduce(
    (pre, [roleClass, specs]) => {
      specs.forEach((spec) => {
        const bisItems = [
          {
            title: '汇总',
            items: mapItems(spec.overall),
          },
          {
            title: '大秘境',
            items: mapItems(spec.bisItemMythic),
          },
          {
            title: '团本',
            items: mapItems(spec.bisItemRaid),
          },
        ];
        pre.push({
          ...spec,
          roleClass,
          classSpec: spec.spec,
          bisItems,
          bisTrinkets: spec.trinkets,
        });
      });
      return pre;
    },
    []
  );
  const promises = formattedData.map((item) => updateBisItem(item));
  const result = await Promise.allSettled(promises);
  handleBisItemRes(result, 'wowhead');
}
async function updateMaxrollData() {
  const promises = maxrollData.map((item) => updateBisItem(item));
  const result = await Promise.allSettled(promises);
  handleBisItemRes(result, 'maxroll');
}
async function updateBisItem(dataItem) {
  try {
    const existedItem = await bisMapper.getBisByClassAndSpec(
      dataItem.roleClass,
      dataItem.classSpec
    );
    if (existedItem) {
      await bisMapper.updateBisByClassAndSpec(dataItem);
    } else {
      await bisMapper.insertBis(dataItem);
    }
  } catch (error) {
    return Promise.reject({
      roleClass: dataItem.roleClass,
      classSpec: dataItem.classSpec,
      message: error.message,
    });
  }
}
// 展示 更新数据库的结果 日志
function handleBisItemRes(result, tag) {
  const errors = result.filter((item) => item.status !== 'fulfilled');
  if (errors.length) {
    console.log(
      errors
        .map(
          (item) =>
            `插入失败：${item.value.classSpec} ${item.value.roleClass}, ${item.value.message}`
        )
        .join(';')
    );
  } else {
    console.log(`插入${tag}的数据成功。`);
  }
}
//#endregion

//#region 装备物品
async function createItemTable(db) {
  if (!db) {
    throw new Error('DB missing.');
  }
  await db.run(`
    CREATE TABLE IF NOT EXISTS wow_item (
      id INTEGER PRIMARY KEY NOT NULL,
      slot TEXT,
      name TEXT NOT NULL,
      source TEXT,
      image TEXT,
      preview TEXT
    )`);
  console.log('创建 wow_item表 完成。');
}
async function updateItemData() {
  function searchItems(output, items) {
    items.forEach((item) => {
      if (item.item === 'Item') {
        return;
      }
      const hasFound = output.some(
        (outputItem) => outputItem.item === item.item.trim()
      );
      if (!hasFound) {
        output.push(item);
      }
    });
    return output;
  }

  const slotItems = Object.values(wowheadData).reduce((pre, cur) => {
    cur.forEach((spec) => {
      pre = searchItems(pre, [
        ...spec.overall,
        ...spec.bisItemRaid,
        ...spec.bisItemMythic,
      ]);
    });
    return pre;
  }, []);

  async function updateItem(item) {
    const foundItem = await itemMapper.getItemById(item.id);

    if (foundItem) {
      await itemMapper.updateItemById(item);
    } else {
      try {
        await itemMapper.insertItem(item);
      } catch (error) {
        throw new Error({
          id: item.id,
          name: item.name,
          message: error.message,
        });
      }
    }
  }

  const updatePromises = slotItems.map((item) => updateItem(item));
  const result = await Promise.allSettled(updatePromises);
  const errors = result.filter((res) => res.status !== 'fulfilled');
  if (errors.length) {
    errors.forEach((errorItem) => {
      console.log(
        `插入 装备数据 失败：${errorItem.value.name}, ${errorItem.value.message}`
      );
    });
  } else {
    console.log('插入 装备数据 成功。');
  }
}
//#endregion

//#region 地下城
async function createDungeonTable(db) {
  if (!db) {
    throw new Error('DB missing.');
  }
  await db.run(`CREATE TABLE IF NOT EXISTS wow_dungeon (
    id INTEGER PRIMARY KEY NOT NULL,
    name_zh TEXT NOT NULL,
    name_en TEXT NOT NULL,
    booses TEXT
  )`);
  console.log('创建 wow_dungeon表 完成。');
}
async function updateDungeonData() {
  try {
    const data = await blizzAPI.query(
      '/data/wow/mythic-keystone/dungeon/index',
      {
        params: {
          namespace: 'dynamic-us',
        },
      }
    );
    async function insertDungeon(db, dungeon) {
      try {
        await dungeonMapper(dungeon.id, dungeon.name.zh_CN, dungeon.name.en_US);
        return { id: dungeon.id, message: 'Insert succeed.' };
      } catch (error) {
        return Promise.reject({ id: dungeon.id, message: error.message });
      }
    }

    const dungeonPromises = data.dungeons.map((dungeon) =>
      insertDungeon(db, dungeon)
    );
    const res = await Promise.allSettled(dungeonPromises);
    const hasError = res.filter((item) => item.status !== 'fulfilled');
    if (hasError.length) {
      console.log(
        `以下地下城插入表失败 :${hasError
          .map((item) => item.reason.id)
          .join(',')}`
      );
    }
  } catch (error) {
    console.log(error);
  }
}
//#endregion

export async function init() {
  try {
    createBisTable(database);
    updateWowheadData();
    updateMaxrollData();

    createItemTable(database);
    updateItemData();

    createDungeonTable(database);
    updateDungeonData();
  } catch (error) {
    console.log(error.message);
  } finally {
    database.close();
  }
}
