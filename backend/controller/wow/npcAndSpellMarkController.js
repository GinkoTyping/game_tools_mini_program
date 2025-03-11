import { getDynamicDB } from '../../database/utils/index.js';
import { useUserMarkMapper } from '../../database/wow/mapper/userMarkMapper.js';
import { useNpcAndSpellMarkMapper } from '../../database/wow/mapper/npcAndSpellMarkMapper.js';

const dynamicDB = await getDynamicDB();
const userMarkMapper = useUserMarkMapper(dynamicDB);
const npcAndSpellMarkMapper = useNpcAndSpellMarkMapper(dynamicDB);

export async function queryUpdateMarkStatus(req, res) {
  try {
    const { isNpc, isMark, userId, markId } = req.body;
    const userResult = await userMarkMapper.updateUserMark(
      isNpc,
      isMark,
      userId,
      markId
    );
    const result = await npcAndSpellMarkMapper.updateNpcOrSpellMark(
      isNpc,
      isMark,
      userId,
      markId
    );
    if (userResult.changes === 1 && result.changes === 1) {
      res.json({ message: '更新成功' });
    } else {
      res.status(401).json({ error: '更新失败，数据操作异常。' });
    }
  } catch (error) {
    res.status(401).json({ error: `更新失败：${error}` });
  }
}

export async function queryUserMarksById(req, res) {
  try {
    const data = await userMarkMapper.getUserMarkById(req.params.id);
    res.json(data);
  } catch (error) {
    res.status(401).json(error);
  }
}
