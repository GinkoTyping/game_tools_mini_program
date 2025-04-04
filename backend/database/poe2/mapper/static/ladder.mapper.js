import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

let db;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TABLE_NAME = 'poe_dynamic_ladders';

async function getData() {
  try {
    const jsonPath = path.join(__dirname, '../../data/ladders/ladders.json');
    const rawData = await fs.readFile(jsonPath, 'utf8');
    const data = JSON.parse(rawData);
    return data;
  } catch (err) {
    console.error('读取JSON文件失败:', err);
    throw err;
  }
}

async function getLaddersByAccountName(params) {
  const { account_name, type } = params;
  if (account_name) {
    return db.get(
      `
      SELECT * FROM ${TABLE_NAME} WHERE account_name COLLATE NOCASE LIKE '%' || ? || '%' AND type=?`,
      [account_name, type]
    );
  }
  return null;
}

async function getLaddersByRankType(type, rank) {
  if (rank) {
    return db.get(
      `
      SELECT * FROM ${TABLE_NAME} WHERE rank = ? AND type=?`,
      [rank, type]
    );
  }
  return null;
}

async function insertLadders(type, params) {
  try {
    const [rank, account_name, character_name, class_name, level, experience] =
      params;

    return db.run(
      `INSERT OR REPLACE INTO ${TABLE_NAME} (rank, account_name, character_name, class_name, level, experience, type) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [rank, account_name, character_name, class_name, level, experience, type]
    );
  } catch (err) {
    console.error('读取JSON文件失败:', err);
    throw err;
  }
}

async function updateLadders(type, params) {
  try {
    const [rank, account_name, character_name, class_name, level, experience] =
      params;

    return db.run(
      `UPDATE ${TABLE_NAME} SET account_name=?, character_name=?, class_name=?, level=?, experience=? WHERE rank=? AND type=?`,
      [account_name, character_name, class_name, level, experience, rank, type]
    );
  } catch (err) {
    console.error('失败:', err);
    throw err;
  }
}

export function useLadderMapper(database) {
  if (database) {
    db = database;
    // 仅仅处理异常场景，正常使用 database都应该来源于外部
  } else {
    throw new Error('DB missing');
  }

  return {
    getData,

    getLaddersByAccountName,
    getLaddersByRankType,

    insertLadders,
    updateLadders,
  };
}
