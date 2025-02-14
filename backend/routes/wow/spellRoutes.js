import express from 'express';
import { queryBlankSpells, queryUpdateSpell, querySpellByIds } from '../../controller/wow/spellController.js';

const router = express.Router();

router.post('/spell', querySpellByIds);
router.get('/spell/blank', queryBlankSpells);
router.post('/spell/update', queryUpdateSpell);

export default router;
