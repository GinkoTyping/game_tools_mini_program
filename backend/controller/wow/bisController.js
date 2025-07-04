import { BlizzAPI } from 'blizzapi';
import Bottleneck from 'bottleneck';
import { configDotenv } from 'dotenv';

import path from 'path';
import { fileURLToPath } from 'url';

import { getDailyDB, getDB } from '../../database/utils/index.js';
import { getDynamicDB } from '../../database/utils/index.js';

import { useBisMapper } from '../../database/wow/mapper/bisMapper.js';
import { useItemMapper } from '../../database/wow/mapper/itemMapper.js';
import {
  useSpecBisCountMapper,
} from '../../database/wow/mapper/specBisCountMapper.js';
import { isLocal } from '../../auth/validateAdmin.js';
import spriteMap from '../../assets/wow/sprites/sprite-map.js';
import {
  collectArchonByApi,
  collectBisOverview, getArchonHash,
} from '../../database/wow/data/archon-bis/crawler.js';
import {
  collectMaxrollBis,
} from '../../database/wow/data/maxroll-bis/crawler.js';
import { useTierListMapper } from '../../database/wow/mapper/tierListMapper.js';
import {
  useSpecStatMapper,
} from '../../database/wow/mapper/daliy/specStatMapper.js';
import { useTalentMapper } from '../../database/wow/mapper/static/talentMapper.js';
import { useSpellMapper } from '../../database/wow/mapper/spellMapper.js';

let api;
const database = await getDB();
const bisMapper = useBisMapper(database);
const itemMapper = useItemMapper(database);
const tierListMapper = useTierListMapper(database);
const spellMapper = useSpellMapper(database);

const dynamicDB = await getDynamicDB();
const specBisCountMapper = useSpecBisCountMapper(dynamicDB);

const dailyDB = await getDailyDB();
const specStatMapper = useSpecStatMapper(dailyDB);

function setBlizzAPI() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  configDotenv({ path: path.resolve(__dirname, '../../.env') });
  api = new BlizzAPI({
    region: 'us',
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
  });
}

setBlizzAPI();

export async function queryBlizzItemById(id, locale) {
  return api.query(`/data/wow/item/${id}`, {
    params: {
      namespace: 'static-us',
      locale: locale ?? 'zh_CN',
    },
  });
}

function adaptDiscBelt(data) {
  if (data?.name === '牢固信息保全容器' && data?.preview_item.spells) {
    data.preview_item.spells = [
      {
        spell: {
          id: -1,
        },
        description: '装备：特效推荐详下方的"大秘境腰带"章节',
      },
    ];
  }
  return data;
}

export async function getItemPreviewById(req, res) {
  if (!req.params.id || req.params.id === 'null') {
    res.status(404).json({ message: '物品的ID为空' });
    return;
  }

  const item = await itemMapper.getItemById(req.params.id);
  if (item?.preview) {
    res.json({
      ...adaptDiscBelt(JSON.parse(
        req.query?.locale === 'en_US' ? item.preview_en : item.preview,
      )),
      source: JSON.parse(item.source),
      image: item.image,
    });
  } else {
    try {
      const data = await queryBlizzItemById(req.params.id, req.query?.locale);

      const insertResult = await itemMapper.addOrUpdatePreviewById(
        req.params.id,
        data,
        req.query?.locale,
      );
      console.log(
        `更新物品${insertResult?.changes ? '成功' : '失败'}: ${data.id},${
          data.name
        }`,
      );

      res.json(data);
    } catch (error) {
      console.log(error?.config?.url, error?.message);
      res.status(500).json({ message: '获取物品信息失败' });
    }
  }
}

async function mapBisTrinket(dataList, propKey) {
  async function mapByTier(tierItem) {
    const data = await Promise.allSettled(
      tierItem[propKey]?.map(async (item) => {
        const existedItem = await itemMapper.getItemById(item.id);
        return {
          ...item,
          image: existedItem?.image,
          fullImageURL: undefined,
        };
      }),
    );
    return {
      ...tierItem,
      [propKey]: data.map((item) => item.value),
    };
  }

  const allData = await Promise.allSettled(
    dataList.map((item) => mapByTier(item)),
  );
  return allData.map((item) => item.value);
}

