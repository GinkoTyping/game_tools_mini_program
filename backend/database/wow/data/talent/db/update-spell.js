import Bottleneck from 'bottleneck';
import path from 'path';
import { fileURLToPath } from 'url';

import { getDB } from '../../../../utils/index.js';
import setBlizzAPI from '../../../../../util/blizz.js';
import { downloadSingle } from '../../../../../util/download.js';
import { useTalentMapper } from '../../../mapper/static/talentMapper.js';
import { useSpellMapper } from '../../../mapper/spellMapper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = await getDB();
const blizzAPI = setBlizzAPI();

const talentMapper = useTalentMapper(db);
const spellMapper = useSpellMapper(db);

async function getBlankSpells(talentData) {
  const heroTalentNodes = talentData.hero_talent_trees.reduce((pre, cur) => {
    pre.push(...cur.hero_talent_nodes);
    return pre;
  }, []);
  const allSpells = [...talentData.class_talent_nodes, ...talentData.spec_talent_nodes, ...heroTalentNodes].reduce((
    pre,
    cur,
  ) => {
    if (cur.ranks?.[0]?.tooltip) {
      pre.push({
        id: cur.ranks[0]?.tooltip.spell_tooltip.spell.id,
        url: cur.ranks[0]?.tooltip.spell_tooltip.spell.key.href,
      });
    } else if (cur.ranks?.[0]?.choice_of_tooltips?.length) {
      pre.push(...cur.ranks[0]?.choice_of_tooltips.map(item => ({
        id: item.spell_tooltip.spell.id,
        url: item.spell_tooltip.spell.key.href,
      })));
    }
    return pre;
  }, []);

  const blankSpells = [];

  async function filterSpell(spellItem) {
    const spell = await spellMapper.getSpellById(spellItem.id);
    if (!spell?.image) {
      blankSpells.push(spellItem);
    }
  }

  await Promise.allSettled(allSpells.map(spellItem => filterSpell(spellItem)));
  return blankSpells;
}

async function downloadSpell(spellItem) {
  try {
    const { id, url } = spellItem;
    const data = await blizzAPI.query(`/data/wow/media/spell/${id}`, {
      params: {
        namespace: 'static-us',
        locale: 'zh_CN',
      },
    });
    if (data.assets?.[0]?.value) {
      const image = data.assets[0].value.split('/').pop();
      await downloadSingle(
        data.assets[0].value,
        path.resolve(
          __dirname,
          `../../../../../assets/wow/blizz-media-image/spell/${image}`,
        ),
      );
      const isExisted = await spellMapper.getSpellById(id);
      if (isExisted) {
        return spellMapper.updateSpellById({ id, image });
      } else {
        return spellMapper.insertSpell({ id: id, image: image });
      }
    }
  } catch (e) {
    return Promise.reject(e);
  }
}

const limiter = new Bottleneck({
  minTime: 50, // 50ms间隔 → 20次/秒
});

async function updateSpellsBySpec(classSpec, roleClass) {
  const talentData = await talentMapper.getTalent(classSpec, roleClass);
  const spells = await getBlankSpells(talentData);
  console.log('开始获取spell', classSpec, roleClass, spells?.length, '个');
  const results = await Promise.allSettled(spells.map(item => limiter.schedule(() => downloadSpell(item))));
  const errors = results.filter((item) => item.status !== 'fulfilled');
  if (errors.length) {
    console.log(classSpec, roleClass, '下载失败：' + errors.length);
  }
  console.log('完成', classSpec, roleClass);
}

const mainLimiter = new Bottleneck({
  maxConcurrent: 2,
});

async function main() {
  const talents = await talentMapper.getTalentList();
  await Promise.allSettled(talents.map(item => mainLimiter.schedule(() => updateSpellsBySpec(
    item.class_spec,
    item.role_class,
  ))));
}

main();