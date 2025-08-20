let db;
const TABLE_NAME = 'wow_dynamic_mythic_dungeon_question_count';

async function getbyId(id) {
  return db.get(`SELECT *
                 FROM ${TABLE_NAME}
                 WHERE id = ?1`, [id]);
}

async function addById(id) {
  const dungeonCountItem = await getbyId(id);
  return db.run(`UPDATE ${TABLE_NAME}
                 SET count=?1
                 WHERE id = ?2`, [
    dungeonCountItem.count + 1,
    id,
  ]);
}

async function getList(ids) {
  let query = `SELECT *
               FROM ${TABLE_NAME}`;
  const params = [];

  if (ids && ids.length > 0) {
    // 生成占位符 (?, ?, ...) 并添加参数
    const placeholders = ids.map(() => '?').join(',');
    query += ` WHERE id IN (${placeholders})`;
    params.push(...ids);
  }

  return db.all(query, params);
}

export function useMythicDungeonQuestionCountMapper(database) {
  if (database) {
    db = database;
    // 仅仅处理异常场景，正常使用 database都应该来源于外部
  } else {
    throw new Error('DB missing');
  }

  return {
    getList,
    addById,
  };
}
