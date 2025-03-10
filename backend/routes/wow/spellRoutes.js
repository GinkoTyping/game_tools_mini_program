import express from 'express';
import {
  queryBlankSpells,
  queryUpdateSpell,
  querySpellByIds,
  queryAddSpell,
} from '../../controller/wow/spellController.js';
import { validateAdmin } from '../../auth/validateAdmin.js';

const router = express.Router();

router.post('/spell/update', validateAdmin, queryUpdateSpell);
router.post('/spell/add', validateAdmin, queryAddSpell);

router.post('/spell', querySpellByIds);
router.get('/spell/blank', queryBlankSpells);

export default router;
