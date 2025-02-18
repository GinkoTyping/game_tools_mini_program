import express from 'express';
import { queryBlankSpells, queryUpdateSpell, querySpellByIds, queryAddSpell } from '../../controller/wow/spellController.js';

const router = express.Router();

router.post('/spell', querySpellByIds);
router.get('/spell/blank', queryBlankSpells);
router.post('/spell/update', queryUpdateSpell);
router.post('/spell/add', queryAddSpell);

export default router;
