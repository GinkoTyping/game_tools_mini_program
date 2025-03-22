import express from 'express';

import {
  queryUpdateMarkStatus,
  queryUserMarksById,
} from '../../controller/wow/npcAndSpellMarkController.js';
import { authenticateToken } from '../../auth/validateAdmin.js';

const router = express.Router();
router.post('/mark/update', authenticateToken, queryUpdateMarkStatus);
router.get('/mark/:id', authenticateToken, queryUserMarksById);

export default router;
