import path from 'path';
import { fileURLToPath } from 'url';

import { useCheerioContext } from '../../../../util/run-browser.js';
import { getCheerioByPuppeteer } from '../../../../util/run-puppeteer.js';
import { calculateStatRatio } from '../../../../util/wow.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getStaticFilePath(classSpec, roleClass) {
  return path.resolve(__dirname, `./cache/${classSpec}-${roleClass}.html`);
}

function getUrl(classSpec, roleClass) {
  return `https://www.archon.gg/wow/builds/${classSpec}/${roleClass}/mythic-plus/gear-and-tier-set/high-keys/all-dungeons/this-week`;
}

function getOverviewUrl(classSpec, roleClass) {
  return `https://www.archon.gg/wow/builds/${classSpec}/${roleClass}/mythic-plus/overview/high-keys/all-dungeons/this-week#stats`;
}

function getOverviewStaticFilePath(classSpec, roleClass) {
  return path.resolve(
    __dirname,
    `./cache/${classSpec}-${roleClass}-overview.html`,
  );
}

function getIdByUrl(url) {
  return Number(url?.split('item=')?.pop());
}

function mapStat(val) {
  const lowercase = val.toLowerCase();
  switch (lowercase) {
    case 'haste':
      return '急速';
    case 'mastery':
      return '精通';
    case 'crit':
      return '暴击';
    case 'vers':
      return '全能';
    default:
      break;
  }
}

// TODO: 计算百分比 https://maxroll.gg/wow/resources/stat-diminishing-returns
async function getStatsOverview(classSpec, roleClass, useCache) {
  const $ = await useCheerioContext(
    getOverviewStaticFilePath(classSpec, roleClass),
    getOverviewUrl(classSpec, roleClass), useCache, 20000,
  );
  const priority = $(
    '#stats .builds-stat-priority-section>.builds-stat-priority-section__container .builds-stat-priority-section__container__inner')
    .map((idx, ele) => {
      const key = $(ele)
        .find('.builds-stat-priority-section__container__stat-box')
        .text();
      const value = $(ele)
        .find(
          '.builds-stat-priority-section__container__stat-box__value-wrapper')
        .text();
      return {
        key,
        label: mapStat(key),
        value,
        ratio: calculateStatRatio(
          key,
          value,
        ),
      };
    })
    .get();
  // 不需要展示主属性
  priority.shift();
  const relations = [];
  priority.forEach((item, index) => {
    if (index > 0) {
      relations.push(
        Math.abs(priority[index].value - priority[index - 1].value) > Math.max(
          priority[index].value, priority[index - 1].value) / 10 ? 1 : 10);
    }
  });
  return {
    priority,
    relations,
  };
}

async function getBisOverview(classSpec, roleClass, useCache) {
  const $ = await getCheerioByPuppeteer({
    staticFilePath: getStaticFilePath(
      classSpec, roleClass),
    urlPath: getUrl(classSpec, roleClass),
    useCache,
    waitForSelector: '#gear-tables .builds-gear-tables-section__group a a[data-disable-wowhead-tooltip=true]',
  });

  const overview = [];
  const popularTrinkets = [];

  function buildItemByEle(ele) {
    return {
      id: getIdByUrl($(ele).find('a').first().attr('href')),
      name: $(ele).find('td').first().find('span').last().text().trim(),
      popularity: $(ele).find('td').last().find('span').first().text().trim(),
    };
  }

  $('#gear-tables .builds-gear-tables-section__group')
    .children()
    .each((idx, slotWrap) => {
      const slotLabel = $(slotWrap)
        .find('table thead th')
        .first()
        ?.text()
        ?.trim();
      let collectCount = 0;
      let RING_COLLECT_MAX = 2;
      let TRINKET_COLLECT_MAX = 5;
      $(slotWrap)
        .find('tbody tr')
        .each((trIdx, trEle) => {
          let isPush = false;
          if (slotLabel === 'Trinket' && collectCount < TRINKET_COLLECT_MAX) {
            isPush = true;
          } else {
            if ($(trEle).find('a[data-disable-wowhead-tooltip]')?.length) {
              if (slotLabel === 'Off-Hand') {
                const id = buildItemByEle(trEle).id;
                const hasSameMainHand = overview.find(item => item.id === id);
                isPush = !hasSameMainHand;
              } else {
                isPush = true;
              }
            }
          }

          if (isPush) {
            const item = buildItemByEle(trEle);
            if (slotLabel === 'Trinket') {
              popularTrinkets.push(item);
            } else {
              overview.push(item);
            }

            collectCount++;
            return (// 戒指部位 收录了2个以上的戒指，只收集前2
              (slotLabel === 'Rings' && collectCount < RING_COLLECT_MAX) || // 饰品部位 需要展示不同流行度的饰品，统计5个
              (slotLabel === 'Trinket' && collectCount < TRINKET_COLLECT_MAX));
          }

          return true;
        });

      // 如果没有找到 BIS 标签的装备，默认取第一个
      if (collectCount === 0) {
        overview.push(buildItemByEle($(slotWrap).find('tbody tr').first()));
      }
    });

  const popularityItems = $(
    '#gear-overview .builds-best-in-slot-gear-section__gear')
    .children()
    .map((idx, ele) => {
      const item = $(ele).find('.gear-icon__item-name a').last();
      const name = item.text().trim();
      const id = Number(item.attr('href').split('item=').pop());

      const enhancementEle = $(ele)
        .find('.gear-icon__item-meta')
        .children()
        .first();

      const enhancements = enhancementEle
        .children()
        .map((gemIdx, gemEle) => {
          return getIdByUrl($(gemEle).attr('href'));
        })
        .get();
      const stats = $(ele)
        .find('.gear-icon__item-meta__stats')
        .children('span')
        .map((statIdx, statEle) => {
          return mapStat($(statEle).text());
        })
        .get();
      return {
        id,
        name,
        enhancements,
        stats,
      };
    })
    .get();

  return {
    overview,
    popularTrinkets,
    popularityItems,
  };
}

export async function collectBisOverview(classSpec, roleClass, useCache) {
  const stats = await getStatsOverview(classSpec, roleClass, useCache);
  const {
    overview,
    popularityItems,
    popularTrinkets,
  } = await getBisOverview(classSpec, roleClass, useCache);

  if (!overview.length) {
    console.log(
      `${classSpec}${roleClass}: 获取BIS数据失败，将使用热门度排行替代`);
  }

  return {
    classSpec,
    roleClass,

    // TODO 奶龙和奶德 没有BIS数据, 所以用热度数据代替
    overview: overview.length ? overview : popularityItems,
    popularTrinkets,
    popularityItems,
    stats,
  };
}
