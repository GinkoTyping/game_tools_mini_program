import axios from 'axios';

import path from 'path';
import { fileURLToPath } from 'url';

import { useCheerioContext } from '../../../../util/run-browser.js';
import { getCheerioByPuppeteer } from '../../../../util/run-puppeteer.js';
import { calculateStatRatio } from '../../../../util/wow.js';
import { getDB } from '../../../utils/index.js';
import { useBasicStatsMapper } from '../../mapper/static/basicStatsMapper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getStaticFilePath(classSpec, roleClass) {
  return path.resolve(__dirname, `./cache/${classSpec}-${roleClass}.html`);
}

function getUrl(classSpec, roleClass) {
  return `https://www.archon.gg/wow/builds/${classSpec}/${roleClass}/mythic-plus/gear-and-tier-set/high-keys/all-dungeons/this-week`;
}

function getOverviewUrl(classSpec, roleClass) {
  return `https://www.archon.gg/wow/builds/${classSpec}/${roleClass}/mythic-plus/overview/high-keys/all-dungeons/this-week#stats`;
}

function getOverviewStaticFilePath(classSpec, roleClass) {
  return path.resolve(
    __dirname,
    `./cache/${classSpec}-${roleClass}-overview.html`,
  );
}

function getIdByUrl(url) {
  return Number(url?.split('item=')?.pop());
}

function mapStatLabel(val) {
  const lowercase = val.toLowerCase();
  switch (lowercase) {
    case 'haste':
      return '急速';
    case 'mastery':
      return '精通';
    case 'crit':
      return '暴击';
    case 'vers':
      return '全能';
    default:
      break;
  }
}

// region puppeteer 查询数据
function handleStatsAffectedBySpecTalent(classSpec, roleClass, statsKey, statsValue) {
  let realValue;
  let realRatio;
  if (classSpec === 'frost'
    && roleClass === 'mage'
    && statsKey.toLowerCase() === 'haste') {
    // 天赋点（62174）寒冬祝福：急速提高8%，所有渠道获得的急速额外提高10%
    realValue = Math.round(statsValue * 1.1);
    realRatio = calculateStatRatio(statsKey, realValue) + 8;
  }
  if (realValue && realRatio) {
    return {
      realValue,
      realRatio,
      id: 417489,
      name: '寒冬祝福',
      image: 'spell_frost_wisp.jpg',
      description: '你的急速提高8%。\\r\\n\\r\\n你从所有渠道获得的急速属性额外提高10%。',
    };
  }
  return {};
}

async function getStatsOverview(classSpec, roleClass, useCache) {
  const $ = await useCheerioContext(
    getOverviewStaticFilePath(
      classSpec,
      roleClass,
    ),
    getOverviewUrl(classSpec, roleClass),
    useCache,
    20000,
  );
  const priority = $(
    '#stats .builds-stat-priority-section>.builds-stat-priority-section__container .builds-stat-priority-section__container__inner')
    .map((idx, ele) => {
      const key = $(ele)
        .find('.builds-stat-priority-section__container__stat-box')
        .text();
      const value = $(ele)
        .find(
          '.builds-stat-priority-section__container__stat-box__value-wrapper')
        .text();
      return {
        key,
        label: mapStatLabel(key),
        value,
        ratio: calculateStatRatio(key, value),
        ...handleStatsAffectedBySpecTalent(classSpec, roleClass, key, value),
      };
    })
    .get();
  // 不需要展示主属性
  priority.shift();
  const relations = [];
  priority.forEach((item, index) => {
    if (index > 0) {
      relations.push(Math.abs(priority[index].value - priority[index - 1].value) > Math.max(
        priority[index].value,
        priority[index - 1].value,
      ) / 10 ? 1 : 10);
    }
  });
  return {
    priority, relations,
  };
}

