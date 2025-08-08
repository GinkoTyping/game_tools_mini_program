import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import pLimit from 'p-limit';
import OpenAI from 'openai';
import Bottleneck from 'bottleneck';
import { configDotenv } from 'dotenv';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url'; // 导入 fileURLToPath

import useBlizzAPI from '../../util/blizz.js';
import { useBisMapper } from './mapper/bisMapper.js';
import { useDungeonMapper } from './mapper/dungeonMapper.js';
import { useItemMapper } from './mapper/itemMapper.js';
import { useDungeonTipMapper } from './mapper/dungeonTipMapper.js';
import { useSpellMapper } from './mapper/spellMapper.js';
import { queryBlizzItemById } from '../../controller/wow/bisController.js';
import { getDB } from '../utils/index.js';

// 获取当前文件的路径和目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const blizzAPI = useBlizzAPI();
configDotenv({ path: path.resolve(__dirname, '../../.env') });
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_KEY,
});

const wowheadData = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, './data/wowhead.json')),
);
const maxrollData = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, './data/maxroll.json')),
);
const CACHE_PATH = path.join(__dirname, './data/translationCache.json');
const translationCacheData = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8'));

const database = await getDB();
const bisMapper = useBisMapper(database);
const dungeonMapper = useDungeonMapper(database);
const itemMapper = useItemMapper(database);
const dungeonTipMapper = useDungeonTipMapper(database);
const spellMapper = useSpellMapper(database);

//#region BIS
async function createBisTable(db) {
  if (!db) {
    throw new Error('DB missing.');
  }
  // bis_type 0：overall 1：raid 2：mythic
  await db.run(`
      CREATE TABLE IF NOT EXISTS wow_bis
      (
          id             INTEGER PRIMARY KEY,
          role_class     TEXT NOT NULL,
          class_spec     TEXT NOT NULL,
          created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          version        TEXT,
          stats_priority TEXT NOT NULL,
          ratings        TEXT NOT NULL,
          bis_items      TEXT NOT NULL,
          bis_trinkets   TEXT NOT NULL,
          sort           INTEGER   DEFAULT 0,
          spec_sort      INTEGER   DEFAULT 0
      )`);
  console.log('创建 wow_bis表 完成。');
}

async function updateWowheadData() {
  function mapItems(items) {
    return items
      ?.filter((item) => item?.item && item.item.toLowerCase() !== 'item')
      .map((item) => item.id)
      .join('@');
  }

  const formattedData = Object.entries(wowheadData).reduce(
    (pre, [roleClass, specs]) => {
      specs.forEach((spec) => {
        const bisItems = [
          {
            title: '汇总',
            items: mapItems(spec.overall ?? []),
          },
          {
            title: '大秘境获取',
            items: mapItems(spec.bisItemMythic),
          },
          {
            title: '团本获取',
            items: mapItems(spec.bisItemRaid),
          },
        ];
        pre.push({
          ...spec,
          roleClass,
          classSpec: spec.spec,
          bisItems,
          bisTrinkets: spec.trinkets,
        });
      });
      return pre;
    },
    [],
  );
  const promises = formattedData.map((item) => updateBisItem(item));
  const result = await Promise.allSettled(promises);
  handleBisItemRes(result, 'wowhead');
}

async function updateMaxrollData() {
  const promises = maxrollData.map((item) => updateBisItem(item));
  const result = await Promise.allSettled(promises);
  handleBisItemRes(result, 'maxroll');
}

async function updateBisItem(dataItem) {
  try {
    const existedItem = await bisMapper.getBisByClassAndSpec(
      dataItem.roleClass,
      dataItem.classSpec,
    );

    if (dataItem.talents?.length) {
      dataItem.talents = dataItem.talents.map((item) => ({
        ...item,
        talent: translationCacheData[item.talent] ?? item.talent,
      }));
    }

    if (existedItem) {
      await bisMapper.updateBisByClassAndSpec(dataItem);
    } else {
      await bisMapper.insertBis(dataItem);
    }
  } catch (error) {
    return Promise.reject({
      roleClass: dataItem.roleClass,
      classSpec: dataItem.classSpec,
      message: error.message,
    });
  }
}

