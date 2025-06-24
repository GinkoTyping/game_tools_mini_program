import express from 'express';
import { queryDailyMythicRank } from '../../controller/wow/rankController.js';
import { authenticateToken } from '../../auth/validateAdmin.js';

const router = express.Router();
router.post(
  '/rank/daily-mythic',
  authenticateToken,
  queryDailyMythicRank,
);

export default router;