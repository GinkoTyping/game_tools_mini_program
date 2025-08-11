import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import pLimit from 'p-limit';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import '../util/set-env.js';
import {
  queryAddSpell,
  queryItemById,
  queryRegsiterItem,
  querySpellByIds,
  queryUpdateItem,
  translate,
} from '../api/index.js';
import { mapSlotLabel } from '../util/map-slot-label.js';
import { downloadSingle } from '../util/download.js';

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let errorSpecs = [];

function collectError(roleClass, classSpec) {
  if (!errorSpecs.some((item) => item === `${classSpec}-${roleClass}`)) {
    errorSpecs.push(`${classSpec}-${roleClass}`);
  }
}

async function collectBySpec(roleClass, classSpec) {
  console.log(`正在获取${classSpec} ${roleClass}的数据...`);
  let browser;
  let page;
  try {
    let html;

    // 开发调测时，读取本地的静态文件
    if (process.env.IS_DEV) {
      const staticFilePath = process.env.DEV_FILE
        ? `./cache/spec/${process.env.DEV_FILE}.html`
        : './cache/spec/template.html';
      html = fs.readFileSync(path.resolve(__dirname, staticFilePath), 'utf-8');
    } else {
      const staticFilePath = `./cache/spec/${classSpec}-${roleClass}.html`;
      if (fs.existsSync(path.resolve(__dirname, staticFilePath))) {
        html = fs.readFileSync(
          path.resolve(__dirname, staticFilePath),
          'utf-8',
        );
      } else {
        browser = await puppeteer.launch({
          headless: true,
          args: [
            '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36',
          ],
          defaultViewport: {
            width: 1920, // 初始宽度
            height: 1080, // 初始高度
            deviceScaleFactor: 1.5, // 屏幕缩放比例（默认为1）
          },
        });
        page = await browser.newPage();

        function getURL() {
          return `https://maxroll.gg/wow/class-guides/${classSpec}-${roleClass}-mythic-plus-guide`;
        }

        //  勿使用代理
        await page.goto(getURL(), {
          timeout: 60000,
          waitUntil: ['domcontentloaded', 'networkidle2'],
        });

        html = await page.content();
        fs.writeFileSync(
          path.resolve(__dirname, staticFilePath),
          html,
          'utf-8',
        );
      }
    }

    const $ = cheerio.load(html);

    let stats;
    try {
      stats = await getStatsPriority($, page);
    } catch (error) {
      // 概率性出现 属性优先级数据获取失败
      if (!stats[0]?.stats.length) {
        collectError(roleClass, classSpec);
        console.log(
          `${classSpec} ${roleClass} 的属性优先级数据获取失败: ${error}`,
        );
      }
    }

    const ratings = getSpecRating($);
    const dungeonTips = await getDungeonTips($);
    const talents = await getTalentCode($, page, roleClass, classSpec);
    const enhancement = await getEnhancements($);

    if (!talents?.length) {
      console.log(`${classSpec} ${roleClass} 的天赋数据获取失败。`);
    }

    return {
      roleClass,
      classSpec,
      stats,
      ratings,
      dungeonTips,
      talents,
      enhancement,
    };
  } catch (error) {
    console.error(`获取失败：${classSpec} ${roleClass} - ${error}`);
  } finally {
    currentCount++;
    console.log(
      `成功获取${classSpec} ${roleClass}的数据(${currentCount}/${totalCount})...`,
    );
    await page?.close?.();
    await browser?.close?.();
  }
}

// 控制并发数量
const limit = pLimit(3);

async function crawler() {
  const crawlerPromises = Object.entries(specs).reduce(
    (pre, [roleClass, classSpecs]) => {
      totalCount += classSpecs.length;
      pre.push(
        ...classSpecs.map((spec) => limit(() => collectBySpec(roleClass, spec))),
      );
      return pre;
    },
    [],
  );

  const data = await Promise.allSettled(crawlerPromises);

  saveFile(data.map((item) => item.value));

  console.log(errorSpecs.join(','));
}

const OUTPUT_FILE_PATH = './output/bis/output.json';
const BACKEND_OUTPUT_FILE_PATH = '../../backend/database/wow/data/maxroll.json';

