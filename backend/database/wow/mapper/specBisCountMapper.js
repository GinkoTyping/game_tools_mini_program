let db;

function getTableName(version) {
  return version === 'wotlk' ? 'wow_wotlk_dynamic_spec_bis_count' : 'wow_dynamic_spec_bis_count';
}

async function insertSpecBisCount(params) {
  const { count, role_class, class_spec } = params;
  return db.run(
    `INSERT INTO wow_dynamic_spec_bis_count(count, role_class, class_spec)
     VALUES (?1, ?2, ?3)`,
    [count, role_class, class_spec],
  );
}

async function getSpecBisCountByClassAndSpec(params) {
  const { roleClass, classSpec, version, type } = params;
  const tableName = getTableName(version);

  let sql = `SELECT *
             FROM ${tableName}
             WHERE role_class = ?
               AND class_spec = ?`;
  const options = [roleClass, classSpec];

  if (type && tableName === 'wow_wotlk_dynamic_spec_bis_count') {
    sql += ' AND type = ?';
    options.push(type);
  }

  return db.get(
    sql,
    options,
  );
}

async function addSpecBisCountByClassAndSpec(params) {
  const { roleClass, classSpec, version, type } = params;
  const tableName = getTableName(version);
  const item = await getSpecBisCountByClassAndSpec(params);
  const conut = item.count ?? 0;
  if (item) {
    await db.run(
      `UPDATE ${tableName}
       SET count=?1
       WHERE role_class = ?2
         AND class_spec = ?3`,
      [conut + 1, roleClass, classSpec],
    );
  }
}

async function getAllSpecBisCount(version = '') {
  const tableName = getTableName(version);
  return db.all(`SELECT *
                 FROM ${tableName}
                 ORDER BY count DESC`);
}

export function useSpecBisCountMapper(database) {
  if (database) {
    db = database;
    // 仅仅处理异常场景，正常使用 database都应该来源于外部
  } else {
    throw new Error('DB missing');
  }

  return {
    insertSpecBisCount,
    getAllSpecBisCount,
    getSpecBisCountByClassAndSpec,
    addSpecBisCountByClassAndSpec,
  };
}
