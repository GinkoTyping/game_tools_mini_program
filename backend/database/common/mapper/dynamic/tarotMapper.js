import tarotData from '../../../wow/data/divination/tarot.js';

let db;
const TABLE_NAME = 'common_dynamic_tarot';
async function getTarotInfoById(id) {
  if (id) {
    return tarotData.find((item) => item.id === Number(id));
  }
  return null;
}

async function getTotalTarotCount() {
  const allDateData = await db.all(`SELECT * FROM ${TABLE_NAME}`);
  return allDateData.reduce((pre, cur) => {
    const tarotsCount = cur.tarots_count ? JSON.parse(cur.tarots_count) : [];
    const curTotal = tarotsCount.reduce((preTotal, curTarot) => {
      preTotal += curTarot.count;
      return preTotal;
    }, 0);

    pre += curTotal;
    return pre;
  }, 0);
}

async function getTarotCountByDateAndTarotId(date, tarotId) {
  const data = await db.get(`SELECT * FROM ${TABLE_NAME} WHERE date=?1`, [
    date,
  ]);
  let count = 0;
  let totalCount = 0;
  let tarots_count = [];
  if (data) {
    if (data.tarots_count) {
      const countData = JSON.parse(data.tarots_count);
      tarots_count = countData;
      const found = countData.find(
        (item) => Number(item.id) === Number(tarotId)
      );
      count = found?.count ?? 0;

      totalCount = countData.reduce((pre, cur) => {
        pre += cur.count;
        return pre;
      }, 0);
    }
  }
  return {
    count,
    totalCount,
    tarots_count,
  };
}

async function insertTartoCount(date, tarotId) {
  const defaultTarotCount = tarotData.map((item) => ({
    id: item.id,
    count: Number(item.id) === Number(tarotId) ? 1 : 0,
  }));
  return db.run(
    `INSERT INTO ${TABLE_NAME}(date, tarots_count) VALUES(?1, ?2)`,
    [date, JSON.stringify(defaultTarotCount)]
  );
}

async function updateTarotCount(date, tarotId) {
  try {
    if (!tarotId) {
      throw new Error('更新tarot失败，丢失tarotId');
    }
    const data = await getTarotCountByDateAndTarotId(date, tarotId);
    let tarotsCount;
    if (data.tarots_count) {
      tarotsCount = data.tarots_count;
      tarotsCount.some((item) => {
        if (Number(item.id) === Number(tarotId)) {
          item.count = Number(item.count) + 1;
          return true;
        }
        return false;
      });
    } else {
      tarotsCount = tarotData.map((item) => ({
        id: item.id,
        count: Number(item.id) === Number(tarotId) ? 1 : 0,
      }));
    }

    return db.run(`UPDATE ${TABLE_NAME} SET tarots_count=?1 WHERE date=?2`, [
      JSON.stringify(tarotsCount),
      date,
    ]);
  } catch (error) {
    console.log(error);
    return null;
  }
}

export function useTarotMapper(database) {
  if (database) {
    db = database;
    // 仅仅处理异常场景，正常使用 database都应该来源于外部
  } else {
    throw new Error('DB missing');
  }

  return {
    getTarotInfoById,
    getTotalTarotCount,
    getTarotCountByDateAndTarotId,
    insertTartoCount,
    updateTarotCount,
  };
}
