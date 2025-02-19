import { getDB } from '../../database/utils/index.js';
import { useHomeViewMapper } from '../../database/wow/mapper/homeViewMapper.js';
import { useTierListMapper } from '../../database/wow/mapper/tierListMapper.js';
import { getSortedSpecsTrend } from './bisController.js';

const db = await getDB();
const homeViewMapper = useHomeViewMapper(db);
const tierListMapper = useTierListMapper(db);

export async function queryHomeView(req, res) {
  const time = new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  const existed = await homeViewMapper.getHomeView(time);
  if (existed) {
    res.json({
      time: existed.time,
      carousels: JSON.parse(existed.carousels),
      hotTopics: JSON.parse(existed.hot_topics),
      tierLists: JSON.parse(existed.tier_lists),
    });

    // 如果没有当日数据，先查询
  } else {
    const sortedData = await getSortedSpecsTrend();
    const carousels = sortedData.slice(0, 3);
    const hotTopics = sortedData.slice(3, 7);

    const tierLists = await tierListMapper.getAllTierList();
    const output = { time, carousels, hotTopics, tierLists };

    await homeViewMapper.insertHomeView({
      time,
      carousels: JSON.stringify(carousels),
      hotTopics: JSON.stringify(hotTopics),
      tierLists: JSON.stringify(tierLists),
    });
    res.json(output);
  }
}
