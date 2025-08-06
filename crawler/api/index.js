import axios from 'axios';
import { configDotenv } from 'dotenv';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

configDotenv({ path: path.resolve(__dirname, '../.env') });
const BASE_URL = process.env.BACK_END_URL;

// 设置公共的请求头
axios.defaults.headers.common[
  'Authorization'
  ] = `Bearer ${process.env.LOCAL_TOKEN}`;

export async function translate(input) {
  const res = await axios.post(`${BASE_URL}/api/common/translate`, {
    text: input,
  });
  return res.data;
}

export async function querySpellByIds(ids) {
  const res = await axios.post(`${process.env.DEV_URL}/api/wow/spell`, {
    // 处理 126443:AJwA 类型的数据
    ids: ids.map((item) => item.split?.(':').shift() ?? item),
  });
  return res.data;
}

export async function queryAddSpell({ id, name }) {
  const res = await axios.post(`${process.env.DEV_URL}/api/wow/spell/add`, {
    id: id.split?.(':').shift() ?? id,
    idWowDB: id.split?.(':').shift() ?? id,
    nameEN: name,
  });

  return res.data;
}

export async function queryDungeon(name) {
  // 单独适配几个名次包含特殊符号的副本
  if (name === 'operation mechagon workshop') {
    name = 'Operation: Mechagon - Workshop';
  } else if (name === 'operation floodgate') {
    name = 'Operation: Floodgate';
  } else if (name === 'tazavesh streets of wonder') {
    name = 'Tazavesh: Streets of Wonder';
  } else if (name === 'tazavesh soleahs gambit') {
    name = 'Tazavesh: So\'leah\'s Gambit';
  } else if (name === 'eco dome aldani') {
    name = 'Eco-Dome Al\'dani';
  } else if (name === 'ara kara city of echoes') {
    name = 'Ara-Kara, City of Echoes';
  }

  const res = await axios.post(`${process.env.DEV_URL}/api/wow/dungeon/query`, {
    nameEN: name,
  });
  return res.data;
}

export async function queryItemById(id) {
  const res = await axios.get(
    `${process.env.DEV_URL}/api/wow/item/${Number(id)}`,
  );
  return res.data;
}

export async function queryRegsiterItem(params) {
  const res = await axios.post(
    `${process.env.DEV_URL}/api/wow/item/add`,
    params,
  );
  return res.data;
}

export async function queryUpdateItem(params) {
  const res = await axios.post(
    `${process.env.DEV_URL}/api/wow/item/update`,
    params,
  );
  return res.data;
}

export async function queryNpcByName(name) {
  const res = await axios.post(`${process.env.DEV_URL}/api/wow/npc/name-en`, {
    name: name,
  });

  return res.data;
}

export async function tryTranslateSpell(spell) {
  try {
    const { id, name } = spell;
    const data = await querySpellByIds([id]);
    if (data?.[0]) {
      return {
        ...spell,
        nameZH: data[0].name_zh,
        desc: data[0].description,
      };
    }
    await queryAddSpell({ id, name });
    console.log(`未找到技能ID: ${id}, 已注册`);
    return spell;
  } catch (error) {
    console.log(`翻译技能失败 ${spell.name}: ${error}`);
    return spell;
  }
}

export async function queryUpdateLadders(data) {
  const res = await axios.post(
    `${process.env.DEV_URL}/apistatic/update-ladders`,
    { data },
  );
  return res.data;
}
