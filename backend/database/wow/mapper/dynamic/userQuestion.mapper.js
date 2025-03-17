import { mapStringToList } from "../../../../util/stringListHandler.js";

let db;
const TABLE_NAME = 'wow_dynamic_user_question';

export async function insert(params) {
  const { id, wrong_list = null, mark_list = null, done_list = null } = params;
  return db.run(
    `INSERT INTO ${TABLE_NAME}(id, wrong_list, mark_list, done_list) VALUES(?1, ?2, ?3, ?4)`,
    [id, wrong_list, mark_list, done_list]
  );
}

export async function updateById(params) {
  const { id, wrong_list, mark_list, done_list } = params;
  return db.run(
    `UPDATE
      ${TABLE_NAME}
    SET wrong_list = CASE
      WHEN ?1 IS NOT NULL THEN ?1
      ELSE wrong_list
    END,
    mark_list = CASE
      WHEN ?2 IS NOT NULL THEN ?2
      ELSE mark_list
    END,
    done_list = CASE
      WHEN ?3 IS NOT NULL THEN ?3
      ELSE done_list
    END
    WHERE id=?4`,
    [wrong_list, mark_list, done_list, id]
  );
}

export async function getAllById(id) {
  const data = await db.get(`SELECT * FROM ${TABLE_NAME} WHERE id=?1`, [id]);
  if (data) {

    return {
      ...data,
      done_list: mapStringToList(data.done_list),
      wrong_list: mapStringToList(data.wrong_list),
      mark_list: mapStringToList(data.mark_list),
    }
  }
  return data;
}

export function useUserQuestionMapper(database) {
  if (database) {
    db = database;
    // 仅仅处理异常场景，正常使用 database都应该来源于外部
  } else {
    throw new Error('DB missing');
  }

  return {
    insert,
    updateById,
    getAllById,
  };
}