function saveFile(data, isOverrideAll = false) {
  if (!data) {
    return;
  }

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const filePath = path.resolve(__dirname, OUTPUT_FILE_PATH);
  let dataToWrite;
  if (!fs.existsSync(filePath) || isOverrideAll) {
    dataToWrite = data;
  } else {
    dataToWrite = JSON.parse(fs.readFileSync(filePath));
    data.forEach((item) => {
      let foundItemIndex = dataToWrite.findIndex(
        (existedItem) =>
          existedItem.roleClass === item.roleClass &&
          existedItem.classSpec === item.classSpec,
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
      'utf-8',
    );
  });
}

async function getStatsPriority(context, page) {
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

  if (page) {
    await page.waitForSelector('div[data-wow-type="priority"]');
  }

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

  if (output.filter((item) => item.desc?.length).length) {
    const translationPromises = output.map((item, index) =>
      translateDesc(item, index),
    );
    await Promise.allSettled(translationPromises);
  }

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

function handleAsyncDungeonTitle(title) {
  const lowerCaseTitle = title.toLowerCase();
  if (
    lowerCaseTitle.includes('mechagon') &&
    lowerCaseTitle.includes('junkyard')
  ) {
    title = 'Operation: Mechagon - Junkyard';
  } else if (lowerCaseTitle.includes('mechagon')) {
    title = 'Operation: Mechagon - Workshop';
  } else if (lowerCaseTitle.includes('the motherlode')) {
    title = 'The MOTHERLODE!!';
  } else if (lowerCaseTitle.includes('rookery')) {
    title = 'The Rookery';
  } else if (lowerCaseTitle.includes('cinderbrew')) {
    title = 'Cinderbrew Meadery';
  } else if (lowerCaseTitle.includes('sacred flame')) {
    title = 'Priory of the Sacred Flame';
  }
  return title;
}

async function getDungeonTips(context) {
  const $ = context;
  const data = [];
  let locateSeletor = $('#boss-tips-header').length
    ? '#boss-tips-header'
    : '#utility-header';

  // 设置地下城的分类
  $(locateSeletor)
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
      let dungeonTitle = handleAsyncDungeonTitle($(dungeonTab).text());

      data.push({ dungeonTitle, children: [] });
    });

  // 获取各个地下城的tips
  $(locateSeletor)
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
              $(element).find('span[data-wow-id]').first().attr('data-wow-id'),
            );
            spells.push({
              id: isNaN(id) ? null : id,
              title: $(element).find('.wow-gametip').first().text(),
            });
          }
        });
      if ($(desc).find('ul').length) {
        // 可能有多个UL
        $(desc)
          .find('ul')
          .each((index, ulEle) => {
            liChildren.push(...mapDescWithIcon($, $(ulEle)));
          });
      }

      // 获取基础的文本字段
      let totalText;
      $(desc)
        .find('ul')
        .each((index, ulEle) => {
          $(ulEle).remove();
        });
      totalText = $(desc).text();

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