async function getBisOverview(classSpec, roleClass, useCache) {
  const $ = await getCheerioByPuppeteer({
    staticFilePath: getStaticFilePath(classSpec, roleClass),
    urlPath: getUrl(classSpec, roleClass),
    useCache,
    waitForSelector: '#gear-tables .builds-gear-tables-section__group a a[data-disable-wowhead-tooltip=true]',
  });

  const overview = [];
  const popularTrinkets = [];

  function buildItemByEle(ele) {
    return {
      id: getIdByUrl($(ele).find('a').first().attr('href')),
      name: $(ele).find('td').first().find('span').last().text().trim(),
      popularity: $(ele).find('td').last().find('span').first().text().trim(),
    };
  }

  $('#gear-tables .builds-gear-tables-section__group')
    .children()
    .each((idx, slotWrap) => {
      const slotLabel = $(slotWrap)
        .find('table thead th')
        .first()
        ?.text()
        ?.trim();
      let collectCount = 0;
      let RING_COLLECT_MAX = 2;
      let TRINKET_COLLECT_MAX = 5;
      $(slotWrap)
        .find('tbody tr')
        .each((trIdx, trEle) => {
          let isPush = false;
          if (slotLabel === 'Trinket' && collectCount < TRINKET_COLLECT_MAX) {
            isPush = true;
          } else {
            if ($(trEle).find('a[data-disable-wowhead-tooltip]')?.length) {
              if (slotLabel === 'Off-Hand') {
                const id = buildItemByEle(trEle).id;
                const hasSameMainHand = overview.find(item => item.id === id);
                isPush = !hasSameMainHand;
              } else {
                isPush = true;
              }
            }
          }

          if (isPush) {
            const item = buildItemByEle(trEle);
            if (slotLabel === 'Trinket') {
              popularTrinkets.push(item);
            } else {
              overview.push(item);
            }

            collectCount++;
            return (// 戒指部位 收录了2个以上的戒指，只收集前2
              (slotLabel === 'Rings' && collectCount < RING_COLLECT_MAX) || // 饰品部位 需要展示不同流行度的饰品，统计5个
              (slotLabel === 'Trinket' && collectCount < TRINKET_COLLECT_MAX));
          }

          return true;
        });

      // 如果没有找到 BIS 标签的装备，默认取第一个
      if (collectCount === 0) {
        overview.push(buildItemByEle($(slotWrap).find('tbody tr').first()));
      }
    });

  const popularityItems = $(
    '#gear-overview .builds-best-in-slot-gear-section__gear')
    .children()
    .map((idx, ele) => {
      const item = $(ele).find('.gear-icon__item-name a').last();
      const name = item.text().trim();
      const id = Number(item.attr('href').split('item=').pop());

      const enhancementEle = $(ele)
        .find('.gear-icon__item-meta')
        .children()
        .first();

      const enhancements = enhancementEle
        .children()
        .map((gemIdx, gemEle) => {
          return getIdByUrl($(gemEle).attr('href'));
        })
        .get();
      const stats = $(ele)
        .find('.gear-icon__item-meta__stats')
        .children('span')
        .map((statIdx, statEle) => {
          return mapStatLabel($(statEle).text());
        })
        .get();
      return {
        id, name, enhancements, stats,
      };
    })
    .get();

  return {
    overview, popularTrinkets, popularityItems,
  };
}

export async function collectBisOverview(classSpec, roleClass, useCache) {
  const stats = await getStatsOverview(classSpec, roleClass, useCache);
  const {
    overview, popularityItems, popularTrinkets,
  } = await getBisOverview(classSpec, roleClass, useCache);

  if (!overview.length) {
    console.log(`${classSpec}${roleClass}: 获取BIS数据失败，将使用热门度排行替代`);
  }

  return {
    classSpec,
    roleClass,

    // TODO 奶龙和奶德 没有BIS数据, 所以用热度数据代替
    overview: overview.length ? overview : popularityItems,
    popularTrinkets,
    popularityItems,
    stats,
  };
}

// endregion

