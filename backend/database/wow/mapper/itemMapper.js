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
    [slot, item, JSON.stringify(source), itemIcon, preview, id]
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
    updateItemById,
    getBlankSourceItem,
    getBlankImageItem,
    updateItemPreivewById,
  };
}
