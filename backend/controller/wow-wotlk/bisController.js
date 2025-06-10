import { getDB, getDynamicDB } from '../../database/utils/index.js';
import { useWotlkTalentMapper } from '../../database/wow/mapper/static/wotlkTalentMapper.js';
import { isLocal } from '../../auth/validateAdmin.js';
import { useSpecBisCountMapper } from '../../database/wow/mapper/specBisCountMapper.js';
import { getBis, useWotlkBisMapper } from '../../database/wow/mapper/static/wotlkBisMapper.js';
import { useItemMapper } from '../../database/wow/mapper/itemMapper.js';

const db = await getDB();
const wotlkBisMapper = useWotlkBisMapper(db);
const wotlkTalentMapper = useWotlkTalentMapper(db);
const itemMapper = useItemMapper(db);

const dynamicDB = await getDynamicDB();
const specBisCountMapper = useSpecBisCountMapper(dynamicDB);

export async function queryWotlkTalentBySpec(req, res) {
  try {
    const { roleClass, classSpec, type } = req.body;
    const data = await wotlkTalentMapper.getTalent({ roleClass, classSpec, type });
    console.log({ data });
    res.json(data);
  } catch (e) {
    res.status(500).json(e.message);
  }
}

export async function getWotlkBisBySpec(req, res) {
  const { roleClass, classSpec, type } = req.body ?? {};
  try {
    const data = await wotlkBisMapper.getBis({ roleClass, classSpec, type });
    const talentTrees = await wotlkTalentMapper.getTalent(roleClass);
    const [buildResult, levelingResult] = await Promise.allSettled(['build', 'leveling'].map(async key => {
      const glyphs = await Promise.allSettled(data.talent[key].glyphs.map(async item => {
        const itemResults = await Promise.allSettled(item.glyphs.map(id => itemMapper.getWotlkItemById(id, true)));
        return {
          type: item.type,
          glyphs: itemResults.map(result => result.value),
        };
      }));
      return {
        glyphs: glyphs.map(child => child.value),
        talent: data.talent[key].talent,
      };
    }));
    data.talent.build = buildResult.value;
    data.talent.leveling = levelingResult.value;
    data.talent_groups = talentTrees.talent_groups;
    res.json(data);
  } catch (e) {
    res.status(500).json(e.message);
  } finally {
    // 避免本地调测时，引起本地的数据和服务器不一致
    if (!isLocal(req)) {
      // 访问次数 +1
      await specBisCountMapper.addSpecBisCountByClassAndSpec({
        roleClass,
        classSpec,
        version: 'wotlk',
        type,
      });
    }
  }
}