// region API 查询数据
// 获取hash
export async function getArchonHash(classSpec, roleClass) {
  try {
    let pathHash = '';
    await getCheerioByPuppeteer({
      staticFilePath: getStaticFilePath(classSpec, roleClass),
      urlPath: getUrl(classSpec, roleClass),
      useCache: false,
      waitForSelector: null,
      disableSaveCache: true,
      async onResponse(response) {
        const url = new URL(response.url());
        const pathname = url.pathname;
        if (!pathHash && pathname.includes('/this-week.json')) {
          const match = pathname.match(/^\/_next\/data\/([a-zA-Z0-9_]+)\//);
          pathHash = match?.[1];
        }
      },
    });

    return pathHash;
  } catch (e) {
    throw new Error(`获取hash失败`);
  }
}

async function queryArchon(pathHash, category, classSpec, roleClass, zoneType = 'mythic-plus') {
  try {
    const url = zoneType === 'mythic-plus'
      ? `https://www.archon.gg/_next/data/${pathHash}/wow/builds/${classSpec}/${roleClass}/mythic-plus/${category}/10/all-dungeons/this-week.json?gameSlug=wow&specSlug=${classSpec}&classSlug=${roleClass}&zoneTypeSlug=mythic-plus&categorySlug=${category}&difficultySlug=10&encounterSlug=all-dungeons&affixesSlug=this-week`
      : `https://www.archon.gg/_next/data/${pathHash}/wow/builds/${classSpec}/${roleClass}/raid/${category}/mythic/all-bosses.json?gameSlug=wow&specSlug=${classSpec}&classSlug=${roleClass}&zoneTypeSlug=raid&categorySlug=${category}&difficultySlug=mythic&encounterSlug=all-bosses`;
    const res = await axios.get(url);
    return res?.data?.pageProps?.page;
  } catch (e) {
    throw new Error(`获取archon数据失败: ${category}, ${classSpec} ${roleClass}`);
  }
}

// overview
const database = await getDB();
const basicStatsMapper = useBasicStatsMapper(database);

async function calculateStats(classSpec, roleClass, statsData) {
  const data = await basicStatsMapper.getStats(classSpec, roleClass);
  const { crit, haste, mastery, vers } = data ?? {};

  async function mapStats(statsItem) {
    let basic;
    const statsKey = statsItem.name.toLowerCase();
    const statsValue = statsItem.value;
    switch (statsKey) {
      case 'crit':
        basic = crit;
        break;
      case 'haste':
        basic = haste;
        break;
      case 'mastery':
        basic = mastery;
        break;
      case 'vers':
        basic = vers;
        break;
    }
    const ratio = calculateStatRatio(statsKey, statsValue);
    const output = {
      key: statsKey,
      label: mapStatLabel(statsKey),
      value: statsValue,
      ratio,
      data: statsItem.data,
    };
    if (basic) {
      const basicValue = Number(basic.split('|')[0]);
      const ids = basic.split('|')[1]?.split(',').map(item => Number(item));
      return {
        ...output,
        basicValue,
        realRatio: basicValue + ratio,
        ids,
      };
    }
    return output;
  }

  const results = await Promise.allSettled(statsData.map(item => mapStats(item)));
  return results.map(result => result.value);
}

async function queryOverview(hash, classSpec, roleClass, zoneType = 'mythic-plus') {
  const data = await queryArchon(hash, 'overview', classSpec, roleClass, zoneType);
  const statsSection = data.sections.find(section => section.navigationId === 'stats');

  // 不需要展示主属性
  statsSection?.props?.stats?.shift();
  const priority = await calculateStats(classSpec, roleClass, statsSection?.props?.stats);

  const relations = [];
  priority.forEach((item, index) => {
    if (index > 0) {
      relations.push(Math.abs(priority[index].value - priority[index - 1].value) > Math.max(
        priority[index].value,
        priority[index - 1].value,
      ) / 10 ? 1 : 10);
    }
  });

  return {
    priority, relations, sampleCount: data?.totalParses,
  };
}

// gear-and-tier-set
function matchItemSlot(input) {
  return input.match(/^.*?>([\s\S]*?)</)?.[1].trim();
}

function matchItemName(input) {
  let normalName = input.match(/^.*?span>([\s\S]*?)</)?.[1]?.trim();
  let name = normalName
    ? normalName
    : input.match(/^.*?>([\s\S]*?)<\/(ItemIcon|GearIcon)/)?.[1]?.trim();
  return name.replace('&nbsp;', '');
}

function matchItemId(input) {
  return input.match(/^.*?id={([\s\S]*?)}/)?.[1].trim();
}

function matchEnhancementIds(input) {
  return input.match(/"id":(\d+)/g)?.map(item => Number(item.replace('"id":', ''))) ?? [];
}

function isBisItem(input) {
  return input.includes('<BadgeLabel>BiS</BadgeLabel>');
}

function getFormatItem(item) {
  return {
    id: matchItemId(item.item),
    name: matchItemName(item.item),
    popularity: matchItemSlot(item.popularity),
    maxKey: matchItemSlot(item.maxKey),
    dps: matchItemSlot(item.dps),
  };
}

async function queryGears(hash, classSpec, roleClass) {
  const data = await queryArchon(hash, 'gear-and-tier-set', classSpec, roleClass);
  const gearsTable = data.sections.find(section => section.navigationId === 'gear-tables');
  let bisGears = [];
  let trinkets = [];
  gearsTable?.props?.tables.forEach(kind => {
    let collectCount = 0;
    let RING_COLLECT_MAX = 2;
    let TRINKET_COLLECT_MAX = 5;
    const slotLabel = matchItemSlot(kind.columns.item.header);
    kind.data.some(item => {
      let isPush = false;
      if (slotLabel === 'Trinket' && collectCount < TRINKET_COLLECT_MAX) {
        isPush = true;
      } else {
        if (isBisItem(item.item)) {
          if (slotLabel === 'Off-Hand') {
            const id = matchItemId(item.item);
            const hasSameMainHand = bisGears.find(item => item.id === id);
            isPush = !hasSameMainHand;
          } else {
            isPush = true;
          }
        }
      }

      if (isPush) {
        const formatItem = getFormatItem(item);
        if (slotLabel === 'Trinket') {
          trinkets.push(formatItem);
        } else {
          bisGears.push(formatItem);
        }

        collectCount++;
        if ([
          'Rings',
          'Trinket',
        ].includes(slotLabel)) {
          return (
              // 戒指部位 收录了2个以上的戒指，只收集前2
              slotLabel === 'Rings' && collectCount === RING_COLLECT_MAX)

            // 饰品部位 需要展示不同流行度的饰品，统计5个
            || (slotLabel === 'Trinket' && collectCount === TRINKET_COLLECT_MAX);
        }
        return true;
      }

      return false;
    });

    // 如果没有找到 BIS 标签的装备，默认取第一个
    if (collectCount === 0) {
      console.log('未匹配BIS装备，使用热门度第一代替', `${classSpec} ${roleClass}`, slotLabel);
      slotLabel === 'Trinket'
        ? trinkets.push(getFormatItem(kind.data?.[0]))
        : bisGears.push(getFormatItem(kind.data?.[0]));
    }
  });

  const gearOverview = data.sections.find(section => section.navigationId === 'gear-overview');
  const popularGears = [
    ...gearOverview?.props?.gear,
    ...gearOverview?.props?.weapons,
    ...gearOverview?.props?.trinkets,
  ].map(gearItem => {
    return {
      id: matchItemId(gearItem.icon),
      name: matchItemName(gearItem.icon),
      enhancements: matchEnhancementIds(gearItem.icon),
    };
  });
  return { bisGears, trinkets, popularGears };
}

// talents

function getHeroTalentStats(data) {
  const stats = data.sections.find(section => section.navigationId === 'hero-talents')?.props?.subTreeStats;
  return stats.map(item => ({
    ...item,
    metricValue: item.metricValue.match(/^.*?>([\s\S]*?)</)?.[1]?.trim(),
  }));
}

function mapDefinitionIdToNodeId([id, rank], nodesMap) {
  let spellId;
  const nodeId = nodesMap.find(node => {
    const found = node.abilities.find(ability => ability.id === id);
    if (found && node.abilities.length > 1) {
      spellId = node.type === 'subtree' ? found.heroTreeId : found.spellId;
    }
    return found;
  })?.nodeId;
  const output = [nodeId];

  output.push(rank ?? '');
  if (spellId) {
    output.push(spellId);
  }

  return output;
}

function getTalentTreeBuilds(data, nodesMap) {
  return data.sections.find(section => section.navigationId === 'talents')?.props.talentTreeBuildSets?.[0]?.alternatives.map(
    tree => {
      return {
        isDefaultSelection: tree.isDefaultSelection,
        keystoneLevel: tree.keystoneLevel,
        popularity: tree.popularity,
        talentTree: {
          build: {
            heroSpecId: tree.talentTree.dehydratedBuild.heroSpecId,
            selectedNodes: tree.talentTree.dehydratedBuild.selectedNodes.map(([id, rank]) => mapDefinitionIdToNodeId([
              id,
              rank,
            ], nodesMap)),
          },
          exportCode: tree.talentTree.exportCodeParams.exportCode,
        },
      };
    });

}

function getTalentHeatMap(data, nodesMap) {
  const subtreeNode = nodesMap.find(node => node.type === 'subtree');
  return data.sections.find(section => section.navigationId === 'talents-heatmap')?.props.talentTree.dehydratedBuild.selectedNodes.map(
    ([id, rank]) => mapDefinitionIdToNodeId([
      id,
      rank,
    ], nodesMap));
}

async function queryTalents(hash, classSpec, roleClass) {
  const data = await queryArchon(hash, 'talents', classSpec, roleClass);
  const nodesMap = Object.values(data.talentTreeBlueprints)[0]?.changeSet?.allNodes;
  const heroTreeStats = getHeroTalentStats(data);
  const talentTreeBuilds = getTalentTreeBuilds(data, nodesMap);
  const talentHeatMap = getTalentHeatMap(data, nodesMap);

  // TODO: 检查 class tree 中包含 spec tree 、 talent tree 的 node ； spec tree 中包含 talent tree 的 node
  return {
    heroTreeStats,
    talentTreeBuilds,
    talentHeatMap,
  };
}

export async function collectArchonByApi(hash, classSpec, roleClass) {
  const stats = await queryOverview(hash, classSpec, roleClass, 'mythic-plus');
  const raidStats = await queryOverview(hash, classSpec, roleClass, 'raid');
  const { bisGears, trinkets, popularGears } = await queryGears(hash, classSpec, roleClass);
  const talents = await queryTalents(hash, classSpec, roleClass);
  return {
    classSpec,
    roleClass,

    stats,
    raidStats,

    overview: bisGears,
    popularTrinkets: trinkets,
    popularityItems: popularGears,

    talents,
  };
}

// endregion