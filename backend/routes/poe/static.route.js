import express from 'express';
import { queryLadderData } from '../../controller/poe/static/ladders.controller.js';

const router = express.Router();
router.get('/static/ladders', queryLadderData);

export default router;
