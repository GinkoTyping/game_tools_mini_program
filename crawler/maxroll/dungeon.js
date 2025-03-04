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
    const { routes, ratings } = getRoutesAndRatings($);
    const utilityNeeds = getUtilityNeeds($);
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

//#region 大秘境路线 和 评分
function getRoutesAndContainer(ele) {
  if ($(ele).find('figure')?.length) {
    function getTitle(title) {
      return {
        enrage: '激怒',
        bleed: '流血',
        disease: '疾病',
        curse: '诅咒',
        'magic dispel': '魔法(防御驱散)',
        'magic purge': '魔法(进攻驱散)',
      };
    }

    const routes = $(ele)
      .children()
      .first()
      .find('span>span')
      .map((index, title) => {
        const currentTab = $(ele).children().eq(1).children().eq(index);

        return {
          title: getTitle($(title).text().trim()),
          imageSrc: $(currentTab).find('figure img').attr('src'),
          code: $(currentTab).find('code').text(),
        };
      })
      .get();
    return { routes, routeContainer: ele };
  }
  if ($(ele).next()?.length) {
    return getRoutesAndContainer($(ele).next());
  }
  return null;
}
function getDungeonRating(ele) {
  const ratings = $(ele)
    .find('>div')
    .children()
    .map((index, rating) => {
      const score =
        5 -
        $(rating)
          .children()
          .first()
          .find('span')
          .filter(function (i, el) {
            return $(this).attr('class').includes('bg-grey-425');
          }).length;
      let label;
      switch (index) {
        case 0:
          label = '高层钥匙';
          break;
        case 1:
          label = '集合石组队';
          break;
        case 2:
          label = '能力技、辅助技能需求';
          break;
        default:
          break;
      }
      let scoreText;
      if (score === 1) {
        scoreText = '简单';
      } else if (score <= 3) {
        scoreText = '中等';
      } else {
        scoreText = '困难';
      }
      return { label, score, scoreText };
    })
    .get();
  return ratings;
}
function getRoutesAndRatings(context) {
  const $ = context;
  const headerReference = $('#route-header')
    .parentsUntil('#main-article')
    .last();
  const { routes, routeContainer } = getRoutesAndContainer(headerReference);
  const ratings = getDungeonRating(routeContainer.next());

  return { routes, ratings };
}

//#endregion

function getUtilityNeeds(context) {
  const $ = context;
  const headerReference = $('#utility-needs-header')
    .parentsUntil('#main-article')
    .last();
  const utilityNeedsContainer = $(headerReference).next();

  const utilityNeeds = $(utilityNeedsContainer)
    .children()
    .first()
    .find('span>span')
    .map((index, ele) => {
      const output = {
        type: $(ele).text().trim(),
        spell: [],
        utility: [],
      };

      if ($(utilityNeedsContainer).children().length === 2) {
        const currentUtilityTab = $(utilityNeedsContainer)
          .children()
          .eq(1)
          .children()
          .eq(index);
        output.spell = currentUtilityTab
          .children()
          .first()
          .find('>li>span span[data-wow-id]')
          .map((spellIndex, spell) => {
            return {
              spellId: $(spell).attr('data-wow-id'),
              spellName: $(spell).text().trim(),
            };
          })
          .get();
        output.utility = currentUtilityTab
          .children()
          .last()
          .find('>li>ul>li')
          .map((utilityIndex, utility) => {
            const roleClass = $(utility)
              .children('span')
              .first()
              .text()
              .trim()
              .toLowerCase();
            const spellEle = $(utility)
              .children('ul')
              .children('li')
              .first()
              .find('span[data-wow-id]')
              .first();

            // TODO: spellid 为 126443:AJwA格式时，id是错误的
            const spellId = $(spellEle).attr('data-wow-id');
            const spellName = $(spellEle).text().trim();
            return { roleClass: roleClass, spellId, spellName };
          })
          .get();
      } else {
        console.log('能力技Tab页面的DOM结构不适配。');
      }
      return output;
    })
    .get();

  return utilityNeeds;
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
