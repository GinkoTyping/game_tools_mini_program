import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import pLimit from 'p-limit';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import '../util/set-env.js';
import { translate } from '../api/index.js';

const specs = {
  'death-knight': ['blood', 'frost', 'unholy'],
  'demon-hunter': ['havoc', 'vengeance'],
  druid: ['balance', 'feral', 'guardian', 'restoration'],
  mage: ['arcane', 'fire', 'frost'],
  monk: ['brewmaster', 'mistweaver', 'windwalker'],
  paladin: ['holy', 'protection', 'retribution'],
  rogue: ['assassination', 'outlaw', 'subtlety'],
  shaman: ['elemental', 'enhancement', 'restoration'],
  warlock: ['affliction', 'demonology', 'destruction'],
  warrior: ['arms', 'fury', 'protection'],
  evoker: ['devastation', 'preservation', 'augmentation'],
  hunter: ['beast-mastery', 'marksmanship', 'survival'],
  priest: ['discipline', 'holy', 'shadow'],
};
let totalCount = 0;
let currentCount = 0;

async function collectBySpec(roleClass, classSpec) {
  console.log(`正在获取${classSpec} ${roleClass}的数据...`);
  let browser;
  try {
    let html;
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // 开发调测时，读取本地的静态文件
    if (process.env.IS_DEV) {
      const staticFilePath = process.env.DEV_FILE
        ? `./cache/${process.env.DEV_FILE}.html`
        : './cache/template.html';
      html = fs.readFileSync(path.resolve(__dirname, staticFilePath), 'utf-8');
    } else {
      const staticFilePath = `./cache/${classSpec}-${roleClass}.html`;
      if (fs.existsSync(path.resolve(__dirname, staticFilePath))) {
        html = fs.readFileSync(
          path.resolve(__dirname, staticFilePath),
          'utf-8'
        );
      } else {
        browser = await puppeteer.launch({
          headless: true,
          args: [
            '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36',
          ],
        });
        const page = await browser.newPage();

        //  勿使用代理
        await page.goto(
          `https://maxroll.gg/wow/class-guides/${classSpec}-${roleClass}-mythic-plus-guide`,
          {
            timeout: 120000,
          }
        );

        html = await page.content();
        fs.writeFileSync(
          path.resolve(__dirname, staticFilePath),
          html,
          'utf-8'
        );
      }
    }

    const $ = cheerio.load(html);

    const stats = await getStatsPriority($);
    const ratings = getSpecRating($);
    const dungeonTips = await getDungeonTips($);

    // 概率性出现 属性优先级数据获取失败
    if (!stats[0]?.stats.length) {
      console.log(`${classSpec} ${roleClass} 的属性优先级数据获取失败。`);
    }

    return { roleClass, classSpec, stats, ratings, dungeonTips };
  } catch (error) {
    console.error(error);
  } finally {
    currentCount++;
    console.log(
      `成功获取${classSpec} ${roleClass}的数据(${currentCount}/${totalCount})...`
    );
    await browser?.close?.();
  }
}

// 控制并发数量
const limit = pLimit(5);
async function crawler() {
  const crawlerPromises = Object.entries(specs).reduce(
    (pre, [roleClass, classSpecs]) => {
      totalCount += classSpecs.length;
      pre.push(
        ...classSpecs.map((spec) => limit(() => collectBySpec(roleClass, spec)))
      );
      return pre;
    },
    []
  );

  const data = await Promise.allSettled(crawlerPromises);

  saveFile(data.map((item) => item.value));
}

const OUTPUT_FILE_PATH = './output/output.json';
const BACKEND_OUTPUT_FILE_PATH = '../../backend/database/wow/data/maxroll.json';
function saveFile(data, isOverrideAll = false) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const filePath = path.resolve(__dirname, './output/output.json');
  let dataToWrite;
  if (!fs.existsSync(filePath) || isOverrideAll) {
    dataToWrite = data;
  } else {
    dataToWrite = JSON.parse(fs.readFileSync(filePath));
    data.forEach((item) => {
      let foundItemIndex = dataToWrite.findIndex(
        (existedItem) =>
          existedItem.roleClass === item.roleClass &&
          existedItem.classSpec === item.classSpec
      );
      if (foundItemIndex === -1) {
        dataToWrite.push(item);
      } else {
        dataToWrite.splice(foundItemIndex, 1, item);
      }
    });
  }
  [OUTPUT_FILE_PATH, BACKEND_OUTPUT_FILE_PATH].forEach((filePath) => {
    fs.writeFileSync(
      path.resolve(__dirname, filePath),
      JSON.stringify(dataToWrite, null, 2),
      'utf-8'
    );
  });
}

