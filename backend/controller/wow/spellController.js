import { getDB } from '../../database/utils/index.js';
import { useSpellMapper } from '../../database/wow/mapper/spellMapper.js';

const database = await getDB();
const spellMapper = useSpellMapper(database);

export async function queryBlankSpells(req, res) {
  const data = await spellMapper.getBlankSpell();
  res.json(data);
}

export async function queryUpdateSpell(req, res) {
  const { id, nameZH, range, cost, castTime, description, cooldown } = req.body;
  try {
    await spellMapper.updateSpellById({
      id,
      nameZH,
      range,
      cost,
      castTime,
      description,
      cooldown,
    });
    res.statusCode = 200;
    res.json({ message: '更新成功' });
  } catch (error) {
    res.statusCode = 500;
    res.json({ message: '更新失败' });
  }
}

// TODO 不存在的spell Id在数据库中自动创建列
export async function querySpellByIds(req, res) {
  const promises = req.body?.ids?.map((id) => spellMapper.getSpellById(id));
  const results = await Promise.allSettled(promises);

  res.json(results.map((item) => item.value));
}
