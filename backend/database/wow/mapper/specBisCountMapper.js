let db;

async function insertSpecBisCount(params) {
  const { count, role_class, class_spec } = params;
  return db.run(
    `INSERT INTO wow_dynamic_spec_bis_count(count, role_class, class_spec) VALUES(?1, ?2, ?3)`,
    [count, role_class, class_spec]
  );
}

async function getSpecBisCountByClassAndSpec(params) {
  const { roleClass, classSpec } = params;
  return db.get(
    `SELECT * FROM wow_dynamic_spec_bis_count WHERE role_class = ?1 AND class_spec = ?2`,
    [roleClass, classSpec]
  );
}

async function addSpecBisCountByClassAndSpec(params) {
  const { roleClass, classSpec } = params;
  const item = await getSpecBisCountByClassAndSpec(params);
  if (item) {
    await db.run(
      `UPDATE wow_dynamic_spec_bis_count SET count=?1 WHERE role_class = ?2 AND class_spec = ?3`,
      [item.count + 1, roleClass, classSpec]
    );
  }
}

async function getAllSpecBisCount() {
  return db.all(`SELECT * FROM wow_dynamic_spec_bis_count ORDER BY count DESC`);
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
