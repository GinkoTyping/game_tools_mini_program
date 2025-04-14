import express from 'express';
import {
  queryAscendancyRanks,
  queryLadderByTypeAndPaging,
  queryLadderData,
  queryLadderTop,
  queryUpdateLadders,
} from '../../controller/poe/static/ladders.controller.js';
import { validateAdmin } from '../../auth/validateAdmin.js';

const router = express.Router();

router.get('/static/ladders', queryLadderData);
router.get('/static/top-ladders', queryLadderTop);
router.get('/static/top-ascendancies/:type', queryAscendancyRanks);
router.post('/static/ladder', queryLadderByTypeAndPaging);
router.post('/static/update-ladders', validateAdmin, queryUpdateLadders);

export default router;
