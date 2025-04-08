import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import '../util/set-env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function getCheerioByPuppeteer(staticFilePath, urlPath, useCache) {
  let browser;
  try {
    let html;
    if (fs.existsSync(path.resolve(__dirname, staticFilePath)) && useCache) {
      html = fs.readFileSync(path.resolve(__dirname, staticFilePath), 'utf-8');
    } else {
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36',
        ],
      });
      const page = await browser.newPage();
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...'
      );
      await page.setViewport({ width: 1280, height: 800 });
      await page.goto(urlPath, {
        timeout: 90000,
        waitUntil: ['domcontentloaded', 'networkidle0'],
      });
      html = await page.content();
      fs.writeFileSync(path.resolve(__dirname, staticFilePath), html, 'utf-8');
    }

    const $ = cheerio.load(html);
    return $;
  } catch (error) {
    console.error(error);
  } finally {
    await browser?.close?.();
  }
}
