import { getDB, getDynamicDB } from '../../database/utils/index.js';
import { useNpcAndSpellMarkMapper } from '../../database/wow/mapper/npcAndSpellMarkMapper.js';
import { useQuestionMapper } from '../../database/wow/mapper/static/questionMapper.js';
import { useUserQuestionMapper } from '../../database/wow/mapper/dynamic/userQuestion.mapper.js';
import { updateStringList } from '../../util/stringListHandler.js';

const db = await getDB();
const questionMapper = useQuestionMapper(db);
const dynamicDB = await getDynamicDB();
const npcAndSpellMapper = useNpcAndSpellMarkMapper(dynamicDB);
const userQuestionMapper = useUserQuestionMapper(dynamicDB);

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

export async function queryUpdateUserQuestion(req, res) {
  const { questionList, userId } = req.body;
  const wrongList = questionList
    .filter((item) => item.isRight === 0)
    .map((item) => item.id);
  const doneList = questionList.map((item) => item.id);

  const existed = await userQuestionMapper.getAllById(userId);
  let result;
  if (existed) {
    result = await userQuestionMapper.updateById({
      id: userId,
      wrong_list: updateStringList(existed.wrong_list, wrongList),
      done_list: updateStringList(existed.done_list, doneList),
    });
  } else {
    result = await userQuestionMapper.insert({
      id: userId,
      wrong_list: wrongList.join(','),
      done_list: doneList.join(','),
    });
  }
  res.json({
    isSuccess: result.changes,
    messgae: result.changes ? '更新成功' : '更新失败',
  });
}
