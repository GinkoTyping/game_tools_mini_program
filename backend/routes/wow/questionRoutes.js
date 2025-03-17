import express from 'express';
import {
  queryQuestionByDungeon,
  queryUpdateUserQuestion,
  queryQuestionDunegons,
  queryFinishQuestionByDungeon,
} from '../../controller/wow/question.controller.js';

const router = express.Router();
router.post('/question/dungeon-list', queryQuestionDunegons);
router.post('/question/list', queryQuestionByDungeon);
router.post('/question/finish', queryFinishQuestionByDungeon);
router.post('/question/update-user-question', queryUpdateUserQuestion);

export default router;
