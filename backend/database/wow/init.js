import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import pLimit from 'p-limit';
import axios from 'axios';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url'; // 导入 fileURLToPath

import useBlizzAPI from '../../util/blizz.js';
import { useBisMapper } from './mapper/bisMapper.js';
import { useDungeonMapper } from './mapper/dungeonMapper.js';
import { useItemMapper } from './mapper/itemMapper.js';
import { useDungeonTipMapper } from './mapper/dungeonTipMapper.js';
import { useSpellMapper } from './mapper/spellMapper.js';

const blizzAPI = useBlizzAPI();

// 获取当前文件的路径和目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const wowheadData = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, './data/wowhead.json'))
);
const maxrollData = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, './data/maxroll.json'))
);

const database = await getDB();
const bisMapper = useBisMapper(database);
const dungeonMapper = useDungeonMapper(database);
const itemMapper = useItemMapper(database);
const dungeonTipMapper = useDungeonTipMapper(database);
const spellMapper = useSpellMapper(database);
export async function getDB() {
  return open({
    filename: path.resolve(__dirname, '../database.db'),
    driver: sqlite3.verbose().Database,
  });
}

//#region BIS
async function createBisTable(db) {
  if (!db) {
    throw new Error('DB missing.');
  }
  // bis_type 0：overall 1：raid 2：mythic
  await db.run(`
    CREATE TABLE IF NOT EXISTS wow_bis (
      id INTEGER PRIMARY KEY,
      role_class TEXT NOT NULL,
      class_spec TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      origin_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      stats_priority TEXT NOT NULL,
      ratings TEXT NOT NULL,
      bis_items TEXT NOT NULL,
      bis_trinkets TEXT NOT NULL,
      sort INTEGER DEFAULT 0,
      spec_sort INTEGER DEFAULT 0
    )`);
  console.log('创建 wow_bis表 完成。');
}
async function updateWowheadData() {
  function mapItems(items) {
    return items
      .filter((item) => item?.item && item.item.toLowerCase() !== 'item')
      .map((item) => item.item.trim())
      .join('@');
  }
  const formattedData = Object.entries(wowheadData).reduce(
    (pre, [roleClass, specs]) => {
      specs.forEach((spec) => {
        const bisItems = [
          {
            title: '汇总',
            items: mapItems(spec.overall),
          },
          {
            title: '大秘境',
            items: mapItems(spec.bisItemMythic),
          },
          {
            title: '团本',
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
    []
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
      dataItem.classSpec
    );
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
    {}
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
            `插入失败：${item.value.classSpec} ${item.value.roleClass}, ${item.value.message}`
        )
        .join(';')
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
    CREATE TABLE IF NOT EXISTS wow_item (
      id INTEGER PRIMARY KEY NOT NULL,
      slot TEXT,
      name TEXT NOT NULL,
      source TEXT,
      image TEXT,
      preview TEXT
    )`);
  console.log('创建 wow_item表 完成。');
}
async function updateItemData() {
  function searchItems(output, items) {
    items.forEach((item) => {
      if (!item || item.item === 'Item') {
        return;
      }
      const hasFound = output.some(
        (outputItem) => outputItem.item === item.item.trim()
      );
      if (!hasFound) {
        output.push(item);
      }
    });
    return output;
  }

  const slotItems = Object.values(wowheadData).reduce((pre, cur) => {
    cur.forEach((spec) => {
      pre = searchItems(pre, [
        ...spec.overall,
        ...spec.bisItemRaid,
        ...spec.bisItemMythic,
      ]);
    });
    return pre;
  }, []);

  async function updateItem(item) {
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
  }

  const updatePromises = slotItems.map((item) => updateItem(item));
  const result = await Promise.allSettled(updatePromises);
  const errors = result.filter((res) => res.status !== 'fulfilled');
  if (errors.length) {
    errors.forEach((errorItem) => {
      console.log(
        `插入 装备数据 失败：${errorItem.value.name}, ${errorItem.value.message}`
      );
    });
  } else {
    console.log('插入 装备数据 成功。');
  }
}
//#endregion

//#region 地下城
async function createDungeonTable(db) {
  if (!db) {
    throw new Error('DB missing.');
  }
  await db.run(`CREATE TABLE IF NOT EXISTS wow_dungeon (
    id INTEGER PRIMARY KEY NOT NULL,
    name_zh TEXT NOT NULL,
    name_en TEXT NOT NULL,
    booses TEXT
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
      }
    );
    async function insertDungeon(dungeon) {
      try {
        await dungeonMapper.insertDungeon(
          dungeon.id,
          dungeon.name.zh_CN,
          dungeon.name.en_US
        );
        return { id: dungeon.id, message: 'Insert succeed.' };
      } catch (error) {
        return Promise.reject({ id: dungeon.id, message: error.message });
      }
    }

    const dungeonPromises = data.dungeons.map((dungeon) =>
      insertDungeon(dungeon)
    );
    const res = await Promise.allSettled(dungeonPromises);
    const hasError = res.filter((item) => item.status !== 'fulfilled');
    if (hasError.length) {
      console.log(
        `以下地下城插入表失败 :${hasError
          .map((item) => item.reason.id)
          .join(',')}`
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

  await db.run(`CREATE TABLE IF NOT EXISTS wow_dungeon_tip(
    id INTEGER PRIMARY KEY NOT NULL,
    role_class TEXT NOT NULL,
    class_spec TEXT NOT NULL,
    dungeon_id INTEGER NOT NULL,
    tips TEXT NOT NULL,
    tips_en TEXT NOT NULL,
    FOREIGN KEY(dungeon_id) REFERENCES wow_dungeon(id)
  )`);
}

async function updateDungeonTipData() {
  const dungeonNameIdMap = {};
  const trashTipMap = {};
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
        currentDungeon.id
      );

      const translatedTip = await translateDungeonTip(tip.children);

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
      insertTip(spec.roleClass, spec.classSpec, tip)
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

        // BOSS 名称不翻译，界面展示时用 X号BOSS 代替
      } else if (tip.title === 'Pre Dungeon Start') {
        tip.title = '插钥匙前';
        tip.children = await translateDungeonTip(tip.children, dungeonTitle);
      } else if (tip.title) {
        tip.children = await translateDungeonTip(tip.children, dungeonTitle);

        // 着重需要翻译的 TIPS
      } else if (tip.totalText) {
        // 准备好翻译过的spell
        const validSpells = tip.spells?.filter(
          (spell) => spell.id && spell.title
        );
        let translatedSpells = [];
        if (validSpells?.length) {
          const spellPromises = validSpells.map((spell) =>
            getSpellNameById(spell)
          );
          const spellResults = await Promise.allSettled(spellPromises);
          translatedSpells = spellResults.map((result) => result.value);
        }

        // 替换原句中的技能名称
        if (translatedSpells.length) {
          translatedSpells.forEach((spell) => {
            tip.totalText = tip.totalText.replaceAll(
              spell.titleOrigin,
              spell.titleZH
            );
          });
        }

        // TODO: 待接入deepseek
        // const data = await translate(tip.totalText);
        // tip.totalText = data;

        return translateDungeonTip(tip.children, dungeonTitle);
      }
    }

    // TODO: 待接入deepseek
    async function translate(value) {
      const res = await axios.post(
        'http://47.109.25.141:3000/api/common/translate',
        {
          text: value,
          useMap: true,
        }
      );
      return res.data;
    }

    const translatePromise = tips.map((tip) =>
      recurseTranslate(tip, dungeonTitle)
    );
    await Promise.allSettled(translatePromise);
    return tips;
  }

  const insertSpecPromises = maxrollData.map((spec) => insertSpec(spec));
  await Promise.allSettled(insertSpecPromises);
}

//#endregion

//#region 法术
async function createSpellTable(db) {
  if (!db) {
    throw new Error('DB missing.');
  }
  await db.run(`CREATE TABLE IF NOT EXISTS wow_spell(
    id INTEGER PRIMARY KEY NOT NULL,
    id_wow_db INTEGER,
    name_en TEXT,
    name_zh TEXT,
    range INTEGER,
    cost TEXT,
    cast_time REAL,
    cooldown INTEGER,
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
        (item) => item.data.name.en_US === spell.title
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
          }
        );
        hasSearchFixedId = true;
        if (spellByFixId?.description) {
          currentCount++;
          console.log(
            `有数据，总进度: ${currentCount} / ${totalCount} ~ ${spellByFixId.name.zh_CN}`
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
        } ,总进度: ${currentCount} / ${totalCount} ~${spell.title}`
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
