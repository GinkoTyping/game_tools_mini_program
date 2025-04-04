import express from 'express';
import { queryLadderData, queryLadderTop } from '../../controller/poe/static/ladders.controller.js';

const router = express.Router();

router.get('/static/ladders', queryLadderData);
router.get('/static/top-ladders', queryLadderTop);

export default router;
