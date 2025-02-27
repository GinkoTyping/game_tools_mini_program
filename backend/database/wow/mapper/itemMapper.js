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
  const { id, slot, item, source, itemIcon } = itemData;
  return db.run(
    `
    UPDATE wow_item SET slot=?1,name=?2,source=?3,image=?4 WHERE id=?5`,
    [slot, item, JSON.stringify(source), itemIcon, id]
  );
}

async function updateItemPreivewById(id, preview) {
  return db.run(`UPDATE wow_item SET preview=?1, name=?2 WHERE id=?3`, [
    JSON.stringify(preview),
    preview.name,
    id,
  ]);
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
    updateItemById,
    updateItemPreivewById,
  };
}
