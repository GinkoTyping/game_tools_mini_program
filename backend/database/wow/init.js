import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url'; // 导入 fileURLToPath

// 获取当前文件的路径和目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonData = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, './spec-data.json'))
);

export function getDB() {
  return open({
    filename: path.resolve(__dirname, './database.db'),
    driver: sqlite3.verbose().Database,
  });
}

async function createTables() {
  try {
    // 打开数据库连接
    const db = await getDB();

    // bis_type 0：overall 1：raid 2：mythic
    await db.exec(`
      CREATE TABLE IF NOT EXISTS wow_bis (
        id INTEGER PRIMARY KEY,
        role_class TEXT NOT NULL,
        class_spec TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        origin_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        stats_priority TEXT NOT NULL,
        bis_type INTEGER NOT NULL DEFAULT 0,
        bis_items TEXT NOT NULL,
        bis_trinkets TEXT NOT NULL
      )
    `);
    await db.run(`
      CREATE TABLE IF NOT EXISTS wow_item (
        id INTEGER PRIMARY KEY NOT NULL,
        slot TEXT,
        name TEXT NOT NULL,
        source TEXT,
        image TEXT,
        preview TEXT
      )
    `);

    // 查询数据
    const data = await db.all('SELECT * FROM wow_bis');

    // 关闭连接
    await db.close();
  } catch (err) {
    console.error('数据库操作失败:', err);
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

  const slotItems = Object.values(jsonData).reduce((pre, cur) => {
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

  Object.entries(jsonData).forEach(([roleClass, specs]) => {
    specs.forEach((spec) => {
      ['overall', 'bisItemRaid', 'bisItemMythic'].forEach((typeName) => {
        let type = 0;
        if (typeName === 'bisItemRaid') {
          type = 1;
        } else if (typeName === 'bisItemMythic') {
          type = 2;
        } else {
          type = 0;
        }

        db.run(
          `
          INSERT INTO wow_bis(role_class, class_spec, stats_priority, bis_type, bis_items, bis_trinkets) VALUES(?1, ?2, ?3, ?4, ?5, ?6)`,
          [
            roleClass,
            spec.spec,
            spec.statsPriority,
            type,
            spec[typeName]
              .filter((item) => item.item.toLowerCase() !== 'item')
              .map((item) => item.item.trim())
              .join('@'),
            JSON.stringify(spec.trinkets),
          ]
        );
      });
    });
  });
}

export async function init() {
  await createTables();
  await updateItemData();
  await updateSpecData();
}
