import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import '../util/set-env.js';
import { getCheerioByPuppeteer } from '../util/run-puppeteer.js';
import { formatDateByMinute } from '../util/time.js';

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
async function collectByType(type, useCache) {
  const $ = await getCheerioByPuppeteer(getStaticFilePath(type), getUrl(type), useCache);
  return collectLadderTable($);
}

const types = [
  'Dawn%2520of%2520the%2520Hunt',
  'HC%2520Dawn%2520of%2520the%2520Hunt',
  'SSF%2520Dawn%2520of%2520the%2520Hunt',
  'HC%2520SSF%2520Dawn%2520of%2520the%2520Hunt',

  // 'Standard',
  // 'Hardcore',
  // 'Solo%2520Self-Found',
  // 'Hardcore%2520SSF',
];
function saveFile(data) {
  const filePath = path.resolve(__dirname, `./output/ladders.json`);
  const serverPath = path.resolve(
    __dirname,
    `../../backend/database/poe2/data/ladders/ladders.json`
  );
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  fs.writeFileSync(serverPath, JSON.stringify(data, null, 2), 'utf-8');
}
async function collectAll(useCahce) {
  const results = await Promise.allSettled(
    types.map((type) => {
      return collectByType(type, useCahce);
    })
  );
  const [
    standardDoTH,
    hardcoreDoTH,
    soloSelfFoundDoTH,
    hardcoreSoloSelfFoundDoTH,

    // standard,
    // hardcore,
    // soloSelfFound,
    // hardcoreSoloSelfFound,
  ] = results.map((result, index) => {
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
    data: [
      {
        label: '狩猎黎明 标准模式',
        desc: '',
        data: standardDoTH,
      },
      {
        label: '狩猎黎明 硬核模式',
        desc: '一命',
        data: hardcoreDoTH,
      },
      {
        label: '狩猎黎明 SSF模式',
        desc: '无法组队和交易',
        data: soloSelfFoundDoTH,
      },
      {
        label: '狩猎黎明 硬核SSF模式',
        desc: '',
        data: hardcoreSoloSelfFoundDoTH,
      },

      // {
      //   label: '永久服 标准模式',
      //   desc: '',
      //   data: standard,
      // },
      // {
      //   label: '永久服 硬核模式',
      //   desc: '一命',
      //   data: hardcore,
      // },
      // {
      //   label: '永久服 SSF模式',
      //   desc: '无法组队和交易',
      //   data: soloSelfFound,
      // },
      // {
      //   label: '永久服 硬核SSF模式',
      //   desc: '',
      //   data: hardcoreSoloSelfFound,
      // },
    ],
  };

  saveFile(data);
}

collectAll(false);
