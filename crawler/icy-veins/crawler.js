import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import '../util/set-env.js';
import { queryAddSpell, querySpellByIds } from '../api/index.js';
import localeLabels from '../util/class-spec-locales.js';

async function collectByTierName(file) {
  let browser;
  try {
    let html;
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36',

        // TODO 其他爬取方法中，可以加速html文件加载
        '--disable-gpu',
      ],
    });
    const page = await browser.newPage();

    const staticFilePath = `./cache/${file}.html`;
    if (fs.existsSync(path.resolve(__dirname, staticFilePath))) {
      html = fs
        .readFileSync(path.resolve(__dirname, staticFilePath), 'utf-8')

        // TODO 其他爬取方法中，删除script 和 iframe 标签，可以加速html文件加载
        .replace(/<\s*(script|iframe)\b[\s\S]*?<\/\1>/gi, '');
      await page.setContent(html);
    } else {
      await page.goto(`https://www.icy-veins.com/wow/${file}`);

      html = await page.content();
      fs.writeFileSync(path.resolve(__dirname, staticFilePath), html, 'utf-8');
    }

    const data = collectTierList(html);
    const translated = await translate(data);

    saveFile(translated, file);
  } catch (error) {
    console.log(error);
  } finally {
    await browser.close();
  }
}

function collectTierList(html) {
  const $ = cheerio.load(html);
  const trs = $('.tier-list tbody tr');

  return trs
    .map((_, tr) => {
      const $tr = $(tr);
      const tds = $tr.children('td');
      if (tds.length) {
        const $firstTd = tds.first();
        const tier = $firstTd.text().trim();
        const $secondTd = tds.eq(1);
        const specsDoms = $secondTd.find('span[data-change]');

        const children = specsDoms
          .map((_, specDom) => {
            const $spec = $(specDom);
            const dataChange = $spec.data('change');
            const $summarySpanImg = $spec.find('summary span img');
            const roleClass = $summarySpanImg.length
              ? $summarySpanImg.attr('class')
              : null;
            const $summarySpanSpan = $spec.find('summary span span');
            const fullNameEN = $spec
              .find('.details_block__summary-title-wrapper')
              .text()
              .trim();
            const classSpec = $summarySpanSpan.length
              ? $summarySpanSpan.text().trim().split(' ').shift().toLowerCase()
              : null;
            const $detailsContentP = $spec.find('.details-block__content p');
            let desc = $detailsContentP.length
              ? $detailsContentP
                  .text()
                  .replace(/\s{2,}/g, ' ')
                  .replace(/\n/g, ' ')
              : null;

            const spellDoms = $spec.find('.spell_icon_span');
            const spells = spellDoms
              .map((_, spellDom) => {
                const $spellDom = $(spellDom);
                const $spell = $spellDom.find('[data-wowhead]');
                let spellId;
                $spell
                  .data('wowhead')
                  .split('&')
                  .forEach((query) => {
                    const [key, value] = query.split('=');
                    if (key === 'spell') {
                      spellId = Number(value);
                    }
                    // TODO 还有一个 domain=beta 参数，暂时忽略
                  });

                const spellName = $spell.text();

                desc = desc.replaceAll(spellName, `[${spellName}]`);
                return { spellId, spellName };
              })
              .get();

            return {
              fullNameEN,
              roleClass,
              classSpec,
              dataChange,
              desc,
              spells,
            };
          })
          .get();

        return { tier, children };
      }
      return null;
    })
    .get()
    .filter(Boolean);
}

function saveFile(data, fileName) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const outputPath = path.resolve(__dirname, `./output/${fileName}.json`);
  let existedData;
  if (fs.existsSync(outputPath)) {
    const readFileData = fs.readFileSync(outputPath, 'utf-8');
    existedData = JSON.parse(readFileData);
    data.forEach((cur) => {
      const existedTier = existedData.find((item) => item.tier === cur.tier);
      if (existedTier) {
        cur.children.forEach((child) => {
          let existedChild = existedTier.children.find(
            (item) => item.classSpec === child.classSpec
          );

          if (existedChild) {
            // 保护 中文翻译的字段
            Object.assign(existedChild, {
              descZH: existedChild.descZH ?? '',
              ...child,
            });
          } else {
            existedTier.children.push(child);
          }
        });
      } else {
        existedData.push(cur);
      }
    });
    fs.writeFileSync(outputPath, JSON.stringify(existedData, null, 2), 'utf-8');
  } else {
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');
  }
}

const prompt =
  '只翻译每个成员中的desc属性，它是魔兽世界的职业介绍。该属性中已经是中文的部分和"["、"]"符号请保留。desc属性保持英文不变，翻译后的文本设置为成员的descZH属性，然后重新输出整个数组';

async function translate(data) {
  const totalNullSpells = [];
  const totalIncompleteSpells = [];

  // TODO 翻译 fullNameEN
  async function translateDesc(specItem) {
    specItem.fullNameZH = `${
      localeLabels[specItem.roleClass][specItem.classSpec]
    } ${localeLabels.class[specItem.roleClass]}`;

    if (specItem.spells?.length) {
      const spells = await querySpellByIds(
        specItem.spells.map((spell) => Number(spell.spellId))
      );
      specItem.spells.forEach((spell) => {
        const spellData = spells.find(
          (spellDataItem) => spellDataItem?.id === spell.spellId
        );
        if (spellData) {
          if (spellData.name_zh) {
            specItem.desc = specItem.desc.replaceAll(
              spell.spellName,
              spellData.name_zh
            );
          } else {
            totalIncompleteSpells.push({
              id: spell.spellId,
              name: spell.spellName,
            });
          }
        } else {
          totalNullSpells.push({ id: spell.spellId, name: spell.spellName });
        }
      });
    }

    return specItem;
  }

  async function translateTier(tier) {
    const specPromises = tier.children.map((spec) => translateDesc(spec));
    const results = await Promise.allSettled(specPromises);
    tier.children = results.map((item) => item.value);
    return tier;
  }

  const tierPromise = data.map((item) => translateTier(item));
  const tierResults = await Promise.allSettled(tierPromise);

  console.log(
    `未注册的spell, 注册中: ${JSON.stringify(
      totalNullSpells.map((item) => item.id)
    )}`
  );
  const addNullSpellPromise = totalNullSpells.map((spell) =>
    queryAddSpell(spell)
  );
  await Promise.allSettled(addNullSpellPromise);
  return tierResults.map((item) => item.value);
}

collectByTierName('mythic-ptr-dps-tier-list');
