let db;
const TABLE_NAME = 'wow_wotlk_talent';

function objToString(obj) {
  return typeof obj === 'string' ? obj : JSON.stringify(obj);
}

async function addTalent(params) {
  const {
    id,
    role_class,
    talent_groups,
  } = params;
  return db.run(`INSERT
                     OR
                 REPLACE
                 INTO ${TABLE_NAME}
                 (id,
                  role_class,
                  talent_groups)
                 VALUES (?,
                         ?,
                         ?)`, [
    id,
    role_class,
    objToString(talent_groups),
  ]);
}

export async function getTalent(roleClass) {
  const data = await db.get(`SELECT *
                             FROM ${TABLE_NAME}
                             WHERE role_class = ?`, [roleClass]);
  if (data) {
    return {
      ...data,
      talent_groups: JSON.parse(data.talent_groups),
    };
  }
  return null;
}

export function useWotlkTalentMapper(database) {
  if (database) {
    db = database;
    // 仅仅处理异常场景，正常使用 database都应该来源于外部
  } else {
    throw new Error('DB missing');
  }

  return { addTalent, getTalent };
}