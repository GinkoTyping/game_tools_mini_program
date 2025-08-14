import { getDailyDB } from '../../database/utils/index.js';
import axios from 'axios';
import { useMythicScoreMapper } from '../../database/wow/mapper/daliy/mythicScoreMapper.js';
import { formatDate } from '../../util/time.js';

const db = await getDailyDB();
const mythicScoreMapper = useMythicScoreMapper(db);

async function queryMythicRankByRaidIO(pageNo) {
  const existed = await mythicScoreMapper.getDailyMythicScore({
    page: pageNo,
    time: formatDate(),
  });
  if (existed) {
    return existed.data;
  }

  const response = await axios.get(
    `https://raider.io/api/mythic-plus/rankings/characters?region=cn&season=season-tww-3&class=all&role=all&page=${pageNo}`,
    {
      family: 4,
      timeout: 15000,
    },
  );
  const data = response?.data?.rankings;
  const output = {
    data: data?.rankedCharacters,
    page: data?.ui?.page,
    pageSize: data?.ui?.pageSize,
    lastPage: data?.ui?.lastPage,
  };
  mythicScoreMapper.addDailyMythicScore({
    page: pageNo,
    time: formatDate(),
    data: output,
  });
  return output;
}

export async function queryDailyMythicRank(req, res) {
  const { pageNo = 0 } = req.body;

  try {
    const output = await queryMythicRankByRaidIO(pageNo);
    res.json(output);
  } catch (e) {
    console.log(e);
    res.json({
      data: [],
      page: pageNo,
      lastPage: -1,
      pageSize: 40,
    });
  }
}

const LEVEL_1_PERCENTAGE = 0.001;
const LEVEL_2_PERCENTAGE = 0.01;
const LEVEL_3_PERCENTAGE = 0.05;

function getPageNoByRankLevel(params) {
  const { pageSize, lastPage, percentage } = params;
  const rank = Math.floor((lastPage + 1) * pageSize * percentage);
  return {
    rank,
    pageNo: Math.ceil(rank / pageSize) - 1,
  };
}

export async function queryDailyMythicRankRatio(req, res) {
  try {
    const { pageSize, lastPage } = await queryMythicRankByRaidIO(0);

    const results = await Promise.allSettled([
      LEVEL_1_PERCENTAGE,
      LEVEL_2_PERCENTAGE,
      LEVEL_3_PERCENTAGE,
    ].map(async percentage => {
      const { pageNo, rank } = getPageNoByRankLevel({
        pageSize,
        lastPage,
        percentage,
      });
      const { data } = await queryMythicRankByRaidIO(pageNo);
      const matched = data.find(item => item.rank === rank);
      return {
        score: matched?.score,
        rank,
        percentage,
        character: matched?.character,
      };
    }));

    const output = results.map(item => item.value);
    res.json(output);
  } catch {
    res.json([]);
  }
}