import express from 'express';
import {
  getBisBySpec,
  getItemPreviewById,
  queryBisTrends,
  queryBlankSourceItem,
  queryRegisterItem, queryTalentBySpec,
  queryUpdateArchonBisOverview,
  queryUpdateItem,
  queryUpdateMaxrollBisOverview,
} from '../../controller/wow/bisController.js';
import {
  queryPolularity,
  queryPopularityByCondition,
} from '../../controller/wow/popularityController.js';
import { querySpecDpsRank } from '../../controller/wow/specStatController.js';
import { validateAdmin } from '../../auth/validateAdmin.js';
import { getWotlkBisBySpec, queryWotlkTalentBySpec } from '../../controller/wow-wotlk/bisController.js';
import { queryDpsWoWList, queryDpsWowUserSimcRecords } from '../../controller/wow/dspwow.js';

const router = express.Router();

// GET 请求获取所有用户
router.get('/bis/:roleClass/:classSpec', getBisBySpec);
router.post('/wotlk/bis', getWotlkBisBySpec);
router.get('/bis/talent', queryTalentBySpec);
router.get('/bis/wotlk/talent', queryWotlkTalentBySpec);
router.get('/bis/trend', queryBisTrends);
router.get('/bis/popularity', queryPolularity);

router.get('/item/blank-source', queryBlankSourceItem);
router.get('/item/:id', getItemPreviewById);
router.post('/item/update', validateAdmin, queryUpdateItem);
router.post('/item/add', validateAdmin, queryRegisterItem);

router.post('/bis/popularity', queryPopularityByCondition);
router.post('/bis/dps-rank', querySpecDpsRank);

router.post(
  '/bis/archon-overview',
  validateAdmin,
  queryUpdateArchonBisOverview,
);
router.post(
  '/bis/update-maxroll-bis',
  validateAdmin,
  queryUpdateMaxrollBisOverview,
);

router.post('/bis/dpswow/list', queryDpsWoWList);
router.post('/bis/dpswow/records', queryDpsWowUserSimcRecords);

export default router;
