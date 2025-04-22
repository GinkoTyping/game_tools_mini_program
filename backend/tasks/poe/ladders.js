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
  minute: 0,
  tz: 'Asia/Shanghai',
};

schedule.scheduleJob(complexRule, () => {
  console.log('定时任务 更新poe ladders:', new Date().toLocaleString());
  axios
    .post(
      'https://ginkolearn.cyou/api/poe/static/update-ladders',
      {
        useCache: false,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.ADMIN_TOKEN}`,
        },
      }
    )
    .then((res) => {
      console.log(res?.data?.message);
    })
    .catch((error) => {
      // 结构化错误日志
      const errorInfo = {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        url: error.config?.url,
      };
      console.error('API请求失败:', JSON.stringify(errorInfo, null, 2));
    });
});

console.log('自动化任务：更新poe ladders', new Date().toLocaleString());