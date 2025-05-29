import { getDB } from '../../../../utils/index.js';
import { useTalentMapper } from '../../../mapper/static/talentMapper.js';

const db = await getDB();
const talentMapper = useTalentMapper(db);

function checkNotNullNode(node) {
  return node.ranks?.[0]?.tooltip || node.ranks?.[0]?.choice_of_tooltips;
}

async function validateTalentTree(talentData) {
  const heroNodeIds = [talentData.hero_talent_trees.map(heroTree => heroTree.hero_talent_nodes)].flat().map(
    node => node.id);
  const specNodeIds = talentData.spec_talent_nodes.map(node => node.id);

  talentData.class_talent_nodes = talentData.class_talent_nodes.filter(node =>
    !heroNodeIds.includes(node.id)
    && !specNodeIds.includes(node.id)
    && checkNotNullNode(node),
  );
  talentData.spec_talent_nodes = talentData.spec_talent_nodes.filter(node => !heroNodeIds.includes(node.id) && checkNotNullNode(
    node));
  talentData.playable_specialization = { id: talentData.id };
  return talentMapper.addTalent(talentData);
}

async function main() {
  const talents = await talentMapper.getTalentList();

  const results = await Promise.allSettled(talents.map(talent => validateTalentTree(talent)));
  console.log(results);
}

main();