async function mapEnhancements(enhancements, needDetail) {
  async function mapEnhancementItem(item) {
    const slotObj = {};
    if (needDetail) {
      const { slot, name, source, image } = await itemMapper.getItemById(
        item.id,
      );
      slotObj.name = name;
      slotObj.slot = slot;
      slotObj.source = JSON.parse(source);
      slotObj.image = image;
    }

    const items = (
      await Promise.allSettled(
        item.enhancements.map((id) => itemMapper.getItemById(id)),
      )
    )?.map((enhancement) => ({
      ...enhancement.value,

      item_class: JSON.parse(enhancement.value?.preview)?.item_class?.name,
      preview: undefined,
      preview_en: undefined,
      name_en: undefined,
      slot: undefined,
      source: undefined,
    }));
    return {
      ...item,
      ...slotObj,
      name_en: undefined,
      items: undefined,
      enhancements: items,
    };
  }

  const results = await Promise.allSettled(
    enhancements.map((item) => mapEnhancementItem(item)),
  );
  return results.map((result) => result.value);
}

// maxroll bis获取宝石，archon popularity bis获取宝石以外的
const CYRCES_CIRCLET_ID = 228411;

function combineEnhancement(item, maxrollEnhancements, archonEnhancements) {
  const cloneArchonData = [...archonEnhancements];
  const cloneMaxrollData = [...maxrollEnhancements];

  // 从 archon 获取 其他
  let enhancementsByMaxroll = [];
  let enhancementsByArchon = [];
  if (item.slot === '手指') {
    let spliceIndex = -1;
    const isCyrcesCirclet = item.id === CYRCES_CIRCLET_ID;
    const cyrcesCirclet = cloneArchonData.find(
      (enhancement) => enhancement.id === CYRCES_CIRCLET_ID,
    );

    if (isCyrcesCirclet && cyrcesCirclet) {
      enhancementsByArchon = cyrcesCirclet.enhancements;
    } else {
      const spliceIndex = cloneMaxrollData.findIndex(
        (enhancement) => enhancement.slot === '手指',
      );
      if (spliceIndex !== -1) {
        enhancementsByArchon = cloneMaxrollData.splice(spliceIndex, 1)[0]
          .enhancements;
      }
    }
  } else {
    // 从 maxroll 获取 宝石
    enhancementsByMaxroll =
      maxrollEnhancements.find((maxrollItem) => maxrollItem.slot === item.slot)
        ?.enhancements ?? [];
    enhancementsByMaxroll = enhancementsByMaxroll.filter(maxrollEnhancement => {
      // maxroll中收集了装备美化的数据
      if (item.source?.source === '制造装备') {
        return true;
      }
      return maxrollEnhancement.item_class === '宝石';
    });

    enhancementsByArchon =
      cloneArchonData
        .find((enhancement) => enhancement.slot === item.slot)
        ?.enhancements.filter((enhancement) => {
        // 使用maxroll的宝石数据
        if (enhancement.item_class === '宝石') {
          return false;
        }

        // 公函类型的道具只能强化制造装备
        if (enhancement.item_class === '商业技能') {
          return item.source?.source === '制造装备';
        }

        return true;
      }) ?? [];
  }

  return [...enhancementsByMaxroll, ...enhancementsByArchon].map((item) => ({
    ...item,
    preview: undefined,
    preview_en: undefined,
  }));
}

async function mapBisItems(bisItems, maxrollEnhancements, archonEnhancements) {
  async function queryItem(id) {
    // 避免返回的data为null，导致前台报错
    const data = (await itemMapper.getItemById(id)) ?? {
      slot: 'N/A',
      name: 'N/A',
      source: '{"source": "N/A"}',
    };
    return {
      ...data,
      name_en: undefined,
      source: JSON.parse(data.source),
    };
  }

  async function mapBisItemsByType(bisItemsByType) {
    const promises = bisItemsByType.items
      .split('@')
      .map((item) => queryItem(item));
    const data = await Promise.allSettled(promises);

    return {
      ...bisItemsByType,
      title: bisItemsByType.title,
      items: data.map((item, index) => {
        let enhancements = [];
        if (bisItemsByType.title === '汇总') {
          enhancements = combineEnhancement(
            item.value,
            maxrollEnhancements,
            archonEnhancements,
          );
        }

        return {
          ...item.value,
          enhancements,
          preview: undefined,
          preview_en: undefined,
        };
      }),
    };
  }

  const promises = bisItems.map((item) => mapBisItemsByType(item));
  const bisItemResult = await Promise.allSettled(promises);
  return bisItemResult.map((item) => item.value);
}

