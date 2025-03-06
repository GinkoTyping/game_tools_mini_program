import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// TODO 游戏攻略等静态的数据 和 用户信息等动态的数据应该区分 database 存储
let _db = null;

export async function getDB() {
  if (!_db) {
    _db = await open({
      filename: path.resolve(__dirname, '../wow/database.db'),
      driver: sqlite3.verbose().Database,
    });
  }
  return _db;
}


let _dynamicDB = null;
export async function getDynamicDB() {
  if (!_commonDB) {
    _commonDB = await open({
      filename: path.resolve(__dirname, '../wow/dynamic-database.db'),
      driver: sqlite3.verbose().Database,
    });
  }
  return _commonDB;
}

let _commonDB = null;
export async function getCommonDB() {
  if (!_commonDB) {
    _commonDB = await open({
      filename: path.resolve(__dirname, '../common/database.db'),
      driver: sqlite3.verbose().Database,
    });
  }
  return _commonDB;
}