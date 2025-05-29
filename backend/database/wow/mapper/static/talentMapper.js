let db;
const TABLE_NAME = 'wow_talent';

async function getTalentList() {
  const data = await db.all(`SELECT *
                             FROM ${TABLE_NAME}`);
  if (data) {
    return data.map(item => {
      if (item) {
        return {
          ...item,
          class_talent_nodes: JSON.parse(item.class_talent_nodes),
          hero_talent_trees: JSON.parse(item.hero_talent_trees),
          spec_talent_nodes: JSON.parse(item.spec_talent_nodes),
          restriction_lines: JSON.parse(item.restriction_lines),
        };
      }
      return {};
    });
  }
  return [];
}

function objToString(obj) {
  return typeof obj === 'string' ? obj : JSON.stringify(obj);
}

async function addTalent(params) {
  const {
    playable_specialization,
    role_class,
    class_spec,
    class_talent_nodes,
    hero_talent_trees,
    spec_talent_nodes,
    restriction_lines,
  } = params;
  return db.run(`INSERT
                     OR
                 REPLACE
                 INTO ${TABLE_NAME}
                 (id,
                  role_class,
                  class_spec,
                  class_talent_nodes,
                  hero_talent_trees,
                  spec_talent_nodes,
                  restriction_lines)
                 VALUES (?,
                         ?,
                         ?,
                         ?,
                         ?,
                         ?,
                         ?)`, [
    playable_specialization.id,
    role_class,
    class_spec,
    objToString(class_talent_nodes),
    objToString(hero_talent_trees),
    objToString(spec_talent_nodes),
    objToString(restriction_lines),
  ]);
}

async function getTalentDev(classSpec) {
  return db.get(`SELECT *
                 FROM ${TABLE_NAME}
                 WHERE class_spec = ?`, [classSpec.toLowerCase().replace(' ', '-')]);
}

async function getTalent(classSpec, roleClass) {
  const data = await db.get(`SELECT *
                             FROM ${TABLE_NAME}
                             WHERE class_spec = ?
                               AND role_class = ?`, [classSpec, roleClass]);
  if (data) {
    return {
      ...data,
      class_talent_nodes: JSON.parse(data.class_talent_nodes),
      hero_talent_trees: JSON.parse(data.hero_talent_trees),
      spec_talent_nodes: JSON.parse(data.spec_talent_nodes),
      restriction_lines: JSON.parse(data.restriction_lines),
    };
  }
}

export function useTalentMapper(database) {
  if (database) {
    db = database;
    // 仅仅处理异常场景，正常使用 database都应该来源于外部
  } else {
    throw new Error('DB missing');
  }

  return { addTalent, getTalent, getTalentDev, getTalentList };
}