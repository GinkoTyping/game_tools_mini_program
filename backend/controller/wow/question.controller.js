import { getDB, getDynamicDB } from '../../database/utils/index.js';
import { useDungeonMapper } from '../../database/wow/mapper/dungeonMapper.js';
import { useNpcAndSpellMarkMapper } from '../../database/wow/mapper/npcAndSpellMarkMapper.js';
import { useQuestionMapper } from '../../database/wow/mapper/static/questionMapper.js';
import { useUserQuestionMapper } from '../../database/wow/mapper/dynamic/userQuestion.mapper.js';
import { updateStringList } from '../../util/stringListHandler.js';
import { useMythicDungeonQuestionCountMapper } from '../../database/wow/mapper/mythicDungeonQuestionCount.mapper.js';
import { updateMarkStatus } from './npcAndSpellMarkController.js';

const db = await getDB();
const questionMapper = useQuestionMapper(db);
const dungeonMapper = useDungeonMapper(db);

const dynamicDB = await getDynamicDB();
const npcAndSpellMapper = useNpcAndSpellMarkMapper(dynamicDB);
const userQuestionMapper = useUserQuestionMapper(dynamicDB);
const dqCountMapper = useMythicDungeonQuestionCountMapper(dynamicDB);

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

async function getQuestionCorrectRatingByDungeon(dungeonId) {
  const allUserQuestions = await userQuestionMapper.getAllUserQuestion();
  const dungeonQuestion = await questionMapper.getQuestionsByDungeonId(
    dungeonId
  );
  const validGuideIds = dungeonQuestion?.map((item) => Number(item.id)) ?? [];
  const { wrongCount, totalCount } = allUserQuestions.reduce(
    (pre, cur) => {
      const validIds = cur.done_list.filter((item) =>
        validGuideIds.includes(Number(item))
      );
      const validWrongIds = cur.wrong_list.filter((item) =>
        validGuideIds.includes(Number(item))
      );
      pre.totalCount += validIds.length;
      pre.wrongCount += validWrongIds.length;
      return pre;
    },
    { wrongCount: 0, totalCount: 0 }
  );
  return ((1 - wrongCount / totalCount) * 100).toFixed(2);
}
export async function queryQuestionByDungeon(req, res) {
  const { dungeonId, userId, showAvgCorrect } = req.body;
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
  let avgCorrectPercentage;
  if (showAvgCorrect) {
    avgCorrectPercentage = await getQuestionCorrectRatingByDungeon(dungeonId);
  }
  res.json({
    dungeonId,
    dungeonName: dungeonsData[0].name_zh,
    data: results.map((result) => result.value),
    avgCorrect: avgCorrectPercentage,
  });
}

// TODO mark错误的问题 03-18
async function syncUpdateTipMark(userId, questionList) {
  function syncUpdateItem(userId, question) {
    const params = {
      isNpc: question.guide_type === 'trash',
      isMark: true,
      userId,
      markId: question.guide_id,
    };

    return updateMarkStatus(params);
  }

  // Promise 并发会导致 资源竞争
  const results = [];
  for (const item of questionList) {
    try {
      const value = await syncUpdateItem(userId, item);
      results.push({ status: 'fulfilled', value }); // 模拟 Promise.allSettled 成功结构
    } catch (reason) {
      results.push({ status: 'rejected', reason }); // 模拟 Promise.allSettled 失败结构
    }
  }
  return results;
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

  // 把错题 同步更新到用户的 mark 记录里
  await syncUpdateTipMark(
    userId,
    questionList.filter((item) => item.isRight === 0)
  );

  res.json({
    isSuccess: result.changes,
    messgae: result.changes ? '更新成功' : '更新失败',
  });
}

export async function queryFinishQuestionByDungeon(req, res) {
  const { dungeonId } = req.body;
  const data = await dqCountMapper.addById(dungeonId);
  res.json({ message: data.changes ? '更新成功' : '更新失败' });
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

  const data = await dqCountMapper.getList();
  const output = data.map((item) => ({
    ...item,
    doneQuestionCount: completionData?.[item.id]?.count,
    totalQuestionCount: completionData?.[item.id]?.total,
  }));
  res.json(output);
}
