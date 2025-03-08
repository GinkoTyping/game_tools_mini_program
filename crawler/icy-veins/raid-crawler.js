import * as cheerio from 'cheerio';
import axios from 'axios';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import '../util/set-env.js';
import { useCheerioContext } from '../util/run-browser.js';
import { useDeepseek } from '../util/deepseek.js';

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

// TODO 分解
async function getTranslateTip(tipEle) {
  let text = tipEle.text();
  let spells = tipEle
    .children('span')
    .map((index, spellEle) => {
      return {
        name: $(spellEle).text(),
        id: Number(
          $(spellEle)
            .find('a')
            .attr('href')
            .split('spell=')
            .pop()
            .split('/')
            .shift()
        ),
      };
    })
    .get();

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
  if (isTranslateWholeTip) {
    text = await deepseek.translate(text);
  }
  return { text, spells };
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

  const output = [];
  async function setTipPartOutput(context, ele) {
    const $ = context;
    // 标题已经收集过了
    if (ele.attr('class')?.includes('heading_number_2')) {
      return;
    }

    if (ele.attr('class')?.includes('heading_number_3')) {
      const title = mapTranslateCache(ele.find('h3').text());
      output.push({ title, children: [] });
      return;
    }

    if (ele[0].name === 'ul') {
      const liElements = ele
        .children('li')
        .map((index, ele) => $(ele))
        .get();

      output[output.length - 1].children = liElements.map((item) =>
        mapUlElement($, item)
      );
    }
  }

  tipsContainer.children().each((index, tipPart) => {
    setTipPartOutput($, $(tipPart));
  });

  console.log(results);
}

async function getBossTips(context) {
  const $ = context;

  [
    'area_1',
    // 'area_2',
    // 'area_3'
  ].map((id) => collectByTipId($, id));

  deepseek.saveTranslationCache();

  process.on('exit', () => deepseek.saveTranslationCache());
  process.on('SIGINT', () => {
    deepseek.saveTranslationCache().then(() => process.exit());
  });
}

function getStaticFilePath(boss) {
  return path.resolve(__dirname, `./cache/raid/${boss}.html`);
}
function getUrl(boss) {
  return `https://www.icy-veins.com/wow/${boss}-raid-guide-in-liberation-of-undermine`;
}
async function collectRaidBoss(boss) {
  const $ = await useCheerioContext(getStaticFilePath(boss), getUrl(boss));
  await getBossTips($);
}

collectRaidBoss('vexie-fullthrottle');
