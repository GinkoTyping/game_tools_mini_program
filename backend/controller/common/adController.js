import { getCommonDB } from '../../database/utils/index.js';
import { useAdMapper } from '../../database/common/mapper/adMapper.js';

const db = await getCommonDB();
const adMapper = useAdMapper(db);

export async function queryUpdateAdCount(req, res) {
  try {
    const date = new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());

    const data = await adMapper.getAdCount(date);

    if (data) {
      await adMapper.updateAdCount(date, data.count + 1);
    } else {
      await adMapper.insertAd(date, 1);
    }

    res.json({ message: '投喂成功' });
  } catch (error) {
    console.log(`后端投喂计数异常: ${error}`);
    res.status(401).json({ error: `后端投喂计数异常。` });
  }
}

export async function queryAdCount(req, res) {
  try {
    const date = new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());

    const data = await adMapper.getAdCount(date);
    if (data) {
      res.json(data);
    } else {
      const defaultCount = Math.floor(Math.random() * 8) + 2;
      await adMapper.insertAd(date, defaultCount);
      res.json({
        date,
        count: defaultCount,
      });
    }
  } catch (error) {
    console.log(`后端服务异常: ${error}`);
    res.status(401).json({ error: `后端服务异常。` });
  }
}
