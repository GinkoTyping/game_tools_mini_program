let db;
const TABLE_NAME = 'wow_playable_spec';
const TABLE_NAME_CLASS = 'wow_playable_class';

async function getSpecByNameEN(name, isMage) {
  let sql = `SELECT ${TABLE_NAME}.*,
                    wow_playable_class.name_zh AS class_name_zh,
                    wow_playable_class.name_en AS class_name_en
             FROM ${TABLE_NAME}
                      LEFT JOIN wow_playable_class ON wow_playable_class.id = ${TABLE_NAME}.class_id
             WHERE ${TABLE_NAME}.name_en = '${name.replace('-', ' ')}' COLLATE NOCASE;`;
  if (isMage !== undefined) {
    sql += ` AND class_id ${isMage ? '' : '!'}= 8`;
  }
  const spec = await db.get(sql);
  return {
    spec_id: spec.id,
    class_id: spec.class_id,
    spec_name_en: spec.name_en.toLowerCase().replace(/\s/g, '-'),
    spec_name_zh: spec.name_zh,
    class_name_en: spec.class_name_en.toLowerCase().replace(/\s/g, '-'),
    class_name_zh: spec.class_name_zh,
  };
}

function getPlayableClassList() {
  return db.all(`SELECT *
                 FROM ${TABLE_NAME_CLASS}`);
}

export function usePlayableRoleMapper(database) {
  if (database) {
    db = database;
    // 仅仅处理异常场景，正常使用 database都应该来源于外部
  } else {
    throw new Error('DB missing');
  }

  return { getSpecByNameEN, getPlayableClassList };
}