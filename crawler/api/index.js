import axios from 'axios';
import { configDotenv } from 'dotenv';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
configDotenv({ path: path.resolve(__dirname, '../.env') });
const BASE_URL = process.env.BACK_END_URL;

export async function translate(input) {
  const res = await axios.post(`${BASE_URL}/api/common/translate`, {
    text: input,
  });
  return res.data;
}

export async function querySpellByIds(ids) {
  const res = await axios.post(`${process.env.DEV_URL}/api/wow/spell`, {
    ids: ids,
  });
  return res.data;
}

export async function queryAddSpell({ id, name }) {
  const res = await axios.post(`${process.env.DEV_URL}/api/wow/spell/add`, {
    id: id,
    idWowDB: id,
    nameEN: name,
  });

  return res.data;
}