async function updateBisSort() {
  const output = Object.entries(wowheadData).reduce(
    (pre, [key, value], classIndex) => {
      pre[key] = value.reduce((specPre, cur, specIndex) => {
        specPre[cur.spec] = specIndex;
        return specPre;
      }, {});
      pre[key].sort = classIndex;

      return pre;
    },
    {},
  );

  console.log(output);
}

// 展示 更新数据库的结果 日志
function handleBisItemRes(result, tag) {
  const errors = result.filter((item) => item.status !== 'fulfilled');
  if (errors.length) {
    console.log(
      errors
        .map(
          (item) =>
            `插入失败：${item.value.classSpec} ${item.value.roleClass}, ${item.value.message}`,
        )
        .join(';'),
    );
  } else {
    console.log(`插入${tag}的数据成功。`);
  }
}

//#endregion

//#region 装备物品
async function createItemTable(db) {
  if (!db) {
    throw new Error('DB missing.');
  }
  await db.run(`
      CREATE TABLE IF NOT EXISTS wow_item
      (
          id      INTEGER PRIMARY KEY NOT NULL,
          slot    TEXT,
          name    TEXT                NOT NULL,
          source  TEXT,
          image   TEXT,
          preview TEXT
      )`);
  console.log('创建 wow_item表 完成。');
}

async function updateItemData() {
  function isIncludeLetter(input) {
    const regex = /[a-zA-Z]/;
    return regex.test(input);
  }

  function searchItems(output, items) {
    items.forEach((item) => {
      if (!item || item.item === 'Item') {
        return;
      }
      const hasFound = output.some((outputItem) => {
        if (outputItem.item === item.item.trim()) {
          if (outputItem.id === item.id) {
            // 寻找了 source 翻译好的 装备， 更新之
            if (
              outputItem.source.source !== item.source.source &&
              !isIncludeLetter(item.source.source)
            ) {
              outputItem.source = item.source;
            }

            return true;
          }
          console.log(
            `检测到名称相同的物品, 具体不同的ID，均已录入，请手动核实有效ID。物品名称：${outputItem.item}`,
          );
          return false;
        }
      });
      if (!hasFound) {
        output.push(item);
      }
    });
    return output;
  }

  const slotItems = Object.values(wowheadData).reduce((pre, cur) => {
    cur.forEach((spec) => {
      pre = searchItems(pre, [
        ...(spec.overall ?? []),
        ...spec.bisItemRaid,
        ...spec.bisItemMythic,
      ]);
    });
    return pre;
  }, []);

  async function updateItem(item) {
    if (item.id) {
      const foundItem = await itemMapper.getItemById(item.id);
      if (foundItem) {
        await itemMapper.updateItemById(item);
      } else {
        try {
          await itemMapper.insertItem(item);
        } catch (error) {
          throw new Error({
            id: item.id,
            name: item.name,
            message: error.message,
          });
        }
      }
    } else {
      return Promise.reject({
        id: null,
        name: item.name,
        message: '该物品无ID字段',
      });
    }
  }

  const updatePromises = slotItems.map((item) => updateItem(item));
  const result = await Promise.allSettled(updatePromises);
  const errors = result.filter((res) => res.status !== 'fulfilled');
  if (errors.length) {
    errors.forEach((errorItem) => {
      console.log(
        `插入 装备数据 失败：${errorItem.reason.name}, ${errorItem.reason.message}`,
      );
    });
  } else {
    console.log('插入 装备数据 成功。');
  }
}

updateItemData();

