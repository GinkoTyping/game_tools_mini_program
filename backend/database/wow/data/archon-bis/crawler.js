import path from 'path';
import { fileURLToPath } from 'url';

import { useCheerioContext } from '../../../../util/run-browser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getStaticFilePath(classSpec, roleClass) {
  return path.resolve(__dirname, `./cache/${classSpec}-${roleClass}.html`);
}
function getUrl(classSpec, roleClass) {
  return `https://www.archon.gg/wow/builds/${classSpec}/${roleClass}/mythic-plus/overview/high-keys/all-dungeons/this-week`;
}
function getIdByUrl(url) {
  return Number(url.split('item=')?.pop());
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

export async function collectBisOverview(classSpec, roleClass, useCache) {
  const $ = await useCheerioContext(
    getStaticFilePath(classSpec, roleClass),
    getUrl(classSpec, roleClass),
    useCache,
    1200000
  );
  const priority = $(
    '#stats .builds-stat-priority-section>.builds-stat-priority-section__container .builds-stat-priority-section__container__inner'
  )
    .map((idx, ele) => {
      const key = $(ele)
        .find('.builds-stat-priority-section__container__stat-box')
        .text();
      const value = $(ele)
        .find(
          '.builds-stat-priority-section__container__stat-box__value-wrapper'
        )
        .text();
      return {
        key,
        label: mapStat(key),
        value,
      };
    })
    .get();
  // 不需要展示主属性
  priority.shift();

  const relations = [];
  priority.forEach((item, index) => {
    if (index > 0) {
      relations.push(
        Math.abs(priority[index].value - priority[index - 1].value) >
          Math.max(priority[index].value, priority[index - 1].value) / 10
          ? 1
          : 10
      );
    }
  });

  const overview = $('#gear-overview .builds-best-in-slot-gear-section__gear')
    .children()
    .map((idx, ele) => {
      const item = $(ele).find('.gear-icon__item-name a').last();
      const name = item.text().trim();
      const id = Number(item.attr('href').split('item=').pop());
      const enhancementEle = $(ele).find('.gear-icon__item-meta__gems')?.length
        ? $(ele).find('.gear-icon__item-meta__gems')
        : $(ele).find('.gear-icon__item-meta__enchant');
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
    classSpec,
    roleClass,
    overview,
    stats: {
      priority,
      relations,
    },
  };
}
