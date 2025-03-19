import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import '../util/set-env.js';

import localeLabels from '../util/class-spec-locales.js';

const URLS = [
  'high-mythic-plus-dps-tier-list',
  'high-mythic-plus-healer-tier-list',
  'high-mythic-plus-tank-tier-list',
];
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function collect(url) {
  let browser;
  try {
    let html;
    const staticFilePath = `./cache/tier-list/${url}.html`;
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
      await page.goto(`https://maxroll.gg/wow/tierlists/${url}`, {
        timeout: 90000,
        waitUntil: ['domcontentloaded', 'networkidle0'],
      });
      html = await page.content();
      fs.writeFileSync(path.resolve(__dirname, staticFilePath), html, 'utf-8');
    }

    const $ = cheerio.load(html);
    const data = getTierList($, url);
    console.log(data);

    saveFile(data, url);
  } catch (error) {
    console.error(error);
  } finally {
    await browser?.close?.();
  }
}

function getTierList(context, url) {
  const $ = context;
  const total = {
    updatedAt: getDate($('main>div:nth-child(2) .italic:nth-child(2)').text()),
    activityType: 'MYTHIC',
    role: url.split('-')[3].toUpperCase(),
    versionId: '11.1',
    data: [],
  };
  function getDate(dateString) {
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const parts = dateString.split(', ');
    const monthName = parts[0].trim().split(' ')[0];
    const day = parseInt(parts[0].trim().split(' ')[1]);
    const year = parseInt(parts[1]);

    const monthIndex = monthNames.indexOf(monthName) + 1;
    return `${year}/${monthIndex}/${day}`;
  }

  total.data = $('#main-article>div>.grid')
    .map((index, tierCol) => {
      const output = {
        tier: '',
        children: [],
      };
      output.tier = $(tierCol).find('h3').text().slice(0, 1);
      $(tierCol).children().first().remove();
      $(tierCol)
        .children()
        .each((index, ele) => {
          if (index % 2 === 0) {
            let dataChange = '-';
            const iconEle = $(ele).find('span.block').first();
            if (iconEle?.attr('class')?.includes('arrow-up')) {
              dataChange = 'up';
            } else {
              dataChange = 'down';
            }
            output.children.push({
              fullNameEN: '',
              roleClass: '',
              classSpec: '',
              dataChange,
              desc: '',
              descZH: '暂无排名解析，将尽快更新！',
              spells: [],
              fullNameZH: '',
            });
          } else {
            const fullNameEN = $(ele).find('span').eq(1).text().toLowerCase().trim();
            let classSpec;
            const stringArray = fullNameEN.split(' ');
            if (stringArray[0] === 'beast') {
              classSpec = 'beast-mastery';
              stringArray.shift();
              stringArray.shift();
            } else {
              classSpec = stringArray[0];
              stringArray.shift();
            }

            const roleClass = stringArray.join('-').trim();
            const fullNameZH = `${localeLabels[roleClass][classSpec]} ${localeLabels.class[roleClass]}`;

            output.children[output.children.length - 1] = {
              ...output.children[output.children.length - 1],
              fullNameEN,
              roleClass,
              classSpec,
              fullNameZH,
            };
          }
        });
      return output;
    })
    .get();
  return total;
}

function saveFile(data, fileName) {
  const outputPath = path.resolve(__dirname, `./output/tier-list/${fileName}.json`);
  const copyPath = path.resolve(
    __dirname,
    `../../backend/database/wow/data/tier-list/${fileName}.json`
  );
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');
  fs.writeFileSync(copyPath, JSON.stringify(data, null, 2), 'utf-8');
}

async function crawler() {
  const promises = URLS.map((item) => collect(item));
  const results = await Promise.allSettled(promises);
  console.log(results);
}

crawler();
