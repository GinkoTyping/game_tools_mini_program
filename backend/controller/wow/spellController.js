import { getDB } from '../../database/utils/index.js';
import { useSpellMapper } from '../../database/wow/mapper/spellMapper.js';

const database = await getDB();
const spellMapper = useSpellMapper(database);

export async function queryBlankSpells(req, res) {
  const version = req.query?.version;
  const data = await spellMapper.getBlankSpell(version);
  res.json(data);
}

export async function queryUpdateSpell(req, res) {
  const { id, nameZH, range, cost, castTime, description, cooldown, version } = req.body;
  try {
    await spellMapper.updateSpellById({
      id,
      nameZH,
      range,
      cost,
      castTime,
      description,
      cooldown,
      version,
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
  try {
    const version = req.body.version;
    const promises = req.body?.ids?.map((id) => spellMapper.getSpellById(id, version));
    const results = await Promise.allSettled(promises);

    res.json(results.map((item) => item.value));
  } catch (e) {
    res.status(500).json(e.message);
  }
}

export async function queryAddSpell(req, res) {
  console.log(`add ${req.body.id}`);
  try {
    if (req.body.id) {
      await spellMapper.insertSpell(req.body);
    }
    res.statusCode = 200;
    res.json({ message: '更新成功' });
  } catch (error) {
    console.log(error);
    res.statusCode = 500;
    res.json({ message: '更新失败' });
  }
}
