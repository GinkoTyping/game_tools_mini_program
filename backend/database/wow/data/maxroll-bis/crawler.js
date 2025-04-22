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
function mapEnhancementId(icon) {
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

    // 附魔卷轴 - 不统计
    case '463531.webp':
      return null;

    default:
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
        .map(mapEnhancementId)
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
