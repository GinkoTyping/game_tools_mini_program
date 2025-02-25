import { getDB } from '../../database/utils/index.js';
import { useDungeonTipMapper } from '../../database/wow/mapper/dungeonTipMapper.js';

const db = await getDB();
const dungeonTipMapper = useDungeonTipMapper(db);

export async function queryDungeonTipByCondition(req, res) {
  const { roleClass, classSpec, dungeonId } = req.body;

  const data = await dungeonTipMapper.getDungeonTipByCondition(
    roleClass,
    classSpec,
    dungeonId
  );
  if (data) {
    res.json({
      ...data,
      tips: data.tips_en,
    });
  } else {
    res.statusCode = 404;
    res.json({ message: '抱歉，暂无攻略，尽快更新中。' });
  }
}
