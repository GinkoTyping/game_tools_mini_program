import * as cheerio from 'cheerio';
import axios from 'axios';

import fs from 'fs';

export async function useCheerioContext(staticFilePath, url) {
  try {
    let html;
    if (fs.existsSync(staticFilePath)) {
      html = fs
        .readFileSync(staticFilePath, 'utf-8')

        // 删除script 和 iframe 标签，可以加速html文件加载
        .replace(/<\s*(script|iframe)\b[\s\S]*?<\/\1>/gi, '');
    } else {
      const res = await axios.get(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      });
      html = res.data;
      fs.writeFileSync(staticFilePath, html, 'utf-8');
    }
    return cheerio.load(html);
  } catch (error) {
    console.log(error);
    return null;
  }
}