async function getStatsPriority(context) {
  const $ = context;
  // 0:= | 1: > | 2: >> | 10: >=
  const ICON_MAP = {
    'M8 6l16 10l-16 10': 1,
    'M8 12l16 0M8 20l16 0': 0,
    'M8 6l16 10l-16 10 M8 31l16 0': 10,
    'M2 6l16 10l-16 10 M14 6l16 10l-16 10': 2,
  };
  const STAT_MAP = {
    intellect: '智力',
    mastery: '精通',
    'critical strike': '暴击',
    haste: '急速',
    versatility: '全能',
    strength: '力量',
    agility: '敏捷',
  };
  const output = [];

  // 获取属性优先级
  $('div[data-wow-type="priority"]').each((index, element) => {
    const priority = {
      talentLabel: '',
      talentID: '',
      stats: [],
      relations: [],
      desc: [],
    };
    $(element)
      .find($('.mxt-stat span'))
      .each((childIndex, stat) => {
        priority.stats.push(STAT_MAP[$(stat).text().toLowerCase()]);
      });
    $(element)
      .find($('.mxt-relation path'))
      .each((childIndex, relation) => {
        priority.relations.push(ICON_MAP[$(relation).attr('d')]);
      });

    output.push(priority);
  });

  // 获取英雄专精和属性优先级的对应关系
  $('div[data-wow-type="priority"]')
    .first()
    .parentsUntil('#main-article')
    .last()
    .find('.wow-trait')
    .each((index, element) => {
      // 会获取到冗余的element
      if (index <= output.length - 1) {
        output[index].talentID = Number($(element).attr('data-wow-id'));
        output[index].talentLabel = $(element).text();
      }
    });

  // 获取属性优先级的讲解文本
  $('div[data-wow-type="priority"]')
    .first()
    .parentsUntil('#main-article')
    .last()
    .children()
    .last()
    .children()
    .each((index, element) => {
      if ($(element).children('ul').length && index <= output.length - 1) {
        $(element)
          .children('ul')
          .first()
          .children('li')
          .each((childIndex, descItem) => {
            output[index].desc.push($(descItem).text());
          });
      }
    });

  // 翻译属性优先级的讲解文本
  async function translateDesc(statDataItem, index) {
    if (statDataItem.desc.length) {
      const data = await translate(statDataItem.desc.join('||'));
      // 部分字段翻译有歧义，手动替换
      output[index].desc = data
        .replace('急躁', '急速')
        .replace('状态', '属性')
        .split('||');
    }
  }
  const translationPromises = output.map((item, index) =>
    translateDesc(item, index)
  );

  await Promise.allSettled(translationPromises);
  return output;
}

function getSpecRating(context) {
  const $ = context;
  const ratings = [
    {
      label: '单体',
      rating: 0,
    },
    {
      label: 'AOE',
      rating: 0,
    },
    {
      label: '功能性',
      rating: 0,
    },
    {
      label: '生存能力',
      rating: 0,
    },
    {
      label: '移动性',
      rating: 0,
    },
  ];
  // overview 部分
  $('#main-article')
    .children('div')
    .eq(2)
    // overview 部分 的左半边
    .children()
    .first()
    .children()
    .first()

    // rating面板
    .children()
    .last()
    .children()
    .last()
    .children()
    .last()
    .children()
    .each((index, element) => {
      ratings[index].rating = $(element)
        .find('div')
        .children()
        .filter((index, bar) => !$(bar).attr('class').includes('grey')).length;
    });

  return ratings;
}

async function getDungeonTips(context) {
  const $ = context;
  const data = [];
  // 设置地下城的分类
  $('#boss-tips-header')
    .parent()
    .parent()
    .siblings()
    .first()
    .children()
    .first()
    .children()
    .first()
    .children()
    .first()
    .children()
    .each((index, dungeonTab) => {
      data.push({ dungeonTitle: $(dungeonTab).text(), children: [] });
    });

  // 获取各个地下城的tips
  $('#boss-tips-header')
    .parent()
    .parent()
    .children()
    .each((dungeonIndex, tipsContainer) => {
      $(tipsContainer)
        .children()
        .each((index, element) => {
          if ($(element).is('h3')) {
            data[dungeonIndex].children.push({
              title: $(element).text(),
              children: [],
            });
          } else if ($(element).is('h4')) {
            data[dungeonIndex].children
              .at(-1)
              .children.push({ title: $(element).text(), children: [] });
          } else if ($(element).is('ul')) {
            if (data[dungeonIndex].children.at(-1).children.at(-1)?.title) {
              data[dungeonIndex].children.at(-1).children.at(-1).children =
                mapDescWithIcon($, element);
            } else {
              data[dungeonIndex].children
                .at(-1)
                .children.push(...mapDescWithIcon($, element));
            }
          }
        });
    });
  return data;
}

function mapDescWithIcon(context, element) {
  const $ = context;
  const children = [];
  $(element)
    .children()
    .each((index, desc) => {
      const spells = [];
      let liChildren = [];
      $(desc)
        .children('span')
        .each((index, element) => {
          if ($(element).find('span[data-wow-id]').length) {
            const id = Number(
              $(element).find('span[data-wow-id]').first().attr('data-wow-id')
            );
            spells.push({
              id: isNaN(id) ? null : id,
              title: $(element).find('.wow-gametip').first().text(),
            });
          }
        });
      if ($(desc).find('ul').length) {
        liChildren = mapDescWithIcon($, $(desc).find('ul').first());
      }

      // 获取基础的文本字段
      let totalText;
      if ($(element).find('mark').length) {
        totalText = $(element).find('mark').first().text();
      } else {
        $(desc).find('ul').first().remove();
        totalText = $(desc).text();
      }
      if (spells.length) {
        spells.forEach((spell) => {
          totalText = totalText.replace(spell.title, `[${spell.title}]`);
        });
      }

      children.push({
        totalText,
        spells,
        children: liChildren,
      });
    });
  return children;
}

crawler();
