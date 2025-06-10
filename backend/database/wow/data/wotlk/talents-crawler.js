import axios from 'axios';

import { getDB } from '../../../utils/index.js';
import { usePlayableRoleMapper } from '../../mapper/static/playableRoleMapper.js';
import { useWotlkTalentMapper } from '../../mapper/static/wotlkTalentMapper.js';
import { useSpellMapper } from '../../mapper/spellMapper.js';

const db = await getDB();
const playableRoleMapper = usePlayableRoleMapper(db);
const wotlkTalentMapper = useWotlkTalentMapper(db);
const spellMapper = useSpellMapper(db);

async function getClassTalentData(name) {
  const url = `https://static.icy-veins.com/json/wotlk-talent-calculator/${name}.json`;
  const response = await axios.get(url);

  async function mapTalentNode(node) {
    if (node) {
      const ranks = node.ranks.map(rank => rank.id);
      const spellResults = await Promise.allSettled(ranks.map(async id => {
        const spell = await spellMapper.getSpellById(id, 'wotlk');
        if (!spell) {
          return spellMapper.insertSpell({ id, idWowDB: id, version: 'wotlk' });
        }
      }));
      return {
        name: node.name,
        requiredPoints: node.requiredPoints,
        ranks,
      };
    }
    return null;
  }

  if (response.data) {
    let { classId, talentGroups } = response.data;
    let index = 0;
    let outputGroups = [];
    for (let i = 0; i < talentGroups.length; i++) {
      const talentsResults = await Promise.allSettled(talentGroups[i].talents.map(node => mapTalentNode(node)));
      let selfIndex = 0;
      outputGroups.push({
        slug: talentGroups[i].slug.replace(' ', '-'),
        talents: talentsResults.map(result => {
          if (result.value) {
            const currentIndex = index;
            const currentSelfIndex = selfIndex;
            index++;
            selfIndex++;
            return {
              ...result.value,
              index: currentIndex,
              selfIndex: currentSelfIndex,
            };
          }
          return null;
        }),
      });
    }

    return wotlkTalentMapper.addTalent({
      id: classId,
      talent_groups: outputGroups,
      role_class: name,
    });
  }
  return null;
}

async function main() {
  let classList = await playableRoleMapper.getPlayableClassList();
  classList = classList.map(item => item.name_en.replace(' ', '-').toLowerCase());

  await Promise.allSettled(classList.map(name => getClassTalentData(name)));
}

main();