import { getDB } from '../../database/utils/index.js';
import { useInfoMapper } from '../../database/info/mapper/infoMapper.js';

const db = await getDB();
const infoMapper = useInfoMapper(db);

export async function queryAccessCount(req, res) {
  const date = new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  const data = await infoMapper.getAccessCountByDate(date);
  if (data) {
    const count = data.visit_count + 1;
    res.json(count);
    infoMapper.updateAccessCountByDate(date, count);
  } else {
    res.json(1);
    infoMapper.insertAccessCount(date, 1);
  }
}

export async function queryScrollInfo(req, res) {
  res.json('已完善11.1版本各专精的大秘境攻略。(2.28)');
}
