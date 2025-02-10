import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import '../util/set-env.js';
import { translate } from '../api/index.js';

async function crawler() {
  let browser;
  try {
    let html;

    // 开发调测时，读取本地的静态文件
    if (process.env.IS_DEV) {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      html = fs.readFileSync(path.resolve(__dirname, './index.html'), 'utf-8');
    } else {
      browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();

      //  勿使用代理
      await page.goto(
        'https://maxroll.gg/wow/class-guides/augmentation-evoker-mythic-plus-guide',
        {
          timeout: 120000,
        }
      );

      html = await page.content();
    }

    const $ = cheerio.load(html);

    // const priority = await getStatsPriority($);
    // const ratings = getSpecRating($);
    // console.log('priority', priority);
    // console.log('ratings', ratings);

    const dungeonTips = await getDungeonTips($);
    console.log(dungeonTips);
  } catch (error) {
    console.error(error);
  } finally {
    await browser?.close?.();
  }
}

async function getStatsPriority(context) {
  const $ = context;
  // 0:= | 1: > | 2: >>
  const ICON_MAP = {
    'M8 6l16 10l-16 10': 1,
    'M2 6l16 10l-16 10 M14 6l16 10l-16 10': 2,
    'M8 12l16 0M8 20l16 0': 0,
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
  $('#boss-tips-header')
    .parent()
    .parent()
    .children()
    .each((index, tipsContainer) => {
      $(tipsContainer)
        .children()
        .each((index, element) => {
          if ($(element).is('h3')) {
            data.push({ title: $(element).text(), children: [] });
          } else if ($(element).is('h4')) {
            data
              .at(-1)
              .children.push({ title: $(element).text(), children: [] });
          } else if ($(element).is('ul')) {
            if (data.at(-1).children.at(-1)?.children) {
              data.at(-1).children.at(-1).children = mapDescWithIcon(
                $,
                element,
                data.at(-1).children.at(-1).children
              );
            } else {
              data.at(-1).children = mapDescWithIcon(
                $,
                element,
                data.at(-1).children
              );
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
      let totalText = $(desc).text();
      const spellTags = [];
      const enemySpellTags = [];
      let liChildren = [];
      $(desc)
        .children('span')
        .each((index, element) => {
          if ($(element).find('.wow-trait').length) {
            totalText.replace($(element).text(), `*${$(element).text()}*`);
            spellTags.push({
              id: $(element).find('.wow-trait').attr('data-wow-id'),
              title: $(element).text(),
            });
          } else if ($(element).find('.wow-spell').length) {
            totalText.replace($(element).text(), `@${$(element).text()}@`);
            enemySpellTags.push({
              id: $(element).find('.wow-spell').attr('data-wow-id'),
              title: $(element).text(),
            });
          }
        });
      if ($(desc).find('ul').length) {
        liChildren = mapDescWithIcon($, $(desc).find('ul'));
      }
      children.push({
        totalText,
        spellTags,
        enemySpellTags,
        children: liChildren,
      });
    });
  return children;
}

crawler();
