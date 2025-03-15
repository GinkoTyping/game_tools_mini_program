import { getDB, getDailyDB, getDynamicDB } from '../../database/utils/index.js';
import { useSpecStatMapper } from '../../database/wow/mapper/daliy/specStatMapper.js';
import { useHomeViewMapper } from '../../database/wow/mapper/homeViewMapper.js';
import { useSpecBisCountMapper } from '../../database/wow/mapper/specBisCountMapper.js';
import { useTierListMapper } from '../../database/wow/mapper/tierListMapper.js';
import { getWeekCount } from '../../util/wow.js';
import { getSortedSpecsTrend } from './bisController.js';

const db = await getDB();
const homeViewMapper = useHomeViewMapper(db);
const tierListMapper = useTierListMapper(db);

const dailyDB = await getDailyDB();
const specStatMapper = useSpecStatMapper(dailyDB);

const dynamicDB = await getDynamicDB();
const specBisCountMapper = useSpecBisCountMapper(dynamicDB);

export async function queryHomeView(req, res) {
  const time = new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  const existed = await homeViewMapper.getHomeView(time);

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
      {
        label: '大秘境',
        value: 'rating',
        icon: 'pyq',
        page: '/pages/mythic-dungeon/list',
        feature: true,
      },
    ],
  };

  if (existed) {
    res.json({
      ...basicOutput,
      time: existed.time,
      carousels: JSON.parse(existed.carousels),
      hotTopics: JSON.parse(existed.hot_topics),
      tierLists: JSON.parse(existed.tier_lists),
    });

    // 如果没有当日数据，先查询
  } else {
    // 访问量高的专精BIS页面
    const sortedData = await specBisCountMapper.getAllSpecBisCount();
    const hotTopics = sortedData.slice(0, 4)

    // 输出排行靠前的DPS
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
    } else {
      // TODO: 如果当前周的DPS排名数据还没有更新 怎么办
      carousels = sortedData.slice(0, 4);
    }

    const tierLists = await tierListMapper.getAllTierList();
    const output = { time, carousels, hotTopics, tierLists };

    await homeViewMapper.insertHomeView({
      time,
      carousels: JSON.stringify(carousels),
      hotTopics: JSON.stringify(hotTopics),
      tierLists: JSON.stringify(tierLists),
    });
    res.json({
      ...basicOutput,
      ...output,
    });
  }
}
