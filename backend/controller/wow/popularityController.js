import axios from 'axios';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { getDB } from '../../database/utils/index.js';
import { useClassSpecMapper } from '../../database/wow/mapper/classSpecMapper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let cacheData;
let cacheDate;
const db = await getDB();
const classSpecMapper = useClassSpecMapper(db);

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
  return {
    ...dataItem,
    name_zh: specItem.name_zh,
    name_en: specItem.name_en,
  };
}

async function mapPopularityData(data) {
  const results = await Promise.allSettled(
    data.map((item) => mapDataItem(item))
  );
  return results
    .map((item) => item.value)
    .sort((a, b) => b.quantity - a.quantity);
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
