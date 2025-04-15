import express from 'express';
import {
  queryTierList,
  queryUpdateArchonMythicTier,
} from '../../controller/wow/tierListController.js';
import { validateAdmin } from '../../auth/validateAdmin.js';

const router = express.Router();

router.post('/tier-list', queryTierList);
router.post('/tier-list/update', validateAdmin, queryUpdateArchonMythicTier);

export default router;
