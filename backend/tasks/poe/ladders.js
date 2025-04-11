import schedule from 'node-schedule';
import axios from 'axios';

import path from 'path';
import { fileURLToPath } from 'url';

import { configDotenv } from 'dotenv';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
configDotenv({ path: path.resolve(__dirname, '../../.env') });

const complexRule = {
  hour: [0, 6, 10, 17, 22],
  tz: 'Asia/Shanghai',
};

schedule.scheduleJob(complexRule, () => {
  console.log('定时任务执行:', new Date().toLocaleString());
  axios.post('https://ginkolearn.cyou/api/poe/static/update-ladders', {
    useCache: false,
  }, {
    headers: {
      Authorization: `Bearer ${process.env.ADMIN_TOKEN}`
    }
  });
});