async function updateItemDataByBlizz() {
  const data = await itemMapper.getUntranslated();

  async function updateEachItem(item) {
    const blizzData = await queryBlizzItemById(item.id);
    await itemMapper.updateItemById({
      id: item.id,
      slot: blizzData.inventory_type.name,
      item: blizzData.name,
      preview: JSON.stringify(blizzData),
    });
  }

  const promises = data.map((item) => updateEachItem(item));
  const results = await Promise.allSettled(promises);
  const errors = results.filter((result) => result.status !== 'fulfilled');
  if (errors.length) {
    console.log(`装备获取失败计数: ${errors.length}`);
  } else {
    console.log(`更新装备信息成功计数: ${results.length}`);
  }
}

//#endregion

//#region 地下城
async function createDungeonTable(db) {
  if (!db) {
    throw new Error('DB missing.');
  }
  await db.run(`CREATE TABLE IF NOT EXISTS wow_dungeon
                (
                    id      INTEGER PRIMARY KEY NOT NULL,
                    name_zh TEXT                NOT NULL,
                    name_en TEXT                NOT NULL,
                    booses  TEXT
                )`);
  console.log('创建 wow_dungeon表 完成。');
}

async function updateDungeonData() {
  try {
    const data = await blizzAPI.query(
      '/data/wow/mythic-keystone/dungeon/index',
      {
        params: {
          namespace: 'dynamic-us',
        },
      },
    );

    async function insertDungeon(dungeon) {
      try {
        const existed = await dungeonMapper.getDungeonsById(dungeon.id);
        if (!existed?.length) {
          await dungeonMapper.insertDungeon(
            dungeon.id,
            dungeon.name.zh_CN,
            dungeon.name.en_US,
          );
          return { id: dungeon.id, message: 'Insert succeed.' };
        }
      } catch (error) {
        return Promise.reject({ id: dungeon.id, message: error.message });
      }
    }

    const dungeonPromises = data.dungeons.map((dungeon) =>
      insertDungeon(dungeon),
    );
    const res = await Promise.allSettled(dungeonPromises);
    const hasError = res.filter((item) => item.status !== 'fulfilled');
    if (hasError.length) {
      console.log(
        `以下地下城插入表失败 :${hasError
          .map((item) => item.reason.id)
          .join(',')}`,
      );
    }
  } catch (error) {
    console.log(error);
  }
}

//#endregion

//#region 地下城tip
async function createDungeonTipTable(db) {
  if (!db) {
    throw new Error('DB missing.');
  }

  await db.run(`CREATE TABLE IF NOT EXISTS wow_dungeon_tip
                (
                    id         INTEGER PRIMARY KEY NOT NULL,
                    role_class TEXT                NOT NULL,
                    class_spec TEXT                NOT NULL,
                    dungeon_id INTEGER             NOT NULL,
                    tips       TEXT                NOT NULL,
                    tips_en    TEXT                NOT NULL,
                    FOREIGN KEY (dungeon_id) REFERENCES wow_dungeon (id)
                )`);
}

function loadTranslationCache() {
  let translationCache = new Map();
  try {
    const data = fs.readFileSync(CACHE_PATH, 'utf-8');
    const rawCache = JSON.parse(data);
    translationCache = new Map(Object.entries(rawCache));
    console.log(`已加载历史翻译缓存，条目数：${translationCache.size}`);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // 文件不存在时创建空缓存
      console.log('未找到历史翻译缓存，将创建新文件');
      translationCache = new Map();
    } else {
      console.warn('加载翻译缓存失败，使用空缓存:', error.message);
    }
  } finally {
    return translationCache;
  }
}

function saveTranslationCache(input) {
  try {
    // 将 Map 转换为普通对象
    const rawCache = Object.fromEntries(input);
    fs.writeFileSync(CACHE_PATH, JSON.stringify(rawCache, null, 2), 'utf-8');
    console.log(`已保存翻译缓存，条目数：${input.size}`);
  } catch (error) {
    console.warn('保存翻译缓存失败:', error.message);
  }
}

