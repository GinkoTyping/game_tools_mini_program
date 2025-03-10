import express from 'express';
import {
  queryAddNpc,
  queryNpcById,
  queryNpcByNameEn,
  queryNpcToTranslate,
  queryUpdateNpc,
} from '../../controller/wow/npcController.js';
import { validateAdmin } from '../../auth/validateAdmin.js';

const router = express.Router();

router.post('/npc/update', validateAdmin, queryUpdateNpc);
router.post('/npc/add', validateAdmin, queryAddNpc);

router.post('/npc/name-en', queryNpcByNameEn);
router.get('/npc/translate', queryNpcToTranslate);
router.get('/npc/:id', queryNpcById);

export default router;
