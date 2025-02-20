import express from 'express';
import { queryTierList } from '../../controller/wow/tierListController.js';

const router = express.Router();

router.post('/tier-list', queryTierList);

export default router;