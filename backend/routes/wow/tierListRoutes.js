import express from 'express';
import { queryTierList } from '../../controller/wow/tierListController.js';

const router = express.Router();

router.get('/tier-list/:versionId', queryTierList);

export default router;