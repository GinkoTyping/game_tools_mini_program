import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';

export function getDB() {
  return open({
    filename: './database.db',
    driver: sqlite3.verbose().Database
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
        slot_head TEXT NOT NULL,
        slot_neck TEXT NOT NULL,
        slot_shoulders TEXT NOT NULL,
        slot_cloak TEXT NOT NULL,
        slot_chest TEXT NOT NULL,
        slot_wrist TEXT NOT NULL,
        slot_gloves TEXT NOT NULL,
        slot_belt TEXT NOT NULL,
        slot_boots TEXT NOT NULL,
        slot_ring_0 TEXT NOT NULL,
        slot_ring_1 TEXT NOT NULL,
        slot_trinket_0 TEXT NOT NULL,
        slot_trinket_1 TEXT NOT NULL,
        slot_weapon_0 TEXT NOT NULL,
        slot_weapon_1 TEXT
      )
    `);
    await db.run(`
      CREATE TABLE IF NOT EXISTS wow_item (
        id INTEGER PRIMARY KEY NOT NULL,
        slot TEXT,
        name TEXT NOT NULL,
        source TEXT,
        image TEXT
      )
    `);

    // 插入初始数据
    // await db.run(
    //   'INSERT INTO wow_bis (title, content) VALUES (?, ?)',
    //   ['First Post', 'Hello SQLite!']
    // );
    // console.log('初始数据插入成功');

    // 查询数据
    const data = await db.all('SELECT * FROM wow_bis');
    console.log('data:', data);

    // 关闭连接
    await db.close();
  } catch (err) {
    console.error('数据库操作失败:', err);
  }
}

async function updateItemData() {
  const db = await getDB();
  const jsonData = JSON.parse(fs.readFileSync('./spec-data.json'));
  function searchItems(output, items) {
    items.forEach(item => {
      if (item.item === 'Item') {
        return;
      }
      const hasFound = output.some(outputItem => outputItem.item === item.item.trim());
      if (!hasFound) {
        // TODO 爬去数据时 就应该处理好
        output.push({
          slot: item.slot?.trim(),
          item: item.item?.trim(),
          source: item.source?.trim(),
          itemIcon: item.itemIcon?.trim(),
        });
      }
    });
    return output;
  }

  const slotItems = Object.values(jsonData).reduce((pre, cur) => {
    cur.forEach(spec => {
      pre = searchItems(pre, [...spec.overall, ...spec.bisItemRaid, ...spec.bisItemMythic]);
    });
    return pre;
  }, []);
  console.log(slotItems);

  try {
    slotItems.forEach(item => {
      console.log(item);
      
      db.run(`
        INSERT INTO wow_item(slot, name, source, image) VALUES(?1, ?2, ?3, ?4)
      `, [
        item.slot,
        item.item,
        item.source,
        item.itemIcon]);
    })
  } catch (error) {
    
  }

}

async function init() {
  await createTables();
  updateItemData();
}

init();