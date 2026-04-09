import { getDB, getCommonDB } from '../../database/utils/index.js';
import { useInfoMapper } from '../../database/info/mapper/infoMapper.js';
import { usePatchMapper } from '../../database/common/mapper/patchMapper.js';

const db = await getDB();
const infoMapper = useInfoMapper(db);

const commonDB = await getCommonDB();
const patchMapper = usePatchMapper(commonDB);

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
  try {
    const { date, text } = await patchMapper.getLatestPatch();

    if (Math.abs(new Date(date).getTime() - Date.now()) <= 7 * 24 * 60 * 1000) {
      res.json(`${text.replaceAll('\n', ' ')}(${date})`);
    }

    res.json('');
  } catch {

    res.json('');
  }
}

export async function queryScrollInfoV2(req, res) {
  const { date, text } = await patchMapper.getLatestPatch();
  res.json({
    message: text.replaceAll('\n', ' '),
    date,
  });
}
