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

async function getItemById(id, deletePreview) {
  const item = await db.get(
    `
    SELECT * FROM wow_item WHERE id=?1
    `,
    [id]
  );
  return deletePreview
    ? {
        ...item,
        preview: undefined,
        preview_en: undefined,
      }
    : item;
}

async function getItemByName(name, locale) {
  const nameKey = locale === 'en_US' ? 'name_en' : 'name';
  return db.get(
    `
    SELECT * FROM wow_item WHERE ${nameKey}=?1
    `,
    [name]
  );
}

async function updateItemById(itemData) {
  const { id, slot, item, source, itemIcon, preview, name_en, preview_en } =
    itemData;
  return db.run(
    `
    UPDATE wow_item
    SET
      slot = COALESCE(?, slot),
      name = COALESCE(?, name),
      source = COALESCE(?, source),
      image = COALESCE(?, image),
      preview = COALESCE(?, preview),
      name_en = COALESCE(?, name_en),
      preview_en = COALESCE(?, preview_en)
    WHERE id=?
    `,
    [
      slot,
      item,
      JSON.stringify(source),
      itemIcon,
      typeof preview === 'string' ? preview : JSON.stringify(preview),
      name_en,
      typeof preview_en === 'string' ? preview_en : JSON.stringify(preview_en),
      id,
    ]
  );
}

async function addOrUpdatePreviewById(id, preview, locale) {
  const previewKey = locale === 'en_US' ? 'preview_en' : 'preview';
  const nameKey = locale === 'en_US' ? 'name_en' : 'name';
  return db.run(
    `INSERT OR REPLACE INTO wow_item(id, ${previewKey}, ${nameKey}) VALUES(?, ?, ?)`,
    [id, JSON.stringify(preview), preview.name]
  );
}

async function updateItemPreivewById(id, preview, locale) {
  const previewKey = locale === 'en_US' ? 'preview_en' : 'preview';
  const nameKey = locale === 'en_US' ? 'name_en' : 'name';
  return db.run(
    `UPDATE wow_item SET ${previewKey}=?1, ${nameKey}=?2 WHERE id=?3`,
    [JSON.stringify(preview), preview.name, id]
  );
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

async function getBlankEnItem() {
  return db.all(
    `SELECT id, name_en, preview_en FROM wow_item WHERE name_en IS NULL AND preview_en is NULL`
  );
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
    getBlankEnItem,
    getInvalidImageItem,
    updateItemById,
    getBlankSourceItem,
    getBlankImageItem,
    addOrUpdatePreviewById,
    updateItemPreivewById,
  };
}
