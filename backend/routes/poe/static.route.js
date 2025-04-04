import express from 'express';
import {
  queryLadderByTypeAndPaging,
  queryLadderData,
  queryLadderTop,
} from '../../controller/poe/static/ladders.controller.js';

const router = express.Router();

router.get('/static/ladders', queryLadderData);
router.get('/static/top-ladders', queryLadderTop);
router.post('/static/ladder', queryLadderByTypeAndPaging);

export default router;
