import * as cheerio from 'cheerio';
import axios from 'axios';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const START_TIME = new Date('2025-03-05 8:00:00').getTime();
function getWeekCount() {
  return Math.ceil((Date.now() - START_TIME) / 3600 / 1000 / 24 / 7);
}
function getTableElements(context) {
  const $ = context;
  return $('.overflow-x-auto')
    .map((index, ele) => {
      const grid = $(ele).children().first();
      grid.children().first().remove();
      grid.children().first().remove();
      return grid;
    })
    .get();
}
function collectTable(context, table, tableIndex) {
  const $ = context;
  let type;
  if (tableIndex === 0) {
    type = 'dps';
  } else if (tableIndex === 1) {
    type = 'tank';
  } else {
    type = 'healer';
  }

  const specInfos = $(table)
    .children('a')
    .map((index, ele) => {
      let [classSpec, roleClass] = $(ele)
        .attr('href')
        .split('/')
        .pop()
        .split('-');
      if (classSpec === 'beast') {
        classSpec = 'beast-mastery';
        roleClass = 'hunter';
      } else if (roleClass === 'demon') {
        roleClass = 'demon-hunter';
      } else if (roleClass === 'death') {
        roleClass = 'death-knight';
      }
      const [avgWidth, topWidth] = $(ele)
        .find('div[style]')
        .map((index, bar) => {
          return $(bar).attr('style').split(':').pop().trim().replace(';', '');
        });
      return {
        avgWidth,
        topWidth,
        classSpec,
        roleClass,
      };
    })
    .get();
  const rank = $(table)
    .children('div')
    .map((index, ele) => {
      const tds = $(ele).children('div');
      return {
        diff: $(tds[1]).text().trim(),
        avg: $(tds[2]).text().trim(),
        top: $(tds[3]).text().trim(),
        runs: $(tds[4]).text().trim(),
        ...specInfos[index],
      };
    })
    .get();
  return {
    type,
    rank,
  };
}

export async function getSpecDpsRankData(week) {
  try {
    const maxWeek = getWeekCount();
    if (week > maxWeek) {
      throw new Error(`当前周数(${week})超出最大允许的值(${maxWeek})。`);
    }

    const period = `10${week < 10 ? `0${week}` : week}`;
    const filePath = path.resolve(__dirname, `./cache/${period}.html`);

    let html;
    if (fs.existsSync(filePath)) {
      html = fs.readFileSync(filePath, 'utf-8');
    } else {
      const res = await axios.get(
        `https://mythicstats.com/dps?dungeon=&period=${period}`
      );
      html = res.data;

      fs.writeFileSync(filePath, html, 'utf-8');
    }

    const $ = cheerio.load(html);
    const tables = getTableElements($);
    const data = tables.map((table, index) => collectTable($, table, index));
    return {
      name: '11+',
      data,
    };
  } catch (error) {
    console.log('获取专精DPS排行失败：' + error);
    return {
      name: '11+',
      data: [],
    };
  }
}
