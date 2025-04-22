import path from 'path';
import { fileURLToPath } from 'url';

import { getCheerioByPuppeteer } from '../../../../util/run-puppeteer.js';
import { queryWowItemById } from '../../../../api/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getStaticFilePath(classSpec, roleClass) {
  return path.resolve(__dirname, `./cache/${classSpec}-${roleClass}.html`);
}
function getUrl(classSpec, roleClass) {
  return `https://maxroll.gg/wow/class-guides/${classSpec}-${roleClass}-mythic-plus-guide`;
}

const CONTAINER_SELECTOR = 'div[data-wow-type=paperdoll]';
async function mapSlotLabel(slotsClass, index, itemId) {
  if (slotsClass === 'mxt-left') {
    switch (index) {
      case 0:
        return '头部';
      case 1:
        return '颈部';
      case 2:
        return '肩部';
      case 3:
        return '背部';
      case 4:
        return '胸部';
      case 5:
        return '衬衫';
      case 6:
        return '战袍';
      case 7:
        return '腕部';
      default:
        return 'N/A';
    }
  } else if (slotsClass === 'mxt-right') {
    switch (index) {
      case 0:
        return '手部';
      case 1:
        return '腰部';
      case 2:
        return '腿部';
      case 3:
        return '脚部';
      case 4:
      case 5:
        return '戒指';
      case 6:
      case 7:
        return '饰品';
      default:
        return 'N/A';
    }

    // 武器的种类不确定，也没法获取装备ID
  } else {
    const res = await queryWowItemById(itemId, 'en_US');
    return res?.data?.inventory_type?.name;
  }
}
function getIconIdByCss(cssLine) {
  const urlStart = cssLine.indexOf('url(') + 4;
  const urlEnd = cssLine.indexOf(')', urlStart);
  const rawUrl = cssLine.slice(urlStart, urlEnd).replace(/["']/g, ''); // 去掉引号

  // 2. 提取文件名
  return rawUrl.split('/').pop().split(/[?#]/)[0]; // 处理可能存在的参数
}
function getEnhancements(context) {
  const $ = context;
  const container = $(CONTAINER_SELECTOR).first();
  return ['.mxt-left', '.mxt-right', '.mxt-middle'].reduce(
    (pre, slotsClass) => {
      const slots = container
        .find(slotsClass)
        .children()
        .map((idx, slotEle) => {
          return {
            name: $(slotEle).find('.mxt-name')?.text()?.trim(),
            enhancements: $(slotEle)
              .find('.mxt-mxt-bonuses')
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
    },
    []
  );
}

// maxroll 的 bis 不如 wowhead ，只采集 宝石附魔 的数据
export async function collectMaxrollBis(classSpec, roleClass, useCache) {
  const $ = await getCheerioByPuppeteer(
    getStaticFilePath(classSpec, roleClass),
    getUrl(classSpec, roleClass),
    useCache,
    `${CONTAINER_SELECTOR} .mx-left`
  );
  const rawData = getEnhancements($);
  console.log(rawData);
}

collectMaxrollBis('retribution', 'paladin', true);