async function updateDungeonTipData() {
  let translatedTotalCount = 0;
  let translatedSuccessCount = 0;
  const dungeonNameIdMap = {};
  const trashTipMap = {};
  const dungeonBossesCache = {};
  const translationCache = loadTranslationCache();

  async function insertTip(roleClass, classSpec, tip) {
    let currentDungeon;
    try {
      if (dungeonNameIdMap[tip.dungeonTitle]) {
        currentDungeon = dungeonNameIdMap[tip.dungeonTitle];
      } else {
        const dungeon = await dungeonMapper.getDungeonByName({
          name_en: tip.dungeonTitle,
        });
        currentDungeon = dungeon;
        dungeonNameIdMap[tip.dungeonTitle] = dungeon;
      }

      const existedDungeonTip = await dungeonTipMapper.getDungeonTipByCondition(
        roleClass,
        classSpec,
        currentDungeon.id,
      );

      const translatedTip = await translateDungeonTip(
        tip.children,
        tip.dungeonTitle,
      );

      const params = {
        roleClass,
        classSpec,
        dungeonId: currentDungeon.id,
        tips: JSON.stringify({
          dungeonTitle: currentDungeon.name_zh,
          children: translatedTip,
        }),
        tips_en: JSON.stringify(tip),
      };

      if (existedDungeonTip) {
        await dungeonTipMapper.updateDungeonTip(params);
      } else {
        await dungeonTipMapper.insertDungeonTip(params);
      }

      return {
        roleClass,
        classSpec,
        dungeon: currentDungeon.name_zh,
        message: 'Insert succeed',
      };
    } catch (error) {
      throw new Error({
        roleClass,
        classSpec,
        dungeon: currentDungeon.name_zh,
        message: error.message,
      });
    }
  }

  async function insertSpec(spec) {
    const tipPromises = spec.dungeonTips.map((tip) =>
      insertTip(spec.roleClass, spec.classSpec, tip),
    );
    const insertTipResults = await Promise.allSettled(tipPromises);
    const errors = insertTipResults.filter((res) => res.status !== 'fulfilled');
    if (errors.length) {
      errors.forEach((error) => {
        console.log(`插入 地下城TIPS 失败：${JSON.stringify(error.value)}`);
      });
    } else {
      console.log(`插入 地下城TIPS 成功：${spec.classSpec} ${spec.roleClass}`);
    }
  }

  async function translateDungeonTip(tips, dungeonTitle) {
    if (!tips?.length) {
      return [];
    }

    async function getSpellNameById(spell) {
      const spellData = await spellMapper.getSpellById(spell.id);
      return { titleOrigin: spell.title, titleZH: spellData.name_zh };
    }

    async function recurseTranslate(tip, dungeonTitle) {
      if (tip.title === 'Trash Tips') {
        tip.title = '小怪';

        // 不同专精 相同副本的小怪TIPS一致，可以依赖缓存
        if (trashTipMap[dungeonTitle]) {
          tip.children = trashTipMap[dungeonTitle];
        } else {
          tip.children = await translateDungeonTip(tip.children, dungeonTitle);
        }
      } else if (tip.title === 'Boss Tips') {
        tip.title = 'BOSS';
        tip.children = await translateDungeonTip(tip.children, dungeonTitle);
      } else if (tip.title === 'Pre Dungeon Start') {
        tip.title = '插钥匙前';
        tip.children = await translateDungeonTip(tip.children, dungeonTitle);

        // BOSS 名称
      } else if (tip.title) {
        if (!dungeonBossesCache[dungeonTitle]) {
          const dungeon = await dungeonMapper.getDungeonByName({
            name_en: dungeonTitle,
          });
          if (dungeon) {
            dungeonBossesCache[dungeonTitle] = JSON.parse(dungeon.bosses);
          } else {
            console.log(`未获取到地下城的数据： ${dungeonTitle}。`);
          }
        }
        const boss = dungeonBossesCache[dungeonTitle]?.find(
          (item) => item.name.en_US === tip.title,
        );
        tip.title = boss?.name.zh_CN ?? tip.title;
        tip.children = await translateDungeonTip(tip.children, dungeonTitle);

        // 着重需要翻译的 TIPS
      } else if (tip.totalText) {
        // 准备好翻译过的spell
        const validSpells = tip.spells?.filter(
          (spell) => spell.id && spell.title,
        );
        let translatedSpells = [];
        if (validSpells?.length) {
          const spellPromises = validSpells.map((spell) =>
            getSpellNameById(spell),
          );
          const spellResults = await Promise.allSettled(spellPromises);
          translatedSpells = spellResults.map((result) => result.value);
        }

        // 替换原句中的技能名称
        if (translatedSpells.length) {
          translatedSpells.forEach((spell) => {
            tip.totalText = tip.totalText.replaceAll(
              spell.titleOrigin,
              spell.titleZH,
            );
          });
        }

        // TODO: 待接入deepseek
        const data = await translate(tip.totalText);
        tip.totalText = data;

        return translateDungeonTip(tip.children, dungeonTitle);
      }
    }

    // TODO: 副本前的步骤攻略文本 获取异常
    async function translate(value) {
      translatedTotalCount++;
      if (translationCache.has(value)) {
        translatedSuccessCount++;
        console.log(
          `翻译成功(缓存)：${translatedSuccessCount} / ${translatedTotalCount}`,
        );
        return translationCache.get(value);
      }

      function buildValue() {
        return (
          '按照中文的阅读习惯翻译以下的内容，它是魔兽世界的副本攻略。原文本中已经是中文的部分和"["、"]"符号请保留。如果原文本只包含中文或者"["、"]"符号，则不需要翻译。请给出翻译后的文字：' +
          value
        );
      }

      const limiter = new Bottleneck({
        maxConcurrent: 5, // 适当并行
        minTime: 50, // 50ms间隔 → 20次/秒
        reservoir: 30,
        reservoirRefreshAmount: 30,
        reservoirRefreshInterval: 1000,
      });
      try {
        const translatedText = await limiter.schedule(async () => {
          const completion = await openai.chat.completions.create({
            messages: [{ role: 'assistant', content: buildValue(value) }],
            model: 'deepseek-chat',
          });
          return completion.choices[0].message.content;
        });

        translationCache.set(value, translatedText);
        translatedSuccessCount++;
        console.log(
          `翻译成功：${translatedSuccessCount} / ${translatedTotalCount}`,
        );
        return translatedText;
      } catch (error) {
        console.log(
          `翻译失败：${translatedSuccessCount} / ${translatedTotalCount}`,
        );
        console.log(error);
        return value;
      }
    }

    const translatePromise = tips.map((tip) =>
      recurseTranslate(tip, dungeonTitle),
    );
    await Promise.allSettled(translatePromise);
    return tips;
  }

  const limit = pLimit(1);
  const insertSpecPromises = maxrollData.map((spec) =>
    limit(() => insertSpec(spec)),
  );
  await Promise.allSettled(insertSpecPromises);

  saveTranslationCache(translationCache);

  if (translatedSuccessCount === translatedTotalCount) {
    console.log('翻译全部完成。');
  } else {
    console.log('翻译未全部完成，重试。');
    updateDungeonTipData();
  }

  process.on('exit', () => saveTranslationCache(translationCache));
  process.on('SIGINT', () => {
    saveTranslationCache(translationCache).then(() => process.exit());
  });
}