function sortBisItems(bisItems) {
  return bisItems.map((tier) => {
    const sortedItems = tier.items
      .reduce(
        (pre, cur) => {
          const [commonItems, rings, trinkets, weapons] = pre;
          if (cur.slot === '手指') {
            rings.push(cur);
          } else if (cur.slot === '饰品') {
            trinkets.push(cur);
          } else if (cur.slot?.includes('部')) {
            commonItems.push(cur);
          } else {
            weapons.push(cur);
          }

          // 处理异常的source
          if (!cur.source) {
            cur.source = { source: '/', isLoot: false };
          }

          return [commonItems, rings, trinkets, weapons];
        },
        [[], [], [], []],
      )
      .flat();
    return {
      ...tier,
      items: sortedItems,
    };
  });
}

async function mapSimpleItems(items) {
  const data = await Promise.allSettled(
    items.map(async (item) => {
      const itemData = await itemMapper.getItemById(item);
      return {
        ...itemData,
        preview: undefined,
        preview_en: undefined,
        source: undefined,
        name_en: undefined,
        slot: undefined,
      };
    }),
  );
  return data.map((item) => item.value);
}

async function mapWowheadBis(wowheadBis) {
  function mapTypeName(name) {
    if (name === 'all') {
      return '外网推荐';
    }
    if (name === 'raid') {
      return '团本';
    }
    if (name === 'mythic') {
      return '大秘境';
    }
    return name;
  }

  const detailedPuzzlingCartelChipAdvice = await Promise.allSettled(wowheadBis.detailedPuzzlingCartelChipAdvice.map(
    async kind => {
      const itemResults = await Promise.allSettled(kind.data.options.map(async item => {
          const itemData = await itemMapper.getItemById(item.id);
          return {
            ...item,
            name: itemData.name,
            image: itemData.image,
          };
        }),
      );
      kind.typeName = mapTypeName(kind.type);
      kind.data.options = itemResults.map(result => result.value).filter(item => item);
      return kind;
    }),
  );
  const ALL_CORRUPTIONS = [
    239095,
    239093,
    239090,
    239088,
    239086,
    239084,
    239080,
    239078,
    238680,
    238678,
    238405,
    238403,
  ];
  let detailedCorruptionItems = await mapSimpleItems(ALL_CORRUPTIONS);
  detailedCorruptionItems = detailedCorruptionItems.map(item => ({
    ...item,
    included: wowheadBis.corruptions?.items.some(corruption => corruption.id === item.id),
  }));
  return {
    ...wowheadBis,
    corruptions: { ...wowheadBis.corruptions, items: detailedCorruptionItems },
    detailedPuzzlingCartelChipAdvice: detailedPuzzlingCartelChipAdvice.map(item => item.value),
  };
}

function mapArchonStatsData(statsData) {
  function mergeIntervals(data) {
    const merged = [];
    for (let i = 0; i < data.length; i += 2) {
      const group = data.slice(i, i + 2);
      const total = group.reduce((sum, item) => sum + item.sampleCount, 0);
      const lowerEnd = group[group.length - 1]?.interval.lowerEnd ?? 0;
      const upperEnd = group[0]?.interval.upperEnd ?? 0;
      merged.push({
        sampleCount: total,
        interval: { lowerEnd, upperEnd },
      });
    }
    return merged;
  }

  if (statsData) {
    statsData.priority = statsData.priority.map(item => {
      return {
        ...item,
        data: mergeIntervals(item.data),
      };
    });

    statsData.priority.forEach((item) => {
      const max = [...item.data].sort((a, b) => b.sampleCount - a.sampleCount)[0].sampleCount;
      item.data = item.data.map(count => ({
        ...count,
        percentage: (count.sampleCount / max * 100).toFixed(2) + '%',
      }));
    });
  }
  return statsData;
}

