import { getDB, getDynamicDB } from '../../database/utils/index.js';
import { useNpcAndSpellMarkMapper } from '../../database/wow/mapper/npcAndSpellMarkMapper.js';
import { useQuestionMapper } from '../../database/wow/mapper/static/questionMapper.js';

const db = await getDB();
const questionMapper = useQuestionMapper(db);
const dynamicDB = await getDynamicDB();
const npcAndSpellMapper = useNpcAndSpellMarkMapper(dynamicDB);

async function mapQustionItem(item) {
  const { guide_id, guide_type } = item;
  const tipInfo = await npcAndSpellMapper.getNpcOrSpellCountByIds(
    [guide_id],
    guide_type === 'trash',
    true
  );
  return {
    ...item,
    question_text: JSON.parse(item.question_text),
    imageSrc: JSON.parse(tipInfo?.[0]?.content).imageSrc,
  };
}

export async function queryQuestionByDungeon(req, res) {
  const { dungeonId } = req.body;
  const questions = await questionMapper.getQuestionsByDungeonId(dungeonId);
  const results = await Promise.allSettled(
    questions?.map((question) => mapQustionItem(question))
  );
  res.json(results.map((result) => result.value));
}
