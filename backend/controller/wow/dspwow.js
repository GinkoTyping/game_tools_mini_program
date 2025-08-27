import axios from 'axios';
import { useScheduleCheck } from '../../util/use-schedule-check.js';

export async function queryDpsWoWList(req, res) {
  const params = req?.body;
  try {
    const { data } = await axios.post('https://dps-api.wowgf.com/app/rank/dpsTopRank/topRank', req?.body);
    res.json(data);
  } catch (e) {
    console.error(e);
    res.json({
      code: 500,
      data: {
        list: [],
        pagination: {
          total: 0,
        },
      },
    });
  }
}

const queryDpsWowUserSimcRecordsSchedule = useScheduleCheck(0.1);
let dpsWowSimcRecordsBackup = [];

export async function queryDpsWowUserSimcRecords(req, res) {
  try {
    if (queryDpsWowUserSimcRecordsSchedule.isSchedule() || dpsWowSimcRecordsBackup.length === 0) {
      const { data } = await axios.get('https://dps-api.wowgf.com/open/simc/userSimcRecord/list?limit=20');
      queryDpsWowUserSimcRecordsSchedule.setLastUpdate();
      dpsWowSimcRecordsBackup = data;
      res.json(data);
    } else {
      res.json(dpsWowSimcRecordsBackup);
    }

  } catch {
    res.status(500).json({
      code: 500,
      data: [],
      message: '获取模拟日志数据失败',
    });
  }
}