//#endregion

//#region 法术
async function createSpellTable(db) {
  if (!db) {
    throw new Error('DB missing.');
  }
  await db.run(`CREATE TABLE IF NOT EXISTS wow_spell
                (
                    id          INTEGER PRIMARY KEY NOT NULL,
                    id_wow_db   INTEGER,
                    name_en     TEXT,
                    name_zh     TEXT,
                    range       INTEGER,
                    cost        TEXT,
                    cast_time   REAL,
                    cooldown    INTEGER,
                    description TEXT
                )`);
}

// 弃用：暴雪接口不稳定，数据不全。 不如直接爬 wowhead
async function updateSpellData() {
  const limit = pLimit(10);

  function collectAllSpells(data) {
    const result = [];

    function traverse(node) {
      if (node.spells) {
        result.push(...node.spells);
      }
      if (node.children) {
        node.children.forEach((child) => traverse(child));
      }
    }

    data.forEach((item) => traverse(item));
    return result;
  }

  async function querySpell(spell) {
    let err;

    let hasSearchName = false;
    let hasSearchFixedId = false;
    let hasFoundMatchedName = false;
    try {
      // ID 查询不到的话，用名称能查到数据的ID
      let fixedId;
      const spellByName = await blizzAPI.query(`/data/wow/search/spell`, {
        params: {
          namespace: 'static-us',
          'name.en_US': spell.title,
          orderby: 'id',
          _page: 1,
        },
      });
      hasSearchName = true;
      const matched = spellByName?.results.find(
        (item) => item.data.name.en_US === spell.title,
      );
      if (matched) {
        hasFoundMatchedName = true;
        fixedId = matched.data.id;

        const spellByFixId = await blizzAPI.query(
          `/data/wow/spell/${fixedId}`,
          {
            params: {
              namespace: 'static-us',
            },
          },
        );
        hasSearchFixedId = true;
        if (spellByFixId?.description) {
          currentCount++;
          console.log(
            `有数据，总进度: ${currentCount} / ${totalCount} ~ ${spellByFixId.name.zh_CN}`,
          );
          return {
            ...spell,
            idWowDB: spellByFixId.id,
            description: spellByFixId.description.zh_CN,
            nameZH: spellByFixId.name.zh_CN,
            nameEN: spellByFixId.name.en_US,
          };
        }
      }

      // 官方接口查不到数据，只能自行处理
      currentCount++;
      console.log(
        `无数据，查询名称: ${hasSearchName ? '√' : 'x'}, 查询名称成功：${
          hasFoundMatchedName ? '√' : 'x'
        }, 查询ID: ${hasSearchFixedId ? '√' : 'x'}, 原因: ${
          err?.message
        } ,总进度: ${currentCount} / ${totalCount} ~${spell.title}`,
      );
      return { ...spell, nameEN: spell.title, error: err };
    } catch (error) {
      err = error;
      if (error.code === 'ECONNABORTED') {
        console.log(`${error.message}: ${error.config?.url}`);
      }
      return { ...spell, nameEN: spell.title, error: err };
    }
  }

  async function insertSpell(spell) {
    try {
      const existedSpell = await spellMapper.getSpellById(spell.id);
      if (existedSpell) {
        await spellMapper.updateSpellById(spell);
      } else {
        await spellMapper.insertSpell(spell);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const allSpells = maxrollData.reduce((pre, cur) => {
    const spells = collectAllSpells(cur.dungeonTips);
    spells.forEach((spell) => {
      if (!pre.some((item) => item.id === spell.id)) {
        pre.push({
          id: spell.id,
          title: spell.title.replace(/[\u200B-\u200D\uFEFF]/g, ''),
        });
      }
    });

    return pre;
  }, []);
  let totalCount = allSpells.length;
  let currentCount = 0;

  const promises = allSpells.map((spell) => limit(() => querySpell(spell)));
  const spellResults = await Promise.allSettled(promises);

  const spellHasDesc = spellResults.filter((item) => item.value?.description);

  const insertPromises = spellResults.map((item) => insertSpell(item.value));
  const insertResults = await Promise.allSettled(insertPromises);

  console.log(spellHasDesc);
}

//#endregion

export async function init() {
  try {
    await createBisTable(database);
    await createItemTable(database);
    await createDungeonTable(database);
    await createDungeonTipTable(database);

    await updateDungeonData();

    await updateDungeonTipData();

    await updateWowheadData();
    await updateMaxrollData();

    await updateItemData();
  } catch (error) {
    console.log(error.message);
  } finally {
    database.close();
  }
}