async function getTalentCode(context, page, roleClass, classSpec) {
  const $ = context;
  const reference = $('#talents-header').parentsUntil('#main-article').last();
  let talentContainer;
  if (
    $(reference).next().attr('class')?.includes('clear-both') ||
    $(reference).next()[0]?.name !== 'div'
  ) {
    talentContainer = $(reference).next().next();
  } else {
    talentContainer = $(reference).next();
  }

  const talentMenu = $(talentContainer).children()[0];
  const talentTrees = $(talentContainer).children()[1];

  const talents = $(talentMenu)
    .find('div>span')
    .map((index, element) => {
      return {
        talent: $(element)
          .text()
          .trim()
          .replace(/^[\s\uFEFF\xA0\u200B\u200C\u200D\u2060]+/u, ''),
        url: [
          `${classSpec}-${roleClass}-${index}-class.jpg`,
          `${classSpec}-${roleClass}-${index}-hero.jpg`,
          `${classSpec}-${roleClass}-${index}-spec.jpg`,
        ],
        code: $(talentTrees)
          .children()
          .eq(index)
          .find('figure div[data-wow-data]')
          .first()
          .attr('data-wow-data'),
      };
    })
    .get();

  // boundingBox 每次的位置是固定的，以第一次的为准
  let activeTreeSelector;
  let boundingBox;
  if (page) {
    const containerChildIndex = await page.evaluate(() => {
      function findParentsUntil(ele, selector, output = []) {
        if (
          ele.parentNode?.id === selector.replace('#', '') ||
          !ele.parentNode
        ) {
          return output;
        }
        output.push(ele.parentNode);
        return findParentsUntil(ele.parentNode, selector, output);
      }

      function getIndexOfParent(parent, ele) {
        const children = parent.children; // 获取所有元素子节点
        for (let i = 0; i < children.length; i++) {
          if (children[i] === ele) {
            return i + 1; // 返回当前元素在子元素中的索引
          }
        }
      }

      const referenceEle = findParentsUntil(
        document.querySelector('#talents-header'),
        '#main-article',
      ).pop();
      const mainArticle = document.querySelector('#main-article');
      if (
        referenceEle.nextElementSibling.className.includes('clear-both') ||
        referenceEle.nextElementSibling.nodeName !== 'DIV'
      ) {
        return getIndexOfParent(
          mainArticle,
          referenceEle.nextElementSibling.nextElementSibling,
        );
      }
      return getIndexOfParent(mainArticle, referenceEle.nextElementSibling);
    });

    async function screenshotTalentTree(
      element,
      talentIndex,
      page,
      roleClass,
      classSpec,
    ) {
      try {
        if (!activeTreeSelector) {
          let parentClasses = $(element)
            .parentsUntil('#main-article')
            .map((index, elem) => {
              return $(elem).attr('class');
            })
            .get()
            .reverse();
          parentClasses.push($(element).attr('class'));
          parentClasses.push('mxt-content');
          parentClasses = parentClasses.map((item) => {
            return item
              .split(' ')
              .map((item) => `.${item}`)
              .join('');
          });
          activeTreeSelector = parentClasses.join(' ');
        }

        // 每次截图天赋树界面时，把其他天赋树隐藏；点击按钮切换的方式会导致页面滚动，导致截图位置偏移
        await page.waitForSelector(activeTreeSelector);
        await page.evaluate(
          (containerChildIndex, talentIndex) => {
            const talentTreesEle = document.querySelector(
              `#main-article>div:nth-child(${containerChildIndex})`,
            ).children[1];
            Array.from(talentTreesEle.children).forEach((item, index) => {
              item.style.display = talentIndex === index ? 'block' : 'none';
            });
          },
          containerChildIndex,
          talentIndex,
        );

        if (!boundingBox) {
          const eleHandler = await page.$(activeTreeSelector);
          boundingBox = await eleHandler.boundingBox();
        }

        async function screenshot(label, index) {
          let clip;
          switch (index) {
            case 0:
              clip = {
                ...boundingBox,
                width: boundingBox.width * 0.4,
              };
              break;
            case 1:
              clip = {
                ...boundingBox,
                x: boundingBox.x + boundingBox.width * 0.4,
                height: boundingBox.height * 0.775,
                width: boundingBox.width * 0.2,
              };
              break;
            case 2:
              clip = {
                ...boundingBox,
                x: boundingBox.x + boundingBox.width * 0.6,
                width: boundingBox.width * 0.4,
              };
              break;

            default:
              break;
          }

          // DH的截图偏上，未定位具体原因
          function handlerVengeanceDH(inputClip) {
            if (classSpec === 'vengeance') {
              inputClip.y += boundingBox.height * 0.1;
            }
            return inputClip;
          }

          clip = handlerVengeanceDH(clip);

          try {
            await page.screenshot({
              clip,
              path: path.resolve(
                __dirname,
                `../../backend/assets/wow/talent/${classSpec}-${roleClass}-${talentIndex}-${label}.jpg`,
              ),
              type: 'jpeg',
              quality: 100, // 质量参数，100为最高质量
            });
          } catch (error) {
            console.log(`获取天赋截图失败：${error.message}`);
          }
        }

        const downloadPromises = ['class', 'hero', 'spec'].map((item, index) =>
          screenshot(item, index),
        );

        await Promise.allSettled(downloadPromises);
      } catch (error) {
        console.log(`${classSpec}-${roleClass}: ${error}`);
      }
    }

    const treeFigures = $(talentTrees).children().find('figure');
    for (let i = 0; i < treeFigures.length; i++) {
      const element = treeFigures[i];

      // 每次截图前 就需要操作dom，所以不能并发
      await screenshotTalentTree(element, i, page, roleClass, classSpec);
    }
  }

  return talents.map((item) => ({
    ...item,
    selector: undefined,
  }));
}

