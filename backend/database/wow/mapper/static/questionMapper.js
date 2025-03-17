let db;
const TABLE_NAME = 'wow_question';

async function insertQuestion(params) {
  const { guide_id, guide_type, dungeon_id, question_text } = params;
  return db.run(
    `INSERT INTO wow_question(guide_id, guide_type, dungeon_id, question_text) VALUES(?1, ?2, ?3, ?4)`,
    [guide_id, guide_type, dungeon_id, question_text]
  );
}

async function updateQuestion(params) {
  const { guide_id, guide_type, dungeon_id, question_text } = params;
  return db.run(
    `UPDATE
      wow_question
    SET question_text = CASE
      WHEN ?1 IS NOT NULL THEN ?1
      ELSE question_text
    END,
    dungeon_id = CASE
      WHEN ?2 IS NOT NULL THEN ?2
      ELSE dungeon_id
    END
    WHERE guide_id=?3 AND guide_type=?4`,
    [question_text, dungeon_id, guide_id, guide_type]
  );
}

async function getQuestionByCondition(params) {
  const { guide_id, guide_type } = params;
  return db.get(
    `SELECT * FROM wow_question WHERE guide_id=?1 AND guide_type=?2`,
    [guide_id, guide_type]
  );
}

async function getQuestionsByDungeonId(dungeonId) {
  return db.all(`SELECT * FROM wow_question WHERE dungeon_id = ?1`, [
    dungeonId,
  ]);
}

async function getQuestionsByIds(ids) {
  if (ids?.length) {
    const sql = ids.reduce((pre, cur, index) => {
      if (index === 0) {
        pre += `id=?${index + 1} `;
      } else {
        pre += `OR id=?${index + 1} `;
      }
      return pre;
    }, `SELECT * FROM ${TABLE_NAME} WHERE `);

    return db.all(sql, ids);
  }
  return [];
}

async function getAllQuestions() {
  return db.all(`SELECT id, dungeon_id FROM ${TABLE_NAME}`);
}

export function useQuestionMapper(database) {
  if (database) {
    db = database;
    // 仅仅处理异常场景，正常使用 database都应该来源于外部
  } else {
    throw new Error('DB missing');
  }

  return {
    insertQuestion,
    updateQuestion,
    getAllQuestions,
    getQuestionsByIds,
    getQuestionByCondition,
    getQuestionsByDungeonId,
  };
}
