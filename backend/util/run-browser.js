import * as cheerio from 'cheerio';
import axiosRetry from 'axios-retry';
import axios from 'axios';
import https from 'https';

import fs from 'fs';

const axiosInstance = axios.create();
axiosRetry(axiosInstance, {
  retries: 3,
  retryDelay: (retryCount, error) => {
    console.log(`重试第${retryCount}次触发: ${error?.config?.url}`);
    return 2000;
  },
  retryCondition: (error) =>
    error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT',
});
export async function useCheerioContext(
  staticFilePath,
  url,
  useCache,
  timeout
) {
  try {
    let html;
    if (fs.existsSync(staticFilePath) && useCache) {
      html = fs
        .readFileSync(staticFilePath, 'utf-8')

        // 删除script 和 iframe 标签，可以加速html文件加载
        .replace(/<\s*(script|iframe)\b[\s\S]*?<\/\1>/gi, '');
    } else {
      const httpsAgent = new https.Agent({
        family: 4, // 仅使用 IPv4
        keepAlive: false,
      });

      const res = await axiosInstance.get(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
        httpsAgent: httpsAgent,
        timeout: timeout ?? 30000, // 15秒超时
      });

      html = res.data;

      if (!fs.existsSync(staticFilePath)) {
        const identifier = staticFilePath.includes('/') ? '/' : '\\';
        const arr = staticFilePath.split(identifier);
        arr.pop();
        fs.mkdirSync(arr.join(identifier), { recursive: true });
      }
      fs.writeFileSync(staticFilePath, html, 'utf-8');
    }
    return cheerio.load(html);
  } catch (error) {
    console.log(error?.message);
    return null;
  }
}
