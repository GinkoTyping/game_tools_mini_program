import express from 'express';

import {
  queryUpdateMarkStatus,
  queryUserMarksById,
} from '../../controller/wow/npcAndSpellMarkController.js';
import { authenticateToken } from '../../auth/validateAdmin.js';

const router = express.Router();
router.post('/mark/update', queryUpdateMarkStatus);
router.get('/mark/:id', queryUserMarksById);

export default router;
