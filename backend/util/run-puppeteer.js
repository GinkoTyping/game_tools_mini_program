import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import './set-env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function getCheerioByPuppeteer({
  staticFilePath,
  urlPath,
  useCache,
  waitForSelector,
}) {
  let browser;
  try {
    let html;
    if (fs.existsSync(path.resolve(__dirname, staticFilePath)) && useCache) {
      html = fs.readFileSync(path.resolve(__dirname, staticFilePath), 'utf-8');
    } else {
      // puppeteer的waitUntil没有设置networkidle0 networkidle2 等，会导致异步加载的DOM无法获取，所以必须设置 selector
      if (!waitForSelector && waitForSelector !== null) {
        throw new Error('Empty selector!');
      }

      browser = await puppeteer.launch({
        headless: true,
        args: [
          // 适配 centos 使用：禁用沙盒 ,禁用 setuid 沙盒
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36',
        ],
      });
      const page = await browser.newPage();
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...');
      await page.setViewport({ width: 1280, height: 800 });
      if (onResponse) {
        page.on('response', (response) => {
          onResponse(response);
        });
      }

      await page.goto(urlPath, {
        // 缩短超时时间 避免软任务运行过长
        timeout: 30000,
        waitUntil: ['domcontentloaded'],
      });

      // 即使 Selectior 获取失败了，也不阻塞
      let hasGetSelector = false;
      if (waitForSelector) {
        try {
          await page.waitForSelector(waitForSelector, { timeout: 60000 });
          hasGetSelector = true;
        } catch (error) {
          console.error(`等待选择器失败: ${waitForSelector}`, error.message);
        }
      } else {
        try {
          await page.waitForNetworkIdle({
            idleTime: 500, timeout: 5000,
          });
        } catch (error) {
          console.error('等待网络空闲超时:', error.message);
        }
      }

      html = await page.content();

      // 没有获取到指定selector时，表面页面其实是异常的，不应该缓存
      if (!waitForSelector || (waitForSelector && hasGetSelector)) {
        fs.writeFileSync(
          path.resolve(__dirname, staticFilePath),
          html,
          'utf-8',
        );
      }
    }

    const $ = cheerio.load(html);
    return $;
  } catch (error) {
    console.error(error);
  } finally {
    await browser?.close?.();
  }
}
