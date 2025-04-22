import path from 'path';
import { fileURLToPath } from 'url';

import { getCheerioByPuppeteer } from '../../../../util/run-puppeteer.js';
import { getDB } from '../../../utils/index.js';
import { useItemMapper } from '../../mapper/itemMapper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const db = await getDB();
const itemMapper = useItemMapper(db);

function getStaticFilePath(classSpec, roleClass) {
  return path.resolve(__dirname, `./cache/${classSpec}-${roleClass}.html`);
}
function getUrl(classSpec, roleClass) {
  return `https://maxroll.gg/wow/class-guides/${classSpec}-${roleClass}-mythic-plus-guide`;
}

const CONTAINER_SELECTOR = 'div[data-wow-type=paperdoll]';
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
function getIconIdByCss(cssLine) {
  const urlStart = cssLine.indexOf('url(') + 4;
  const urlEnd = cssLine.indexOf(')', urlStart);
  const rawUrl = cssLine.slice(urlStart, urlEnd).replace(/["']/g, ''); // 去掉引号

  // 2. 提取文件名
  return rawUrl.split('/').pop().split(/[?#]/)[0]; // 处理可能存在的参数
}
function getRawBis(context) {
  function getBisTable() {
    const bisTableHeader = $('#gear-header')
      .parentsUntil('#main-article')
      .last();
    let bisTableEle = bisTableHeader.next();
    while (!bisTableEle?.find('figure table')?.length) {
      bisTableEle = bisTableEle.next();
    }
    return bisTableEle;
  }

  const $ = context;
  const container = $(CONTAINER_SELECTOR).first();
  const bisTableEle = getBisTable();
  const bisItems = bisTableEle
    .find('table tbody')
    .first()
    .children()
    .map((idx, row) => {
      const itemEle = $(row).find('span[data-wow-item]').first();
      return {
        id: Number(itemEle.attr('data-wow-item')?.split(':')?.[0]),
        name: itemEle.text().trim(),
      };
    })
    .get();

  return ['.mxt-left', '.mxt-right', '.mxt-middle']
    .reduce((pre, slotsClass) => {
      const slots = container
        .find(slotsClass)
        .children()
        .map((idx, slotEle) => {
          return {
            id: bisItems[idx].id,
            name: $(slotEle).find('.mxt-name')?.text()?.trim(),
            enhancements: $(slotEle)
              .find('.mxt-bonuses')
              .children()
              .map((iconIdx, iconEle) => {
                return getIconIdByCss($(iconEle).attr('style'));
              })
              .get(),
          };
        })
        .get();
      pre.push(...slots);
      return pre;
    }, [])
    .filter((item) => item.name);
}
function mapEnhancementId(icon, classSpec, roleClass) {
  switch (icon) {
    // 213491
    case '5931393.webp':
      return 213491;

    // 顶峰渎神玉
    case '348538.webp':
      return 213743;

    // 精湛红宝石
    case '5931399.webp':
      return 213458;

    // 精湛蓝玉
    case '5931402.webp':
      return 213473;

    // 致命蓝玉
    case '5931403.webp':
      return 213467;

    // 灵动渎神玉
    case '630620.webp':
      return 213746;

    // 万能红宝石
    case '5931400.webp':
      return 213461;

    // 万能翡翠
    case '5931389.webp':
      return 213485;

    // 迅捷玛瑙
    case '5931394.webp':
      return 213494;

    // 迅捷蓝玉
    case '5931404.webp':
      return 213470;

    // 精湛翡翠
    case '5931391.webp':
      return 213482;

    // 万能玛瑙
    case '5931392.webp':
      return 213497;

    // 迅捷红宝石
    case '5931401.webp':
      return 213453;

    // 致命翡翠
    case '5931390.webp':
      return 213479;

    // 附魔卷轴/铭文/等宝石以外的 - 不统计
    case '463531.webp':
    case '4549173.webp':
    case '4644002.webp':
    case '5975854.webp':
    case '4559235.webp':
    case '4549168.webp':
    case '5975753.webp':
    case '135957.webp':
    case '4549251.webp':
    case '4549296.webp':
    case '5976899.webp':
    case '4549161.webp':
    case '3717598.webp':
    case '3717599.webp':
    case '3717603.webp':
    case '4549158.webp':
    case '4549287.webp':
    case '4549170.webp':
    case '3717596.webp':
    case '463526.webp':
    case '4549172.webp':
    case '4549171.webp':
    case '135842.webp':

    // 海妖岛戒指采用wowhead
    case '6215529.webp':
    case '6215532.webp':
    case '6215534.webp':
    case '6215530.webp':
    case '6215536.webp':
      return null;

    default:
      console.log(`Not found: ${icon} - ${classSpec} ${roleClass}`);
      return icon;
  }
}
async function mapBis(rawData, classSpec, roleClass) {
  async function mapItem(item) {
    const itemData = await itemMapper.getItemById(item.id);
    if (!itemData) {
      const insertResult = await itemMapper.insertItem({
        id: item.id,
        item: item.name,
      });
      console.log(
        `Not Found: ${item.name} - ${classSpec} ${roleClass}. Registered: ${
          insertResult.changes ? '√' : 'X'
        }`
      );
    }
    return {
      slot: itemData.slot,
      id: itemData.id,
      enhancements: item.enhancements
        .map((item) => mapEnhancementId(item, classSpec, roleClass))
        .filter((item) => item),
    };
  }
  const mappedData = await Promise.allSettled(
    rawData.map((item) => mapItem(item))
  );
  return mappedData.map((item) => item.value);
}

// maxroll 的 bis 不如 wowhead ，只采集 宝石附魔 的数据
export async function collectMaxrollBis(
  classSpec,
  roleClass,
  useCache,
  lastUpdatedAt
) {
  const $ = await getCheerioByPuppeteer({
    staticFilePath: getStaticFilePath(classSpec, roleClass),
    urlPath: getUrl(classSpec, roleClass),
    useCache,
    waitForSelector: `${CONTAINER_SELECTOR} .mxt-left`,
  });
  const updatedAt = getDate(
    $('main>div:nth-child(2) .italic:nth-child(2)').text()
  );
  const needUpdate = lastUpdatedAt !== updatedAt;
  if (needUpdate) {
    const rawData = getRawBis($);
    const data = await mapBis(rawData, classSpec, roleClass);
    return {
      updatedAt,
      items: data,
    };
  }
  return null;
}
