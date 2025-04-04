import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { formatDateByMinute } from '../../../../util/time.js';

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

async function getLaddersTop(type) {
  return db.all(
    `SELECT * FROM ${TABLE_NAME} WHERE type = ? ORDER BY rank ASC LIMIT 10`,
    [type]
  );
}

async function getLaddersByTypeAndPaging(params) {
  const { type, pageSize, lastRank } = params;
  return db.all(
    `SELECT * FROM ${TABLE_NAME} WHERE type=? AND rank > ? ORDER BY rank ASC LIMIT ?`,
    [type, lastRank, pageSize]
  );
}

async function insertLadders(type, params) {
  try {
    const [
      rank,
      account_name,
      character_name,
      class_name,
      class_name_en,
      level,
      experience,
    ] = params;

    return db.run(
      `INSERT OR REPLACE INTO ${TABLE_NAME} (rank, account_name, character_name, class_name, class_name_en, level, experience, type, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        rank,
        account_name,
        character_name,
        class_name,
        class_name_en,
        level,
        experience,
        type,
        formatDateByMinute(),
      ]
    );
  } catch (err) {
    console.error('读取JSON文件失败:', err);
    throw err;
  }
}

async function insertLaddersByList(rows) {
  const placeholders = rows.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?)').join(',');
  const values = rows.flatMap((row) => [
    row[0],
    row[1],
    row[2],
    row[3],
    row[4],
    row[5],
    row[6],
    row[7],
    row[8],
  ]);
  return db.run(
    `INSERT OR REPLACE INTO ${TABLE_NAME} (rank, account_name, character_name, class_name, class_name_en, level, experience, type, updated_at) VALUES ${placeholders}`,
    values
  );
}

async function updateLadders(type, params) {
  try {
    const [
      rank,
      account_name,
      character_name,
      class_name,
      class_name_en,
      level,
      experience,
    ] = params;

    return db.run(
      `UPDATE ${TABLE_NAME} SET account_name=?, character_name=?, class_name=?, class_name_en=?, level=?, experience=? WHERE rank=? AND type=?`,
      [
        account_name,
        character_name,
        class_name,
        class_name_en,
        level,
        experience,
        rank,
        type,
      ]
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

    getLaddersTop,
    getLaddersByAccountName,
    getLaddersByRankType,
    getLaddersByTypeAndPaging,

    insertLadders,
    insertLaddersByList,
    updateLadders,
  };
}
