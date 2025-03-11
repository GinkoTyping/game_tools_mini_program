import express from 'express';

import { queryUpdateMarkStatus } from '../../controller/wow/npcAndSpellMarkController.js';
import { authenticateToken } from '../../auth/validateAdmin.js';

const router = express.Router();
router.post('/mark/update', authenticateToken, queryUpdateMarkStatus);

export default router;
