import express from 'express';
import {
  queryAddNpc,
  queryNpcById,
  queryNpcByNameEn,
  queryNpcToTranslate,
  queryUpdateNpc,
} from '../../controller/wow/npcController.js';

const router = express.Router();

router.post('/npc/update', queryUpdateNpc);
router.post('/npc/add', queryAddNpc);
router.post('/npc/name-en', queryNpcByNameEn);
router.get('/npc/translate', queryNpcToTranslate);
router.get('/npc/:id', queryNpcById);

export default router;