function getRotationAssistRank() {
  return [
    {
      title: 'S',
      subTitle: '-5%',
      children: [
        {
          roleClass: 'warlock',
          classSpec: 'destruction',
        },
        {
          roleClass: 'hunter',
          classSpec: 'beast-mastery',
        },
        {
          roleClass: 'priest',
          classSpec: 'shadow',
        },
        {
          roleClass: 'paladin',
          classSpec: 'retribution',
        },
        {
          roleClass: 'death-knight',
          classSpec: 'unholy',
        },
        {
          roleClass: 'evoker',
          classSpec: 'augmentation',
        },
        {
          roleClass: 'hunter',
          classSpec: 'marksmanship',
        },
      ],
    },
    {
      title: 'A',
      subTitle: '-10%',
      children: [
        {
          roleClass: 'mage',
          classSpec: 'frost',
        },
        {
          roleClass: 'warrior',
          classSpec: 'arms',
        },
        {
          roleClass: 'warrior',
          classSpec: 'fury',
        },
        {
          roleClass: 'shaman',
          classSpec: 'elemental',
        },
        {
          roleClass: 'shaman',
          classSpec: 'enhancement',
        },
        {
          roleClass: 'death-knight',
          classSpec: 'frost',
        },
        {
          roleClass: 'druid',
          classSpec: 'balance',
        },
        {
          roleClass: 'warlock',
          classSpec: 'demonology',
        },
        {
          roleClass: 'evoker',
          classSpec: 'devastation',
        },
        {
          roleClass: 'mage',
          classSpec: 'fire',
        },
        {
          roleClass: 'rogue',
          classSpec: 'assassination',
        },
        {
          roleClass: 'rogue',
          classSpec: 'outlaw',
        },
      ],
    },
    {
      title: 'B',
      subTitle: '-20%',
      children: [
        {
          roleClass: 'warlock',
          classSpec: 'affliction',
        },
        {
          roleClass: 'mage',
          classSpec: 'arcane',
        },
        {
          roleClass: 'rogue',
          classSpec: 'subtlety',
        },
        {
          roleClass: 'hunter',
          classSpec: 'survival',
        },
        {
          roleClass: 'druid',
          classSpec: 'feral',
        },
        {
          roleClass: 'demon-hunter',
          classSpec: 'havoc',
        },
        {
          roleClass: 'monk',
          classSpec: 'windwalker',
        },
      ],
    },
  ];
}

async function adaptDiscBeltData(data) {
  const output = await Promise.allSettled(data.map(async item => {
    const spells = Array.isArray(item.value) ? item.value : [item.value];

    const results = await Promise.allSettled(spells.map(async spell => spellMapper.getSpellById(spell)));
    return {
      ...item,
      value: results.map(result => result.value),
    };
  }));

  return output.map(item => item.value);
}


