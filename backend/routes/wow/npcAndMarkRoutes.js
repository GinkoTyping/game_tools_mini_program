import express from 'express';

import { queryUpdateMarkStatus } from '../../controller/wow/npcAndSpellMarkController.js';

const router = express.Router();
router.post('/mark/update', queryUpdateMarkStatus);

export default router;
