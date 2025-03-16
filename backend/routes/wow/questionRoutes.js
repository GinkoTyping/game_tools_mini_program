import express from 'express';
import { queryQuestionByDungeon, queryUpdateUserQuestion } from '../../controller/wow/question.controller.js';

const router = express.Router();
router.post('/question/list', queryQuestionByDungeon);
router.post('/question/update-user-question', queryUpdateUserQuestion);

export default router;
