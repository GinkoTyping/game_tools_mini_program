import { getDailyDB } from '../../database/utils/index.js';
import axios from 'axios';
import { useMythicScoreMapper } from '../../database/wow/mapper/daliy/mythicScoreMapper.js';
import { formatDate } from '../../util/time.js';

const db = await getDailyDB();
const mythicScoreMapper = useMythicScoreMapper(db);

export async function queryDailyMythicRank(req, res) {
  const { pageNo = 0 } = req.body;

  try {
    const existed = await mythicScoreMapper.getDailyMythicScore({
      page: pageNo,
      time: formatDate(),
    });
    if (existed) {
      res.json(existed.data);
    } else {
      const response = await axios.get(
        `https://raider.io/api/mythic-plus/rankings/characters?region=cn&season=season-tww-2&class=all&role=all&page=${pageNo}`,
        {
          family: 4,
          timeout: 15000,
        },
      );
      const data = response?.data?.rankings;
      const output = {
        data: data?.rankedCharacters,
        page: data?.ui?.page,
        lastPage: data?.ui?.lastPage,
      };
      await mythicScoreMapper.addDailyMythicScore({
        page: pageNo,
        time: formatDate(),
        data: output,
      });
      res.json(output);
    }
  } catch {
    res.json({
      data: [],
      page: pageNo,
      lastPage: -1,
    });
  }
}