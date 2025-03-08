import express from 'express';
import { queryRaidGuide } from '../../controller/wow/raidGuideController.js';

const router = express.Router();

router.get('/raid-guide', queryRaidGuide);

export default router;
