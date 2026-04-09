import axios from 'axios';
import { configDotenv } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
configDotenv('../.env');

function sendNotify(params) {
  const query = '?groupName=小程序&icon=https://ginkolearn.cyou/api/common/assets/media/wx-icon-thumb.jpg';
  let url = '';
  try {
    if (typeof params === 'string') {
      url = `https://api.day.app/${process.env.BARK_HASH}/小程序/${params}${query}`;
    } else {
      url = `https://api.day.app/${process.env.BARK_HASH}/${title}/${content}${query}`;
    }
    return axios.get(url);
  } catch (e) {
    console.log('bark消息失败：', e?.message);
  }
}

export const bark = {
  sendNotify,
};