import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import '../util/set-env.js';

async function collectSpellById(id) {
  const browser = await puppeteer.launch({
    timeout: 600000, // 60 秒超时
    headless: true,

    args: [
      // '--proxy-server=http://127.0.0.1:7897',
      '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36',
    ],
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(600000);
  page.on('requestfailed', (request) => {
    console.log('Request failed:', request.url(), request.failure().errorText);
  });
  await page.goto('https://www.baidu.com', {
    timeout: 600000, // 60 秒超时
  });

  const html = await page.content();
  console.log(html)
  await browser.close();
}
collectSpellById();
