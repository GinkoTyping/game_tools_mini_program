import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

let db;

async function insertItem(itemData) {
  const { id, slot, item, source, itemIcon } = itemData;
  return db.run(
    `
    INSERT INTO wow_item(id, slot, name, source, image) VALUES(?1, ?2, ?3, ?4, ?5)
  `,
    [id, slot, item, JSON.stringify(source), itemIcon]
  );
}

async function getItemById(id) {
  return db.get(
    `
    SELECT * FROM wow_item WHERE id=?1
    `,
    [id]
  );
}

async function getItemByName(name) {
  return db.get(
    `
    SELECT * FROM wow_item WHERE name=?1
    `,
    [name]
  );
}

async function updateItemById(itemData) {
  const { id, slot, item, source, itemIcon, preview } = itemData;
  return db.run(
    `
    UPDATE wow_item
    SET
      slot = CASE
        WHEN ?1 IS NOT NULL THEN ?1
        ELSE slot
      END,
      name = CASE
        WHEN ?2 IS NOT NULL THEN ?2
        ELSE name
      END,
      source = CASE
        WHEN ?3 IS NOT NULL THEN ?3
        ELSE source
      END,
      image = CASE
        WHEN ?4 IS NOT NULL THEN ?4
        ELSE image
      END,
      preview = CASE
        WHEN ?5 IS NOT NULL THEN ?5
        ELSE preview
      END
    WHERE id=?6
    `,
    [
      slot,
      item,
      JSON.stringify(source),
      itemIcon,
      typeof preview === 'string' ? preview : JSON.stringify(preview),
      id,
    ]
  );
}

async function updateItemPreivewById(id, preview) {
  return db.run(`UPDATE wow_item SET preview=?1, name=?2 WHERE id=?3`, [
    JSON.stringify(preview),
    preview.name,
    id,
  ]);
}

async function getUntranslated() {
  return db.all(`SELECT *
  FROM wow_item
  WHERE name NOT GLOB '*[一-龥]*'`);
}

async function getBlankSourceItem() {
  return db.all(`SELECT id, source FROM wow_item WHERE source IS NULL`);
}

async function getBlankImageItem() {
  return db.all(`SELECT id, image FROM wow_item WHERE image IS NULL`);
}

async function getBlankSlotItem() {
  return db.all(`SELECT id, preview FROM wow_item WHERE slot IS NULL`);
}

async function getInvalidImageItem() {
  const data = await db.all(`SELECT id, image FROM wow_item`);

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  return data.filter((item) => {
    if (
      item.image &&
      fs.existsSync(
        path.resolve(
          __dirname,
          `../../../assets/wow/blizz-media-image/${item.image}`
        )
      )
    ) {
      return false;
    }
    return true;
  });
}

export function useItemMapper(database) {
  if (database) {
    db = database;
    // 仅仅处理异常场景，正常使用 database都应该来源于外部
  } else {
    throw new Error('DB missing');
  }

  return {
    insertItem,
    getItemById,
    getItemByName,
    getUntranslated,
    getBlankSlotItem,
    getInvalidImageItem,
    updateItemById,
    getBlankSourceItem,
    getBlankImageItem,
    updateItemPreivewById,
  };
}
