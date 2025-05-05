import axios from 'axios';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { getDB, getDailyDB } from '../../database/utils/index.js';
import { useClassSpecMapper } from '../../database/wow/mapper/classSpecMapper.js';
import { useSpecStatMapper } from '../../database/wow/mapper/daliy/specStatMapper.js';
import spriteMap from '../../assets/wow/sprites/sprite-map.js';
import { getWeekCount } from '../../util/wow.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let cacheData;
let cacheDate;
let cachedClassifiedData = {};
const db = await getDB();
const classSpecMapper = useClassSpecMapper(db);

const dailyDB = await getDailyDB();
const specStatMapper = useSpecStatMapper(dailyDB);

function getDate(dateString) {
  let date;
  if (dateString) {
    date = new Date(dateString);
  } else {
    date = new Date();
  }

  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .format(date)
    .replaceAll('/', '-');
}

async function mapDataItem(dataItem) {
  const specItem = await classSpecMapper.getSpecById(dataItem.spec_id);
  const classItem = await classSpecMapper.getClassById(dataItem.class_id);
  return {
    ...dataItem,
    class_name_zh: classItem.name_zh,
    class_name_en: classItem.name_en,
    name_zh: specItem.name_zh,
    name_en: specItem.name_en,
  };
}

async function mapPopularityData(data) {
  const results = await Promise.allSettled(
    data.map((item) => mapDataItem(item))
  );
  const total = results.reduce((pre, cur) => {
    pre += cur.value.quantity;
    return pre;
  }, 0);
  return results
    .map((item) => ({
      ...item.value,
      percent: Number((item.value.quantity / total).toFixed(4)),
    }))
    .sort((a, b) => b.quantity - a.quantity);
}

export async function queryPolularityByCondition(req, res) {
  const currentDate = getDate();
  const weekCountMax = getWeekCount();
  const { minMythicLevel = 2, maxMythicLevel = 99 } = req.body;

  const key = `${minMythicLevel}-${maxMythicLevel}`;

  const dbData = await specStatMapper.getSpecPopularity({
    date: currentDate,
    level_range: key,
  });

  if (dbData?.data) {
    res.json({
      ...JSON.parse(dbData.data),
      sprite: spriteMap,
    });
  } else {
    try {
      const response = await axios.get(
        `https://raider.io/api/statistics/get-data?season=season-tww-2&type=spec-popularity&minMythicLevel=${minMythicLevel}&maxMythicLevel=${maxMythicLevel}&seasonWeekStart=${weekCountMax}&seasonWeekEnd=${weekCountMax}&href=%2Fstats%2Fmythic-plus-spec-popularity%3Fseason%3Dseason-tww-2%26groupBy%3Dpopularity&version=3&timedOnly=false&uniqueCharacters=false&groupBy=popularity`,
        {
          family: 4,
          timeout: 15000,
        }
      );

      if (response?.data?.data) {
        const newDate = getDate(response.data.aggregated_at);
        const mapData = await mapPopularityData(response.data.data);
        const output = {
          aggregated_at: currentDate,
          data: mapData,
        };
        await specStatMapper.insertSpecPopularity({
          date: currentDate,
          level_range: key,
          data: JSON.stringify(output),
        });

        res.json({
          ...output,
          sprite: spriteMap,
        });
      } else {
        res.json({
          aggregated_at: currentDate,
          data: [],
          sprite: spriteMap,
        });
      }
    } catch (error) {
      res.status(500).json({
        error: 'Failed to fetch data from Raider.IO API',
      });
    }
  }
}

export async function queryPolularity(req, res) {
  const currentDate = getDate();

  if (cacheDate === currentDate && cacheData) {
    res.json(cacheData);
  } else {
    const staticFilePath = path.resolve(
      __dirname,
      `../../database/wow/data/popularity/${currentDate}.json`
    );
    const isFileExist = fs.existsSync(staticFilePath);
    if (isFileExist) {
      cacheData = JSON.parse(fs.readFileSync(staticFilePath));
      res.json(cacheData);
    } else {
      const response = await axios.get(
        'https://raider.io/api/statistics/get-data?season=season-tww-2&type=spec-popularity&minMythicLevel=2&maxMythicLevel=99&seasonWeekStart=1&seasonWeekEnd=1&href=%2Fstats%2Fmythic-plus-spec-popularity%3Fseason%3Dseason-tww-2%26groupBy%3Dpopularity&version=3&timedOnly=false&uniqueCharacters=false&groupBy=popularity'
      );
      if (response?.data) {
        cacheDate = getDate(response.data.aggregated_at);
        cacheData = await mapPopularityData(response.data.data);
        fs.writeFileSync(
          path.resolve(
            __dirname,
            `../../database/wow/data/popularity/${cacheDate}.json`
          ),
          JSON.stringify(cacheData, null, 2)
        );
        res.json(cacheData);
      } else {
        res.json([]);
      }
    }
  }
}
