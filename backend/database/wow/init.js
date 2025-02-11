import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url'; // 导入 fileURLToPath

import useBlizzAPI from '../../util/blizz.js';
import useBisMapper from './mapper/bisMapper.js';

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

let sqliteDB;
const bisMapper = await useBisMapper();
export async function getDB() {
  if (!sqliteDB) {
    sqliteDB = await open({
      filename: path.resolve(__dirname, './database.db'),
      driver: sqlite3.verbose().Database,
    });
  }

  return sqliteDB;
}

async function createTables() {
  try {
    // 打开数据库连接
    const db = await getDB();

    initBisTable(db);
    initItemTable(db);
    initDungeonTable(db);

    // 关闭连接
    await db.close();
  } catch (err) {
    console.error('数据库操作失败:', err);
  }
}

async function initBisTable(db) {
  if (!db) {
    db = await getDB();
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
}

async function initItemTable(db) {
  if (!db) {
    db = await getDB();
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
}

async function initDungeonTable(db) {
  if (!db) {
    db = await getDB();
  }
  await db.run(`CREATE TABLE IF NOT EXISTS wow_dungeon (
    id INTEGER PRIMARY KEY NOT NULL,
    name_zh TEXT NOT NULL,
    name_en TEXT NOT NULL,
    booses TEXT
  )`);

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
        await db.run(
          `INSERT INTO wow_dungeon(id, name_zh, name_en) VALUES(?1, ?2, ?3)`,
          [dungeon.id, dungeon.name.zh_CN, dungeon.name.en_US]
        );
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

async function updateItemData() {
  const db = await getDB();
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
    const foundItem = await db.get(
      `
      SELECT * FROM wow_item WHERE id=?1
      `,
      [item.id]
    );

    if (foundItem) {
      await db.run(
        `
        UPDATE wow_item SET slot=?1,name=?2,source=?3,image=?4 WHERE id=?5`,
        [
          item.slot,
          item.item,
          JSON.stringify(item.source),
          item.itemIcon,
          foundItem.id,
        ]
      );
    } else {
      try {
        await db.run(
          `
          INSERT INTO wow_item(id, slot, name, source, image) VALUES(?1, ?2, ?3, ?4, ?5)
        `,
          [
            item.id,
            item.slot,
            item.item,
            JSON.stringify(item.source),
            item.itemIcon,
          ]
        );
      } catch (error) {
        console.log(item);
      }
    }
  }

  const updatePromises = slotItems.map((item) => updateItem(item));
  await Promise.all(updatePromises);
}

async function updateSpecData() {
  const db = await getDB();

  Object.entries(wowheadData).forEach(([roleClass, specs]) => {
    specs.forEach((spec) => {
      function mapItems(items) {
        return items
          .filter((item) => item.item.toLowerCase() !== 'item')
          .map((item) => item.item.trim())
          .join('@');
      }
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

      const maxrollItem = maxrollData.find(
        (item) => item.roleClass === roleClass && item.classSpec === spec.spec
      );

      db.run(
        `
        INSERT INTO wow_bis(role_class, class_spec, stats_priority, ratings, bis_items, bis_trinkets) VALUES(?1, ?2, ?3, ?4, ?5, ?6)`,
        [
          roleClass,
          spec.spec,
          JSON.stringify(maxrollItem.stats),
          JSON.stringify(maxrollItem.ratings),
          JSON.stringify(bisItems),
          JSON.stringify(spec.trinkets),
        ]
      );
    });
  });
}

async function updateWowheadData(db) {
  if (!db) {
    db = await getDB();
  }
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
async function updateMaxrollData(db) {
  if (!db) {
    db = await getDB();
  }
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

export async function init() {
  await createTables();
  await updateItemData();
  await updateSpecData();
}
