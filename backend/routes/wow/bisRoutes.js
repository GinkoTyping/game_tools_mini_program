import express from 'express';
import {
  getBisBySpec,
  getItemPreviewById,
  queryBisTrends,
} from '../../controller/wow/bisController.js';
import {
  queryPolularity,
  queryPolularityByCondition,
} from '../../controller/wow/popularityController.js';
import { querySpecDpsRank } from '../../controller/wow/specStatController.js';

const router = express.Router();

// GET 请求获取所有用户
router.get('/bis/:roleClass/:classSpec', getBisBySpec);
router.get('/item/:id', getItemPreviewById);
router.get('/bis/trend', queryBisTrends);
router.get('/bis/popularity', queryPolularity);

router.post('/bis/popularity', queryPolularityByCondition);
router.post('/bis/dps-rank', querySpecDpsRank);

export default router;
