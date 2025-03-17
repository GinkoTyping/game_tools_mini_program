import { getDB, getDynamicDB } from '../../../utils/index.js';
import { useNpcAndSpellMarkMapper } from '../../mapper/npcAndSpellMarkMapper.js';
import { useQuestionMapper } from '../../mapper/static/questionMapper.js';
import questionData from './question.js';

const db = await getDB();
const questionMapper = useQuestionMapper(db);
const dynamicDB = await getDynamicDB();
const npcAndSpellMapper = useNpcAndSpellMarkMapper(dynamicDB);

function shuffleOptions(questionText) {
  function shuffle(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  return {
    ...questionText,
    options: shuffle(questionText.options),
  };
}

async function updateQuestionItem(params) {
  const { guide_id, guide_type } = params;
  async function getDungeonId(guide_id, guide_type) {
    const data = await npcAndSpellMapper.getNpcOrSpellCountByIds(
      [guide_id],
      guide_type === 'trash',
      true
    );
    return data?.[0]?.dungeon_id;
  }
  const dungeon_id = await getDungeonId(guide_id, guide_type);
  const existed = await questionMapper.getQuestionByCondition(params);
  const shuffledQuestions = shuffleOptions(params.question_text);
  const finalParams = {
    ...params,
    dungeon_id,
    question_text: JSON.stringify(shuffledQuestions),
  };
  return existed
    ? questionMapper.updateQuestion(finalParams)
    : questionMapper.insertQuestion(finalParams);
}

async function main() {
  return Promise.allSettled(
    questionData.map((item) => updateQuestionItem(item))
  );
}

main();
