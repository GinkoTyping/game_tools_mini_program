import { getDB, getDynamicDB } from '../../database/utils/index.js';
import { useDungeonMapper } from '../../database/wow/mapper/dungeonMapper.js';
import { useNpcAndSpellMarkMapper } from '../../database/wow/mapper/npcAndSpellMarkMapper.js';
import { useQuestionMapper } from '../../database/wow/mapper/static/questionMapper.js';
import { useUserQuestionMapper } from '../../database/wow/mapper/dynamic/userQuestion.mapper.js';
import { updateStringList } from '../../util/stringListHandler.js';
import { useMythicDungeonQuestionCountMapper } from '../../database/wow/mapper/mythicDungeonQuestionCount.mapper.js';

const db = await getDB();
const questionMapper = useQuestionMapper(db);
const dungeonMapper = useDungeonMapper(db);

const dynamicDB = await getDynamicDB();
const npcAndSpellMapper = useNpcAndSpellMarkMapper(dynamicDB);
const userQuestionMapper = useUserQuestionMapper(dynamicDB);
const mDungeonQuestionCountMapper =
  useMythicDungeonQuestionCountMapper(dynamicDB);

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
  const { dungeonId, userId } = req.body;
  const dungeonsData = await dungeonMapper.getDungeonsById([dungeonId]);
  let questions = await questionMapper.getQuestionsByDungeonId(dungeonId);

  // 设置 用户历史答题的状态
  const userData = await userQuestionMapper.getAllById(userId);
  questions = questions.map((question) => {
    let isRight;
    if (userData?.done_list?.includes(question.id)) {
      isRight = userData?.wrong_list?.includes(question.id) ? 0 : 1;
    } else {
      isRight = -1;
    }
    return {
      ...question,
      isRight,
    };
  });

  // 获取题目对应的图片
  const results = await Promise.allSettled(
    questions?.map((question) => mapQustionItem(question))
  );
  res.json({
    dungeonId,
    dungeonName: dungeonsData[0].name_zh,
    data: results.map((result) => result.value),
  });
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
      wrong_list: wrongList?.length ? wrongList.join(',') : null,
      done_list: doneList?.length ? doneList.join(',') : null,
    });
  }
  res.json({
    isSuccess: result.changes,
    messgae: result.changes ? '更新成功' : '更新失败',
  });
}

export async function queryFinishQuestionByDungeon(req, res) {
  const { dungeonId } = req.body;
  const data = await mDungeonQuestionCountMapper.addById(dungeonId);
  res.json({ message: data.changes ? '更新成功' : '更新失败' });
}

export async function queryQuestionResult(req, res) {
  const { dungeonId, userId } = req.body;
  const data = await userQuestionMapper.getAllById(userId);
  if (data) {
    const { wrong_list, done_list } = data;
    const doneQuestionsList = await questionMapper.getQuestionsByIds(
      done_list?.split(',') ?? []
    );
    const filteredDoneList = doneQuestionsList.filter(
      (item) => item.dungeon_id === dungeonId
    );
    const filteredWrongIds =
      wrong_list
        ?.split(',')
        ?.filter((item) => filteredDoneList.includes(item)) ?? [];
    res.json({
      questions: filteredDoneList,
      wrongIds: filteredWrongIds,
    });
  } else {
    res.json({
      questions: [],
      wrongIds: [],
    });
  }
}

export async function queryQuestionDunegons(req, res) {
  const { userId } = req.body;
  const userData = await userQuestionMapper.getAllById(userId);
  const doneList = userData?.done_list ?? [];
  const allQuestions = await questionMapper.getAllQuestions();
  const completionData = allQuestions.reduce((pre, cur) => {
    if (pre[cur.dungeon_id]) {
      pre[cur.dungeon_id].total++;
    } else {
      pre[cur.dungeon_id] = {
        count: 0,
        total: 1,
      };
    }

    if (doneList.includes(cur.id)) {
      pre[cur.dungeon_id].count++;
    }
    return pre;
  }, {});

  const data = await mDungeonQuestionCountMapper.getList();
  const output = data.map((item) => ({
    ...item,
    doneQuestionCount: completionData?.[item.id]?.count,
    totalQuestionCount: completionData?.[item.id]?.total,
  }));
  res.json(output);
}
