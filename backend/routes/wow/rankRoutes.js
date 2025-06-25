import express from 'express';
import { queryDailyMythicRank, queryDailyMythicRankRatio } from '../../controller/wow/rankController.js';
import { authenticateToken } from '../../auth/validateAdmin.js';

const router = express.Router();
router.post(
  '/rank/daily-mythic',
  authenticateToken,
  queryDailyMythicRank,
);

router.post(
  '/rank/daily-mythic-ratio',
  authenticateToken,
  queryDailyMythicRankRatio,
);

export default router;