export async function getBisBySpec(req, res) {
  try {
    const roleClass = req.params.roleClass;
    const classSpec = req.params.classSpec;

    // BIS 装备
    const bisData = await bisMapper.getBisByClassAndSpec(roleClass, classSpec);
    const archonEnhancements = await mapEnhancements(
      JSON.parse(bisData.popularity_items),
      true,
    );
    const maxrollEnhancements = await mapEnhancements(
      JSON.parse(bisData.maxroll_bis).items,
    );
    let bis_items = await mapBisItems(
      JSON.parse(bisData.bis_items),
      maxrollEnhancements,
      archonEnhancements,
    );
    const popularity_items = await mapEnhancements(
      JSON.parse(bisData.popularity_items),
      true,
    );
    // 团本获取的BIS目前很鸡肋
    bis_items = bis_items.filter((item) => item.title !== '团本获取');
    // 展示archon上按热门度的配装
    bis_items.splice(1, 0, { title: '大秘境热门度', items: popularity_items });
    bis_items = sortBisItems(bis_items);

    const bis_trinkets = await mapBisTrinket(
      JSON.parse(bisData.bis_trinkets),
      'trinkets',
    );

    const wowheadBis = await mapWowheadBis(JSON.parse(bisData.wowhead_bis));

    const archonBis = JSON.parse(bisData.archon_bis);
    const popularMythicDungeonTrinkets = (
      await Promise.allSettled(
        archonBis.popularTrinkets.map(async (item) => {
          const itemData = await itemMapper.getItemById(item.id, true);
          return {
            ...item,
            ...itemData,
            name_en: undefined,
            source: undefined,
            slot: undefined,
          };
        }),
      )
    ).map((result) => result.value);

    const archonBisStats = mapArchonStatsData(archonBis?.stats);
    const archonBisRaidStats = mapArchonStatsData(archonBis?.raidStats);

    // 排名的信息
    const mythicDpsTier = await specStatMapper.getSpec(classSpec, roleClass);
    const mythicOverallTier = await tierListMapper.getSpec(
      classSpec,
      roleClass,
    );

    if (wowheadBis?.rotationAssist) {
      wowheadBis.rotationAssist.rank = getRotationAssistRank();
    }

    if (wowheadBis?.discBelt) {
      wowheadBis.discBelt = await adaptDiscBeltData(wowheadBis.discBelt);
    }

    // 避免本地调测时，引起本地的数据和服务器不一致
    if (!isLocal(req)) {
      // 访问次数 +1
      await specBisCountMapper.addSpecBisCountByClassAndSpec({
        roleClass,
        classSpec,
      });
    }
    res.json({
      ...bisData,
      bis_items,
      bis_trinkets,
      detailed_stats_priority: JSON.parse(bisData.detailed_stats_priority),
      archon_stats_priority: archonBisStats,
      archon_raid_stats_priority: archonBisRaidStats,
      ratings: JSON.parse(bisData.ratings),
      talents: JSON.parse(bisData.talents),
      wowhead_bis: wowheadBis,
      popular_mythic_dungeon_trinkets: popularMythicDungeonTrinkets,
      mythicOverallTier,
      mythicDpsTier,
      maxroll_bis: undefined,
      archon_bis: undefined,
      enhancement: undefined,
      stats_priority: undefined,
      popularity_items: undefined,
      archon_talent: undefined,
    });
  } catch (error) {
    res.status(500).json({ error: error?.message });
  }
}

export async function getTrendData(version) {
  const data = await specBisCountMapper.getAllSpecBisCount(version);
  const updateInfo = await bisMapper.getAllBisDateInfo(version);
  const updateMap = updateInfo.reduce((pre, cur) => {
    if (pre[cur.role_class]) {
      pre[cur.role_class][cur.class_spec] = cur.updated_at;
    } else {
      pre[cur.role_class] = { [cur.class_spec]: cur.updated_at };
    }
    return pre;
  }, {});
  const mappedData = data
    .reduce((pre, cur) => {
      const found = pre.find((item) => item.role_class === cur.role_class);
      const updated_at = updateMap[cur.role_class][cur.class_spec];
      if (found) {
        found.access_count += cur.count;
        found.updated_at =
          updated_at > found.updated_at ? updated_at : found.updated_at;
        found.specs.push({
          class_spec: cur.class_spec,
          access_count: cur.count,
          type: cur.type ?? undefined,
          updated_at,
        });
      } else {
        pre.push({
          role_class: cur.role_class,
          access_count: cur.count,
          updated_at,
          specs: [
            {
              class_spec: cur.class_spec,
              access_count: cur.count,
              updated_at,
              type: cur.type ?? undefined,
            },
          ],
        });
      }

      return pre;
    }, [])
    .sort((a, b) => b.access_count - a.access_count);
  return {
    trend: mappedData,
    sprite: spriteMap,
  };
}

export async function queryBisTrends(req, res) {
  const { trend, sprite } = await getTrendData(req.query?.version);
  res.json({
    trend,
    sprite,
  });
}

export async function queryBlankSourceItem(req, res) {
  const data = await itemMapper.getBlankSourceItem();
  res.json(data);
}

export async function queryUpdateItem(req, res) {
  const { id, source, image } = req.body;
  const result = await itemMapper.updateItemById({
    id,
    source,
    itemIcon: image,
  });
  res.json(`更新物品${result.changes ? '成功' : '失败'}, ID:${id}`);
}

