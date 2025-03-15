import express from 'express';
import { queryQuestionByDungeon } from '../../controller/wow/question.controller.js';

const router = express.Router();
router.post('/question/list', queryQuestionByDungeon);

export default router;
