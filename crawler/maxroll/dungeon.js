import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function collect(url) {
  let browser;
  try {
    let html;
    const staticFilePath = `./cache/mythic/${url}.html`;
    if (fs.existsSync(path.resolve(__dirname, staticFilePath))) {
      html = fs.readFileSync(path.resolve(__dirname, staticFilePath), 'utf-8');
    } else {
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36',
        ],
      });
      const page = await browser.newPage();
      await page.goto(`https://maxroll.gg/wow/dungeons/${url}`, {
        timeout: 90000,
        waitUntil: ['domcontentloaded', 'networkidle0'],
      });
      html = await page.content();
      fs.writeFileSync(path.resolve(__dirname, staticFilePath), html, 'utf-8');
    }

    const $ = cheerio.load(html);
    const routes = getRoutes($);
    // saveFile(data, url);
  } catch (error) {
    console.error(error);
  } finally {
    await browser?.close?.();
  }
}

function getMythicDungeon(context) {
  const $ = context;
}

function getRoutes(context) {
  const $ = context;
  const headerReference = $('#route-header').parentsUntil('#main-article').last();
  const routes = recurseFindRouteContainer(headerReference);
  function recurseFindRouteContainer(ele) {
    if ($(ele).find('figure')?.length) {
      const routes = $(ele)
        .children()
        .first()
        .find('span>span')
        .map((index, title) => {
          const currentTab = $(ele).children().eq(1).children().eq(index);

          return {
            title: $(title).text().trim(),
            imageSrc: $(currentTab).find('figure img').attr('src'),
            code: $(currentTab).find('code').text(),
          };
        })
        .get();
      return routes;
    }
    if ($(ele).next()?.length) {
      return recurseFindRouteContainer($(ele).next());
    }
    return null;
  }
  return routes;
}

function saveFile(data, fileName) {
  const outputPath = path.resolve(__dirname, `./output/${fileName}.json`);
  const copyPath = path.resolve(
    __dirname,
    `../../backend/database/wow/data/mythic/${fileName}.json`
  );
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');
  fs.writeFileSync(copyPath, JSON.stringify(data, null, 2), 'utf-8');
}

collect('theater-of-pain-guide');
