import axios from 'axios';
import { configDotenv } from 'dotenv';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
configDotenv({ path: path.resolve(__dirname, '../.env') });
const BASE_URL = process.env.BACK_END_URL;

export async function translate(input) {
  const res = await axios.post(`${BASE_URL}/common/translate`, {
    text: input,
  });
  return res.data;
}
