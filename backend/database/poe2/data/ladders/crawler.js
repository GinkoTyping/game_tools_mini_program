import pLimit from 'p-limit';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import '../../../../util/set-env.js';
import { getCheerioByPuppeteer } from '../../../../util/run-puppeteer.js';
import { formatDateByMinute } from '../../../../util/time.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getStaticFilePath(type) {
  return path.resolve(__dirname, `./cache/${type}.html`);
}
function getUrl(type) {
  return `https://pathofexile2.com/ladder/${type}`;
}
function mapClassName(key) {
  const labels = {
    warrior: '战士',
    titan: '泰坦',
    warbringer: '战争使者',
    'smith of kitava': '奇塔弗工匠',
    titan: '泰坦',

    ranger: '游侠',
    deadeye: '锐眼',
    pathfinder: '追猎者',

    huntress: '女猎手',
    amazon: '亚马逊',
    ritualist: '仪式使者',

    witch: '女巫',
    infernalist: '狱火师',
    'blood mage': '血法师',
    lich: '巫妖',

    sorceress: '女术士',
    stormweaver: '风暴编织者',
    chronomancer: '时空幻术师',

    mercenary: '佣兵',
    tactician: '智勇军师',
    witchhunter: '女巫猎人',
    'gemling legionnaire': '古灵军团',

    monk: '僧侣',
    invoker: '施法者',
    'acolyte of chayula': '夏乌拉侍僧',
  };

  return labels[key.toLowerCase()] || key;
}
function collectLadderTable(context) {
  try {
    const $ = context;
    const data = [];
    $('table tbody tr').each((index, ele) => {
      const row = $(ele)
        .children('td')
        .map((tdIdx, tdEle) => {
          return tdIdx === 3
            ? `${mapClassName($(tdEle).text())}|${$(tdEle).text()}`
            : $(tdEle).text();
        })
        .get();
      data.push(row);
    });

    return data;
  } catch (error) {
    return [];
  }
}
async function collectByType(typeItem, useCache) {
  const $ = await getCheerioByPuppeteer({
    staticFilePath: getStaticFilePath(typeItem.key),
    urlPath: getUrl(typeItem.key),
    useCache: useCache,
    waitForSelector: 'table tbody tr',
  });
  const data = collectLadderTable($);
  return {
    ...typeItem,
    data,
  };
}

const types = [
  {
    key: 'Dawn%2520of%2520the%2520Hunt',
    type: 'DotH_standard',
    desc: '',
    label: '狩猎黎明 标准模式',
  },
  {
    key: 'HC%2520Dawn%2520of%2520the%2520Hunt',
    type: 'DotH_hc',
    desc: '一命',
    label: '狩猎黎明 硬核模式',
  },
  {
    key: 'SSF%2520Dawn%2520of%2520the%2520Hunt',
    type: 'DotH_ssf',
    desc: '无法组队和交易',
    label: '狩猎黎明 SSF模式',
  },
  {
    key: 'HC%2520SSF%2520Dawn%2520of%2520the%2520Hunt',
    type: 'DotH_hc_ssf',
    desc: '',
    label: '狩猎黎明 硬核SSF模式',
  },

  // {
  //   key: 'Standard',
  //   desc: '',
  //   label: '标准模式',
  // },
  // {
  //   key: 'Hardcore',
  //   desc: '一命',
  //   label: '硬核模式',
  // },
  // {
  //   key: 'Solo%2520Self-Found',
  //   desc: '无法组队和交易',
  //   label: 'SSF模式',
  // },
  // {
  //   key: 'Hardcore%2520SSF',
  //   desc: '',
  //   label: '硬核SSF模式',
  // },
];

function saveFile(data) {
  const filePath = path.resolve(__dirname, `./output/ladders.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

const limit = pLimit(2);
export async function collectAll(useCahce) {
  const results = await Promise.allSettled(
    types.map((type) => {
      return limit(() => collectByType(type, useCahce));
    })
  );
  const finalData = results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      console.error(`Error collecting ${types[index]}:`, result.reason);
      return null;
    }
  });

  const data = {
    time: formatDateByMinute(),
    showIndex: [1, 1, 0, 1, 1, 0],
    columns: ['排名', '账号', '角色名', '职业', '等级', '经验'],
    data: finalData,
  };

  saveFile(data);
  return data;
}