// region 天赋树
const talentMapper = useTalentMapper(database);

export async function queryTalentBySpec(req, res) {
  try {
    const { roleClass, classSpec } = req.query;
    const data = await talentMapper.getTalent(classSpec, roleClass);

    async function mapNode(node) {
      if (node.ranks?.[0]?.tooltip) {
        const spellData = await spellMapper.getSpellById(node.ranks?.[0]?.tooltip.spell_tooltip?.spell?.id);
        node.ranks[0].tooltip.spell_tooltip.spell.image = spellData.image;
      } else if (node.ranks?.[0]?.choice_of_tooltips?.length) {
        const results = await Promise.allSettled(node.ranks[0].choice_of_tooltips.map(async (item) => {
          const spellData = await spellMapper.getSpellById(item.spell_tooltip.spell.id);
          item.spell_tooltip.spell.image = spellData.image;
          return item;
        }));
        node.ranks[0].choice_of_tooltips = results.map(item => item.value);
      }
      return node;
    }

    async function mapHeroTree(tree) {
      const nodeResults = await Promise.allSettled(tree.hero_talent_nodes.map(node => mapNode(node)));
      tree.hero_talent_nodes = nodeResults.map(item => item.value);
      return tree;
    }

    const [
      classNodeResults, specNodeResults, heroTreeResults,
      archonTalents,
    ] = await Promise.allSettled([
      Promise.allSettled(data.class_talent_nodes.map(node => mapNode(node))),
      Promise.allSettled(data.spec_talent_nodes.map(node => mapNode(node))),
      Promise.allSettled(data.hero_talent_trees.map(tree => mapHeroTree(tree))),
      bisMapper.getArchonTalent(roleClass, classSpec),
    ]);
    data.class_talent_nodes = classNodeResults.value.map(item => item.value);
    data.spec_talent_nodes = specNodeResults.value.map(item => item.value);
    data.hero_talent_trees = heroTreeResults.value.map(item => item.value);
    data.talents = archonTalents.value;

    // 设置 英雄天赋的选取率
    if (data.talents.heroTreeStats) {
      let maxCount = data.talents.heroTreeStats?.length ?? 0;
      const heroTrees = data.talents.heroTreeStats.map(item => item.id);
      data.talents.talentHeatMap.some(([nodeId, popularity, heroTreeId]) => {
        if (heroTrees.includes(heroTreeId)) {

          // 武僧的英雄天赋树id和暴雪数据库不一致
          let matchTreeId;
          if (heroTreeId === 46) {
            matchTreeId = 66;
          } else if (heroTreeId === 47) {
            matchTreeId = 64;
          } else if (heroTreeId === 45) {
            matchTreeId = 65;
          } else {
            matchTreeId = heroTreeId;
          }

          data.talents.heroTreeStats.some(tree => {
            if (tree.id === heroTreeId) {
              tree.popularity = (popularity * 100).toFixed(1) + '%';
              tree.name = data.hero_talent_trees.find((refer) => refer.id === matchTreeId)?.name;
              maxCount--;
              return true;
            }
            return false;
          });

          return maxCount <= 0;
        }
        return false;
      });
    }

    res.json(data);
  } catch (e) {
    console.error(e);
    res.json({});
  }
}

// endregion

