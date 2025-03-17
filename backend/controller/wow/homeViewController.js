import { getDB, getDailyDB, getDynamicDB } from '../../database/utils/index.js';
import { useSpecStatMapper } from '../../database/wow/mapper/daliy/specStatMapper.js';
import { useHomeViewMapper } from '../../database/wow/mapper/homeViewMapper.js';
import { useNpcAndSpellMarkMapper } from '../../database/wow/mapper/npcAndSpellMarkMapper.js';
import { useSpecBisCountMapper } from '../../database/wow/mapper/specBisCountMapper.js';
import { useTierListMapper } from '../../database/wow/mapper/tierListMapper.js';
import { getWeekCount } from '../../util/wow.js';

const db = await getDB();
const homeViewMapper = useHomeViewMapper(db);
const tierListMapper = useTierListMapper(db);
const dailyDB = await getDailyDB();
const specStatMapper = useSpecStatMapper(dailyDB);
const dynamicDB = await getDynamicDB();
const specBisCountMapper = useSpecBisCountMapper(dynamicDB);
const npcAndSpellMapper = useNpcAndSpellMarkMapper(dynamicDB);

const UPDATE_INTERVAL_HOUR = 1;
const UPDATE_INTERVAL = UPDATE_INTERVAL_HOUR * 3600 * 1000;
let lastUpdateAt = 0;
let mythicMarkCount = 0;

async function getCarouselsByDpsRank() {
  const dpsRankData = await specStatMapper.getSpecDpsRank({
    week_id: getWeekCount(),
  });
  let carousels;
  if (dpsRankData?.data && JSON.parse(dpsRankData.data).data) {
    carousels = JSON.parse(dpsRankData.data)
      .data.find((item) => item.type === 'dps')
      ?.rank.slice(0, 3)
      .map((item) => ({
        ...item,
        role_class: item.roleClass,
        class_spec: item.classSpec,
      }));
  }

  return carousels;
}
async function getMythicDungeonMarks() {
  const { npcMarks, spellMarks } =
    await npcAndSpellMapper.getAllNpcAndSpellMarks();
  function getCount(marks) {
    return marks.reduce((pre, cur) => {
      const count =
        cur.mark_list?.split(',').filter((item) => item).length ?? 0;
      pre += count;
      return pre;
    }, 0);
  }
  return getCount(npcMarks) + getCount(spellMarks);
}

export async function queryHomeView(req, res) {
  let basicOutput = {
    entries: [
      {
        label: '专精排行',
        value: 'rating',
        icon: 'auth-filled',
        page: '/pages/tier-list/index?versionId=11.1&activityType=MYTHIC&role=DPS',
        feature: false,
      },
      {
        label: '专精数据',
        value: 'rating',
        icon: 'fire-filled',
        page: '/pages/spec-popularity/index',
        feature: true,
      },
      {
        label: '专精攻略',
        value: 'rating',
        icon: 'map-filled',
        page: '/pages/spec-list/index',
        feature: false,
      },
      // {
      //   label: '做题家',
      //   value: 'rating',
      //   icon: 'wallet-filled',
      //   page: '/pages/question/index',
      //   feature: true,
      // },
      {
        label: '大秘境',
        value: 'rating',
        icon: 'pyq',
        page: '/pages/mythic-dungeon/list',
        feature: false,
      },
    ],
  };
  const time = new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  const isToUpdate = Date.now() - lastUpdateAt > UPDATE_INTERVAL;

  const existed = await homeViewMapper.getHomeView(time);

  if (existed && !isToUpdate) {
    res.json({
      ...basicOutput,
      time: new Date(lastUpdateAt),
      mythicMarkCount,
      carousels: JSON.parse(existed.carousels),
      hotTopics: JSON.parse(existed.hot_topics),
      tierLists: JSON.parse(existed.tier_lists),
    });

    // 如果没有当日数据，先查询
  } else {
    // 访问量高的专精BIS页面
    const sortedData = await specBisCountMapper.getAllSpecBisCount();
    const hotTopics = sortedData.slice(0, 4);

    // 输出排行靠前的DPS TODO: 如果DPS排行的数据没有更新，怎么办
    const carousels = (await getCarouselsByDpsRank()) ?? sortedData.slice(0, 4);

    const tierLists = await tierListMapper.getAllTierList();
    mythicMarkCount = await getMythicDungeonMarks();
    const output = {
      time: new Date(lastUpdateAt),
      mythicMarkCount,
      carousels,
      hotTopics,
      tierLists,
    };

    const params = {
      time,
      carousels: JSON.stringify(carousels),
      hotTopics: JSON.stringify(hotTopics),
      tierLists: JSON.stringify(tierLists),
    };
    if (existed) {
      await homeViewMapper.updateHomeView(params);
    } else {
      await homeViewMapper.insertHomeView(params);
    }
    lastUpdateAt = Date.now();
    res.json({
      ...basicOutput,
      ...output,
    });
  }
}
