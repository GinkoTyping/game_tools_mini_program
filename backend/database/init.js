const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

export function getDB() {
  return open({
    filename: './mydatabase.db',
    driver: sqlite3.Database
  });
}

async function initDatabase() {
  try {
    // 打开数据库连接
    const db = await open({
      filename: './mydatabase.db',
      driver: sqlite3.Database
    });

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
        slot_head_img TEXT NOT NULL,
        slot_neck TEXT NOT NULL,
        slot_neck_img TEXT NOT NULL,
        slot_shoulders TEXT NOT NULL,
        slot_shoulders_img TEXT NOT NULL,
        slot_cloak TEXT NOT NULL,
        slot_cloak_img TEXT NOT NULL,
        slot_chest TEXT NOT NULL,
        slot_chest_img TEXT NOT NULL,
        slot_wrist TEXT NOT NULL,
        slot_wrist_img TEXT NOT NULL,
        slot_gloves TEXT NOT NULL,
        slot_gloves_img TEXT NOT NULL,
        slot_belt TEXT NOT NULL,
        slot_belt_img TEXT NOT NULL,
        slot_boots TEXT NOT NULL,
        slot_boots_img TEXT NOT NULL,
        slot_ring_0 TEXT NOT NULL,
        slot_ring_0_img TEXT NOT NULL,
        slot_ring_1 TEXT NOT NULL,
        slot_ring_1_img TEXT NOT NULL,
        slot_trinket_0 TEXT NOT NULL,
        slot_trinket_0_img TEXT NOT NULL,
        slot_trinket_1 TEXT NOT NULL,
        slot_trinket_1_img TEXT NOT NULL,
        slot_weapon_0 TEXT NOT NULL,
        slot_weapon_0_img TEXT NOT NULL,
        slot_weapon_1 TEXT,
        slot_weapon_1_img
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

initDatabase();