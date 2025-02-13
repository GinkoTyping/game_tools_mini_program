import express from 'express';
import { queryBlankSpells, queryUpdateSpell } from '../../controller/wow/spellController.js';

const router = express.Router();

router.get('/spell/blank', queryBlankSpells);
router.post('/spell/update', queryUpdateSpell);

export default router;