// region 内部接口
export async function queryRegisterItem(req, res) {
  try {
    const data = await itemMapper.insertItem(req.body);
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
}

async function checkValidItems(enhancements) {
  if (enhancements?.length) {
    return Promise.allSettled(
      enhancements.map((item) =>
        getItemPreviewById({ params: { id: item } }, {
          json: function() {
          },
        }),
      ),
    );
  }
}

const limiter = new Bottleneck({
  minTime: 2000, // 拉大基础间隔
  maxConcurrent: 2, // 限制同时请求数
});

export async function queryUpdateArchonBisOverview(req, res) {
  try {
    const flatSpecs = req.body.forceUpdate
      ? await bisMapper.getAllBisDateInfo()
      : await bisMapper.getOutdatedBIS();
    let doneCount = 0;
    let totalCount = flatSpecs.length;

    let archonHash = req.body.hash;
    if (req.body.byApi && !archonHash) {
      archonHash = await getArchonHash(
        flatSpecs[0].classSpec,
        flatSpecs[0].roleClass,
      );
      if (!archonHash) {
        throw new Error('ArchonHash not found');
      }
    }

    let collectFn = req.body.byApi
      ? (classSpec, roleClass) => collectArchonByApi(archonHash, classSpec, roleClass)
      : (classSpec, roleClass) => collectBisOverview(classSpec, roleClass, req.body.useCache);

    const results = await Promise.allSettled(
      flatSpecs.map((item) =>
        limiter.schedule(async () => {
          console.log(`获取${item.classSpec} ${item.roleClass}...`);
          const data = await collectFn(
            item.classSpec,
            item.roleClass,
          );
          doneCount++;
          console.log(
            `更新BIS进度: ${doneCount}/${totalCount}, ${item.classSpec} ${item.roleClass}`,
          );
          const checkResults = await checkValidItems(
            data.popularityItems.reduce((pre, cur) => {
              cur.enhancements.forEach((enhancement) => {
                if (enhancement && !pre.includes(enhancement)) {
                  pre.push(enhancement);
                }
              });

              if (cur.id && !pre.includes(cur.id)) {
                pre.push(cur.id);
              }

              return pre;
            }, []),
          );
          await checkValidItems(data.popularTrinkets.map((item) => item.id));
          return bisMapper.updateOverviewBis(
            item.roleClass,
            item.classSpec,
            data,
          );
        }),
      ),
    );
    const errors = results.filter((item) => item.status !== 'fulfilled');
    if (errors.length) {
      res.json({ message: '更新 ARCHON OVERVIEW 失败。' });
    } else {
      res.json({ message: '更新 ARCHON OVERVIEW 成功。' });
    }
  } catch (error) {
    res.status(500).json({ error: error?.message });
  }
}

export async function queryUpdateMaxrollBisOverview(req, res) {
  try {
    const flatSpecs = await bisMapper.getMaxrollBis();
    const results = await Promise.allSettled(
      flatSpecs.map((item) =>
        limiter.schedule(async () => {
          const data = await collectMaxrollBis(
            item.class_spec,
            item.role_class,
            req.body.useCache,
            req.body.ignoreLastUpdate
              ? ''
              : JSON.parse(item.maxroll_bis)?.updatedAt,
          );

          const output = {
            roleClass: item.role_class,
            classSpec: item.class_spec,
          };

          if (data) {
            if (data.items?.length) {
              const updatedResult = await bisMapper.updateBisByClassAndSpec({
                roleClass: item.role_class,
                classSpec: item.class_spec,
                maxrollBis: data,
              });
              output.updateStatus = updatedResult.changes;
              output.message = `获取 MAXROLL BIS 成功：${item.class_spec} ${item.role_class}`;
            } else {
              output.updateStatus = -1;
              output.message = `获取 MAXROLL BIS 失败：${item.class_spec} ${item.role_class}`;
            }
          } else {
            output.updateStatus = 0;
            output.message = `当前 MAXROLL BIS 已最新：${item.class_spec} ${item.role_class}`;
          }

          console.log(output.message);
          return {
            roleClass: item.role_class,
            classSpec: item.class_spec,
            ...output,
          };
        }),
      ),
    );
    const errors = results.filter((item) => item.status !== 'fulfilled');
    if (errors.length) {
      const info = errors
        .map((item) => `${item.reason.classSpec} ${item.reason.roleClass}`)
        .join(',');
      res.json({ message: `更新 MAXROLL BIS 失败: ${info}` });
    } else {
      const info = results
        .filter(
          (item) => item.status === 'fulfilled' && item.value.updateStatus === 1,
        )
        .map((item) => `${item.value.classSpec} ${item.value.roleClass}`)
        .join(',');
      if (info) {
        res.json({ message: `更新 MAXROLL BIS 成功：${info}` });
      } else {
        res.json({ message: `MAXROLL BIS 已经是最新数据` });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error?.message });
  }
}

//#endregion
