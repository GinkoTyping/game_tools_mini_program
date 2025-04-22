import schedule from 'node-schedule';
import axios from 'axios';

import path from 'path';
import { fileURLToPath } from 'url';

import { configDotenv } from 'dotenv';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
configDotenv({ path: path.resolve(__dirname, '../../.env') });

const complexRule = {
  hour: [6],
  minute: 0,
  tz: 'Asia/Shanghai',
};

schedule.scheduleJob(complexRule, () => {
  console.log('定时任务 更新archon tier list:', new Date().toLocaleString());
  axios
    .post(
      'https://ginkolearn.cyou/api/wow/tier-list/update',
      {
        useCache: false,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.ADMIN_TOKEN}`,
        },
      }
    )
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
