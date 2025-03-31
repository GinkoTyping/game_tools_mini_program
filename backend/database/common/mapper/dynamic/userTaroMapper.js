let db;

let TABLE_NAME = 'common_dynamic_user_tarot';

async function getUserTarotById(id) {
  const data = await db.get(`SELECT * FROM ${TABLE_NAME} WHERE id=?1`, [id]);
  if (data) {
    const tarot_list = data.tarot_list ? JSON.parse(data.tarot_list) : [];
    return {
      ...data,
      tarot_list,
    };
  }
  return null;
}

async function insertUserTarot(id, date, tarotId, isPositive) {
  try {
    const result = await db.run(
      `INSERT INTO ${TABLE_NAME}(id, tarot_list) VALUES(?1, ?2)`,
      [id, JSON.stringify([{ date, id: tarotId, isPositive }])]
    );
    if (!result?.changes) {
      console.log(`INSERT ${TABLE_NAME} 失败`);
    }

    return result;
  } catch (error) {
    console.log(`INSERT ${TABLE_NAME} 失败: ${error}`);
    return null;
  }
}

async function updateUserTarot(id, date, tarotId, isPositive) {
  try {
    const existed = await getUserTarotById(id);
    if (existed) {
      existed.tarot_list.push({ date, id: tarotId, isPositive });
      const result = await db.run(
        `UPDATE ${TABLE_NAME} SET tarot_list=?1 WHERE id=?2`,
        [JSON.stringify(existed.tarot_list), id]
      );
      if (!result?.changes) {
        console.log(`UPDATE ${TABLE_NAME} 失败`);
      }
      return result;
    }
    return null;
  } catch (error) {
    console.log(`UPDATE ${TABLE_NAME} 失败: ${error}`);
    return null;
  }
}

export function useUserTarotMapper(database) {
  if (database) {
    db = database;
    // 仅仅处理异常场景，正常使用 database都应该来源于外部
  } else {
    throw new Error('DB missing');
  }

  return { getUserTarotById, insertUserTarot, updateUserTarot };
}
