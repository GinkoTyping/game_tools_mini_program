import express from 'express';
import { queryDungeonTipByCondition } from '../../controller/wow/dungeonTipController.js';

const router = express.Router();

router.post('/dungeon-tip', queryDungeonTipByCondition);

export default router;
