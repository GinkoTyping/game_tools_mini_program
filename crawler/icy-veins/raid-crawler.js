import axios from 'axios';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import '../util/set-env.js';
import { useCheerioContext } from '../util/run-browser.js';
import { useDeepseek } from '../util/deepseek.js';
import { tryTranslateSpell } from '../api/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tranlateCache = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, './cache/raid/translate.json'))
);
const deepseek = useDeepseek(
  path.resolve(__dirname, './cache/raid/translate.json')
);

function mapTranslateCache(key) {
  return tranlateCache?.[key] ?? key;
}

async function translateSingleTip(tip) {
  let { text, spells } = tip;
  if (spells.length) {
    const results = await Promise.allSettled(
      spells.map((spell) => tryTranslateSpell(spell))
    );
    spells = results.map((result) => result.value);

    spells.forEach((spell) => {
      if (spell.nameZH) {
        text = text.replaceAll(spell.name, `[${spell.nameZH}]`);
      }
    });
  }

  function isTranslateWholeTip() {
    return (
      !spells.length ||
      spells.filter((spell) => spell.nameZH)?.length === spells.length
    );
  }
  if (isTranslateWholeTip()) {
    text = await deepseek.translate(text);
  }
  return { text, spells };
}
async function translateTipsByType(input) {
  const results = await Promise.allSettled(
    input.children.map((item) => translateSingleTip(item))
  );
  return {
    ...input,
    children: results.map((result) => result.value),
  };
}

function mapUlElement(context, tipEle) {
  const $ = context;
  const text = tipEle.text();
  let spells = [];
  if (tipEle.children('span').length) {
    spells = tipEle
      .children('span')
      .map((index, spellEle) => {
        return {
          name: $(spellEle).text(),
          id: Number(
            $(spellEle)
              .find('[data-wowhead]')
              .attr('data-wowhead')
              .split('spell=')
              .pop()
          ),
        };
      })
      .get();
  }
  return {
    text,
    spells,
  };
}
function getRawOutput(context, containerEle) {
  const $ = context;
  const output = [];

  async function setTipPartOutput(context, ele) {
    const $ = context;

    if (ele.attr('class')?.includes('heading_number_3')) {
      const title = mapTranslateCache(ele.find('h3').text());
      output.push({ title, children: [] });
    } else if (ele[0].name === 'ul') {
      const liElements = ele
        .children('li')
        .map((index, ele) => $(ele))
        .get();

      output[output.length - 1].children = liElements.map((item) =>
        mapUlElement($, item)
      );

      // TODO: 详细攻略里会出现的，待适配
    } else if (ele[0].name === 'p') {
    }
  }

  containerEle.children().each((index, tipPart) => {
    setTipPartOutput($, $(tipPart));
  });

  return output;
}

async function collectByTipId(context, id) {
  const $ = context;
  function mapButtonName(name) {
    switch (name) {
      case 'Quick TLDR Guide':
        return '一句话攻略';
      case 'Strategy Guide: Full Guide':
        return '完整攻略';
      case 'Mythic Strategy':
        return 'M 难度';
      default:
        return name;
    }
  }
  const typeName = mapButtonName($(`#${id}_button`).text());
  const tipsContainer = $(`#${id}`);

  // 先只完成 数据收集
  const rowOutput = getRawOutput($, tipsContainer);

  const translatedResults = await Promise.allSettled(
    rowOutput.map((item) => translateTipsByType(item))
  );

  return {
    title: typeName,
    children: translatedResults.map((item) => item.value),
  };
}

function getStaticFilePath(boss) {
  return path.resolve(__dirname, `./cache/raid/${boss}.html`);
}
function getUrl(boss) {
  return `https://www.icy-veins.com/wow/${boss}-raid-guide-in-liberation-of-undermine`;
}
async function collectRaidBoss(boss) {
  const $ = await useCheerioContext(getStaticFilePath(boss), getUrl(boss));
  const results = await Promise.allSettled(
    [
      'area_1',
      // TODO: 后续再是适配
      // 'area_2',
      // 'area_3'
    ].map((id) => collectByTipId($, id))
  );

  function mapBossName(key) {
    const map = {
      'vexie-fullthrottle': '维克茜和磨轮',
      'cauldron-of-carnage': '血腥大熔炉',
      'rik-reverb': '里克·混响',
      'stix-bunkjunker': '斯提克斯·堆渣',
      'sprocketmonger-lockenstock': '链齿狂人洛肯斯多',
      'one-armed-bandit': '独臂盗匪',
      'mug-zee': '穆格·兹伊，安保头子',
    };
    return map[key] ?? key;
  }

  return {
    title: mapBossName(boss),
    children: results.map((result) => result.value),
  };
}

async function saveFile(data) {
  const savePath = path.resolve(__dirname, './output/raid/index.json');
  const backendPath = path.resolve(__dirname, '../../backend/database/wow/data/raid/index.json');
  let exsitedData;
  if (fs.existsSync(savePath)) {
    exsitedData = JSON.parse(fs.readFileSync(savePath));
  }

  if (exsitedData) {
    data.forEach((newItem) => {
      const existedItemIndex = exsitedData.findIndex(
        (oldItem) => oldItem.title === newItem.title
      );
      if (existedItemIndex === -1) {
        exsitedData.push(newItem);
      } else {
        exsitedData.splice(existedItemIndex, 1, newItem);
      }
    });
    fs.writeFileSync(savePath, JSON.stringify(exsitedData, null, 2));
    fs.writeFileSync(backendPath, JSON.stringify(exsitedData, null, 2));
  } else {
    fs.writeFileSync(savePath, JSON.stringify(data, null, 2));
    fs.writeFileSync(backendPath, JSON.stringify(data, null, 2));
  }
}

async function main() {
  process.on('exit', () => deepseek.saveTranslationCache());
  process.on('SIGINT', () => {
    deepseek.saveTranslationCache().then(() => process.exit());
  });

  const bosses = [
    'vexie-fullthrottle',
    'cauldron-of-carnage',
    'rik-reverb',
    'stix-bunkjunker',

    'sprocketmonger-lockenstock',
    'one-armed-bandit',
    'mug-zee',
  ];
  const data = await Promise.allSettled(
    bosses.map((boss) => collectRaidBoss(boss))
  );

  saveFile(data.map((item) => item.value));

  deepseek.saveTranslationCache();
}

main();