//#region 附魔
function getRawEnhancement(context) {
  const $ = context;
  const reference = $('#enchantments-header');
  let enhancementContainer = reference.next();
  if (!enhancementContainer.find('figure').length) {
    enhancementContainer = enhancementContainer.next();
  }

  const enhancementTable = enhancementContainer.find('figure table tbody');
  const enhancementData = enhancementTable
    .find('tr')
    .map((index, ele) => {
      const slot = mapSlotLabel($(ele).children('td').first().text());
      const itemEle = $(ele).children('td').last();

      let items;
      const attrKey = itemEle.find('span[data-wow-item]').length
        ? 'data-wow-item'
        : 'data-wow-id';
      items = itemEle
        .find(`span[${attrKey}]`)
        .map((index, spanEle) => {
          const name = $(spanEle).text();
          const id = Number($(spanEle).attr(attrKey).split(':').shift());
          const backgroundImage = $(spanEle).find('.wow-icon').attr('style');
          const imageSrc = /url\(\s*["']?(.*?)["']?\s*\)/gi.exec(
            backgroundImage,
          )?.[1];
          return {
            id,
            name,
            type: attrKey === 'data-wow-item' ? 'item' : 'spell',
            image: imageSrc.split('/').pop(),
            imageSrc,
          };
        })
        .get();

      return {
        slot,
        items,
      };
    })
    .get();

  return enhancementData;
}

async function searchItem(item) {
  let output = { ...item };
  if (item.type === 'item') {
    const exsisted = await queryItemById(item.id);
    if (exsisted) {
      output = {
        ...output,
        name_zh: exsisted.name,
      };
      if (!exsisted.image) {
        const updateResult = await queryUpdateItem({
          id: item.id,
          image: item.image,
        });
        console.log(updateResult);
      }
    } else {
      const registerResult = await queryRegsiterItem({
        id: item.id,
        name: item.name,
        slot: item.slot,
        itemIcon: item.iamge,
      });
      console.log(
        `注册物品${registerResult.changes ? '成功' : '失败'}：${item.id}, ${
          item.name
        }`,
      );
    }
  } else {
    const exsisted = await querySpellByIds([item.id]);
    if (exsisted[0]) {
      output = {
        ...output,
        name_zh: exsisted[0].name_zh,
      };
    } else {
      const registerResult = await queryAddSpell({
        id: item.id,
        name: item.name,
      });
      console.log(
        `注册技能${registerResult.changes ? '成功' : '失败'}：${item.id}, ${
          item.name
        }`,
      );
    }
  }
  return output;
}

async function translateEnhancement(consumable) {
  const results = await Promise.allSettled(
    consumable.items.map((item) => searchItem(item)),
  );
  return {
    ...consumable,
    items: results.map((item) => item.value),
  };
}

function getItemImgPath(name) {
  return path.resolve(__dirname, `../../backend/assets/wow/items/${name}`);
}

function getSpellImgPath(name) {
  return path.resolve(__dirname, `../../backend/assets/wow/spellIcon/${name}`);
}

async function downloadEnhancementImages(consumableData) {
  const imagesUrl = consumableData.reduce((pre, cur) => {
    pre.push(...cur.items);
    return pre;
  }, []);
  const results = await Promise.allSettled(
    imagesUrl.map((item) =>
      downloadSingle(
        item.imageSrc,
        item.type === 'item'
          ? getItemImgPath(item.image)
          : getSpellImgPath(item.image),
      ),
    ),
  );
  results.forEach((item) => {
    if (item.status !== 'fulfilled') {
      console.log('图片下载失败');
    }
  });

  return results;
}

async function getEnhancements(context) {
  const rawData = getRawEnhancement(context);
  const translateResults = await Promise.allSettled(
    rawData.map((item) => translateEnhancement(item)),
  );
  const output = translateResults.map((item) => item.value);
  const downloadResult = await downloadEnhancementImages(output);

  return output;
}

//#endregion

//#region 消耗品和宝石 搁置
function mapConsumableType(key) {
  const lowerKey = key.toLowerCase();
  if (lowerKey.includes('phials')) {
    return '合剂';
  }
  if (lowerKey.includes('food')) {
    return '食物';
  }
  if (lowerKey.includes('oil')) {
    return '油';
  }
  if (lowerKey.includes('rune')) {
    return '强化符文';
  }
  if (lowerKey.includes('sockets')) {
    return '宝石';
  }
  if (lowerKey.includes('health')) {
    return '治疗药水';
  }
  if (lowerKey.includes('combat')) {
    return '战斗药水';
  }
  return key;
}

function getRawConsumables(context) {
  const $ = context;
  const reference = $('#consumables-header')
    .parentsUntil('#main-article')
    .last();
  let consumableUl = reference.next();
  while (reference.next()?.[0]?.name !== 'ul') {
    consumableUl = consumableUl.next();
  }

  function mapUlEle(ulEle) {
    return $(ulEle)
      .children('li')
      .map((index, liEle) => {
        const itemEle = $(liEle)
          .children('span')
          .find(`span[data-wow-item]`)
          .first();
        const name = itemEle.text();
        const id = itemEle.attr('data-wow-item').split(':').pop();
        const backgroundImage = itemEle.find('.wow-icon').attr('style');
        const imageSrc = /url\(\s*["']?(.*?)["']?\s*\)/gi.exec(
          backgroundImage,
        )?.[1];
        let children;

        if ($(liEle).children('ul').length) {
          children = mapUlEle($(liEle).children('ul').first());
        }
        return {
          id,
          name,
          type: 'item',
          children,
          imageSrc,
          image: imageSrc.split('/').pop(),
        };
      })
      .get();
  }

  const output = consumableUl
    .children('li')
    .last()
    .map((index, ele) => {
      const type = mapConsumableType($(ele).children('span').first().text());
      let children;

      if ($(ele).children('ul').length) {
        children = $(ele)
          .children('ul')
          .map((ulIndex, ulEle) => mapUlEle(ulEle))
          .get();
      }
      return { type, children };
    })
    .get();

  return output;
}

async function translateConsumable(data) {
  async function recursiveSearch(item) {
    const itemResult = await searchItem(item);
    let newChildren;
    if (item.children?.length) {
      newChildren = await Promise.allSettled(
        item.children.map((child) => recursiveSearch(child)),
      );
    }
    return {
      ...itemResult,
      children: newChildren,
    };
  }

  async function translateByType(type) {
    let results;
    if (type.children?.length) {
      results = await Promise.allSettled(
        type.children.map((item) => recursiveSearch(item)),
      );
    }
    return {
      ...type,
      children: results.map((result) => result.value),
    };
  }

  const translatedResults = await Promise.allSettled(
    data.map((item) => translateByType(item)),
  );

  return translatedResults.map((item) => item.value);
}

async function downloadConsumableImages(consumableData) {
  let imagesUrl = [];

  function recurseGetItem(item) {
    imagesUrl.push(item);
    if (item.chilren?.length) {
      item.chilren.forEach((child) => recurseGetItem(child));
    }
  }

  consumableData.forEach((item) => {
    item.children.forEach((child) => recurseGetItem(child));
  });

  const results = await Promise.allSettled(
    imagesUrl.map((item) =>
      downloadSingle(item.imageSrc, getItemImgPath(item.image)),
    ),
  );
  results.forEach((item) => {
    if (item.status !== 'fulfilled') {
      console.log('图片下载失败');
    }
  });

  return results;
}

async function getConsumables(context) {
  const rawData = getRawConsumables(context);
  const transaltedData = await translateConsumable(rawData);
  await downloadConsumableImages(transaltedData);
  return transaltedData;
}

//#endregion

crawler();
