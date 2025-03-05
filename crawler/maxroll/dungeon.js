import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import Bottleneck from 'bottleneck';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  queryAddSpell,
  queryDungeon,
  queryItemById,
  querySpellByIds,
} from '../api/index.js';
import '../util/set-env.js';
import { useDeepseek } from '../util/deepseek.js';
import { downloadSingle } from '../util/download.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const deepseek = useDeepseek(
  path.resolve(__dirname, './cache/translate/index.json')
);

//#region 大秘境路线 和 评分
async function getDungeonData(url) {
  const dungeonNameFomatted = url
    .split('-')
    .slice(0, url.split('-').length - 1)
    .join(' ');
  return queryDungeon(dungeonNameFomatted);
}

function getRoutesAndContainer(context, ele, dungeonName) {
  const $ = context;
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
    return { routes, routeContainer: ele };
  }
  if ($(ele).next()?.length) {
    return getRoutesAndContainer($, $(ele).next());
  }
  return null;
}
function getDungeonRating(context, ele) {
  const $ = context;
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
async function getRoutesAndRatings(context, dungeonName) {
  const $ = context;
  const headerReference = $('#route-header')
    .parentsUntil('#main-article')
    .last();
  const { routes, routeContainer } = getRoutesAndContainer(
    $,
    headerReference,
    dungeonName
  );
  const ratings = getDungeonRating($, routeContainer.next());

  await Promise.allSettled(
    routes.map((item) =>
      downloadSingle(
        item.imageSrc,
        path.resolve(
          __dirname,
          `../../backend/assets/wow/mythic-route/${dungeonName}-${item.title}.webp`
        )
      )
    )
  );

  return { routes, ratings };
}
//#endregion

//#region 能力技要求
function getTitle(title) {
  const locales = {
    enrage: '激怒',
    bleed: '流血',
    disease: '疾病',
    curse: '诅咒',
    'magic dispel': '魔法(防御驱散)',
    'magic purge': '魔法(进攻驱散)',
  };
  return locales[title.toLowerCase()];
}
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
        type: getTitle($(ele).text().trim()),
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
//#endregion

//#region BOSS 及 小怪处理
function getBossAndTrashSeletors(context) {
  const $ = context;
  return $('aside')
    .first()
    .find('div>a')
    .map((i, ele) => {
      return $(ele).attr('href').replaceAll("'", "\\'").replaceAll(',', '\\,');
    })
    .get()
    .filter(
      (selector) =>
        ![
          '#route-header',
          '#utility-needs-header',
          '#lootpool-header',
          '#changelog-header',
        ].includes(selector)
    );
}
async function getBossAndTrashTitle(context, dungeonData, selector) {
  const $ = context;
  const title = $(selector).text().trim().toLowerCase();
  const type = title.includes('trash area') ? 'trash' : 'boss';
  let translatedTitle = title.includes('trash area') ? '前的小怪' : '';
  const bossName = title.replace('trash area', '').trim();

  const bossNameZH = JSON.parse(dungeonData?.bosses)?.find(
    (item) => item.name.en_US.toLowerCase() === bossName
  )?.name.zh_CN;

  translatedTitle = `"${bossNameZH}"${translatedTitle}`;
  return { title: translatedTitle, type };
}

async function translateSpellName(spell) {
  const { id, name } = spell;
  const data = await querySpellByIds([id]);
  if (data?.[0]) {
    return { ...spell, nameZH: data[0].name_zh };
  }
  await queryAddSpell({ id, name });
  console.log(`未找到技能ID: ${id}, 已注册`);
  return spell;
}

async function traverseCollectUl(context, ulEle) {
  const $ = context;
  const liEles = $(ulEle).children('li').get();
  const results = await Promise.allSettled(
    liEles.map((liEle) => translateSpellsInText(context, liEle))
  );
  return results.map((item) => item.value);
}

async function translateSpellsInText(context, liEle) {
  const $ = context;

  let spells = [];
  let children = [];

  const childUl = $(liEle).find('>ul');
  if (childUl.length) {
    children = await traverseCollectUl(context, childUl);
    $(liEle).find('>ul').remove();
  }

  let text = $(liEle).text().trim();

  if ($(liEle).find('>span span[data-wow-id]').length) {
    spells = $(liEle)
      .find('>span span[data-wow-id]')
      .map((index, ele) => {
        return {
          name: $(ele).text().trim(),
          id: $(ele).attr('data-wow-id'),
          nameZH: '',
        };
      })
      .get();

    const results = await Promise.allSettled(
      spells.map((spell) => translateSpellName(spell))
    );

    results.forEach((result) => {
      if (result.value) {
        const spell = spells.find((item) => item.id === result.value.id);
        spell.nameZH = result.value.nameZH;
      } else {
        console.log('部分技能翻译失败。');
      }
    });

    // 更新描述里出现的 技能
    spells.forEach((spell) => {
      if (spell.nameZH) {
        text = text.replaceAll(spell.name, `[${spell.nameZH}]`);
      }
    });
  }

  function allowTranslate() {
    if (!spells.length) {
      return true;
    }
    const unranslatedSpells = spells.filter((spell) => !spell.nameZH);
    return !unranslatedSpells.length;
  }
  if (allowTranslate) {
    text = await deepseek.translate(text);
  } else {
    console.log(`检测到存在未翻译的技能，描述文本暂不翻译: ${text}`);
  }

  return { text, spells, children };
}
async function getTrash(context, containerEle) {
  const $ = context;
  const rowOutput = $(containerEle)
    .children()
    .first()
    .find('span>span')
    .map((index, trashEle) => {
      const trashName = $(trashEle).text().trim();
      const infoContainers = $(containerEle)
        .children()
        .last()
        .find('>div>div')
        .eq(index);
      const textUl = infoContainers.children().first().find('>ul');
      const imageContainer = infoContainers.children().last();
      return {
        trashName,
        trashImage: $(imageContainer).find('img').attr('src'),
        textUl,
      };
    })
    .get();
  const ulsOutput = await Promise.allSettled(
    rowOutput.map((item) => traverseCollectUl($, item.textUl))
  );

  rowOutput.forEach((item, index) => {
    if (ulsOutput[index].status !== 'fulfilled') {
      console.log(`第${index + 1}个小怪获取技能攻略失败。`);
    } else {
      item.data = ulsOutput[index].value;
    }

    // 不需要存储的数据
    item.textUl = undefined;
  });

  return rowOutput;
}

async function getBossSpell(context, containerEle, index) {
  const $ = context;
  const spellEle = $(containerEle)
    .children()
    .first()
    .find('span[data-wow-id]')
    .eq(index);
  const spellId = $(spellEle).attr('data-wow-id');
  const spellsData = await querySpellByIds([spellId]);
  const spellNameEN = $(spellEle).text().trim();
  const spellNameZH = spellsData?.[0]?.name_zh;

  const infoEle = $(containerEle).children().last().children().eq(index);
  const textEle = $(infoEle).find('>div>div').first().find('>ul');
  const imageEle = $(infoEle).find('>div>div').last();

  const text = await traverseCollectUl(context, textEle);
  return {
    spellId,
    spellNameZH,
    spellNameEN,
    image: $(imageEle).find('img').attr('src'),
    data: text,
  };
}
async function getBoss(context, containerEle) {
  const $ = context;

  const spellCount = $(containerEle)
    .children()
    .first()
    .find('span[data-wow-id]').length;
  const spellIndexArray = new Array(spellCount).fill(1);
  const results = await Promise.allSettled(
    spellIndexArray.map((item, index) =>
      getBossSpell(context, containerEle, index)
    )
  );
  return results.map((result) => result.value);
}
async function getBossAndTrashDetail(context, dungeonData, selector) {
  const $ = context;
  const { title, type } = await getBossAndTrashTitle(
    context,
    dungeonData,
    selector
  );
  const reference = $(selector).parentsUntil('#main-article').last();
  if (!reference.length) {
    throw new Error(`选择器异常：${selector}`);
  }
  let detailContainer = reference.next();
  while (!detailContainer.attr('class')?.includes('tab')) {
    detailContainer = detailContainer.next();
  }

  let detailData = {
    title,
    type,
    data: [],
  };
  if (type === 'trash') {
    detailData.data = await getTrash($, detailContainer);
  } else {
    detailData.data = await getBoss($, detailContainer);
  }
  return detailData;
}
async function getBossAndTrash(context, url, dungeonData) {
  const $ = context;
  const titles = getBossAndTrashSeletors(context);
  const results = await Promise.allSettled(
    titles
      .slice(0, 1)
      .map((selector) => getBossAndTrashDetail($, dungeonData, selector))
  );

  deepseek.saveTranslationCache();

  return results;
}
//#endregion

//#region 装备池
const limiter = new Bottleneck({
  maxConcurrent: 20,
  minTime: 30,
});
async function getLootByType(context, containerEle, index) {
  const $ = context;
  function mapTypeName(type) {
    switch (type.toLowerCase()) {
      case 'trinkets/jewelry':
        return '饰品/戒指';
      case 'trinket':
        return '饰品';
      case 'ring':
        return '戒指';
      case 'weapons':
        return '武器';
      case 'polearm':
        return '长柄武器';
      case '2-hand axe':
        return '双手斧';
      case '1-hand axe':
        return '单手手斧';
      case '1-hand mace':
        return '单手锤';
      case 'dagger':
        return '匕首';
      case 'shield':
        return '盾牌';
      case 'off-hand':
        return '副手';
      case 'armor':
        return '防具';

      case 'head':
        return '头部';
      case 'shoulder':
        return '肩膀';
      case 'hands':
        return '手部';
      case 'chest':
        return '胸甲';
      case 'wrist':
        return '腕部';
      case 'waist':
        return '腰部';
      case 'legs':
        return '腿部';
      case 'feet':
        return '脚部';
      default:
        break;
    }
    if (type.toLowerCase().includes('hand')) {
      return '武器';
    }
    return type.toLowerCase();
  }
  async function parseItemByRow(row) {
    const type = mapTypeName($(row).children().first().text());
    const itemEle = $(row).children().last().find('span[data-wow-item]');
    const imageSrc = $(itemEle)
      .find('div')
      .attr('style')
      .match(/url\("([^"]+)"\)/)[1];
    const itemId = $(itemEle).attr('data-wow-item').split(':').shift();
    let itemName = $(itemEle).text().trim();
    try {
      const data = await limiter.schedule(() => queryItemById(itemId));
      itemName = data.name;
    } catch (error) {
      console.log(`更新装备名称失败：${error}`);
    }
    return {
      type,
      id: Number(itemId),
      name: itemName,
      imageSrc,
    };
  }
  const type = mapTypeName(
    $(containerEle)
      .children()
      .first()
      .find('span span')
      .eq(index)
      .text()
      .trim()
      .toLowerCase()
  );
  const loots = $(containerEle)
    .children()
    .last()
    .find('tbody')
    .eq(index)
    .find('tr')
    .get();
  const results = await Promise.allSettled(
    loots.map((item) => parseItemByRow(item))
  );
  return {
    type,
    loots: results.map((item) => item.value),
  };
}

async function getLootPoll(context) {
  const $ = context;
  const reference = $('#lootpool-header').parentsUntil('#main-article').last();
  const lootPoolEle = reference.next();
  const typeCount = lootPoolEle.children().first().find('span span').length;
  const typeArray = new Array(typeCount).fill(1);

  const results = await Promise.allSettled(
    typeArray.map((item, index) => getLootByType($, lootPoolEle, index))
  );
  return results.map((result) => result.value);
}
//#endregion

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
    const dungeonData = await getDungeonData(url);
    const { routes, ratings } = await getRoutesAndRatings(
      $,
      dungeonData.name_en
    );
    const utilityNeeds = getUtilityNeeds($);
    const enemyTips = await getBossAndTrash($, url, dungeonData);
    const lootPool = await getLootPoll($);

    console.log(`获取数据成功：${url}`);
    return {
      dungeon: dungeonData.name_zh,
      dungeonEN: dungeonData.name_en,
      routes,
      ratings,
      utilityNeeds,
      enemyTips,
      lootPool,
    };
  } catch (error) {
    console.error(`获取数据失败：${error.message}`);
  } finally {
    await browser?.close?.();
  }
}

function saveFile(data, fileName) {
  const outputPath = path.resolve(
    __dirname,
    `./output/mythic/${fileName}.json`
  );
  const copyPath = path.resolve(
    __dirname,
    `../../backend/database/wow/data/mythic/${fileName}.json`
  );
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');
  fs.writeFileSync(copyPath, JSON.stringify(data, null, 2), 'utf-8');
}

async function startCrawler() {
  const mythicDungeons = ['theater-of-pain-guide'];
  const results = await Promise.allSettled(
    mythicDungeons.map((item) => collect(item))
  );

  const errors = results.filter((item) => item.status !== 'fulfilled');
  if (!errors.length) {
    console.log(`全部大秘境数据获取成功。`);
    const data = results.map((item) => item.value);
    saveFile(data, 'mythic-dungeon');
  }
}

startCrawler();
