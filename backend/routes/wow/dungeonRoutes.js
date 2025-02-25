import express from 'express';
import {
  getDungeonList,
  getDungeonByName,
} from '../../controller/wow/dungeonController.js';

const router = express.Router();

router.get('/dungeon/list', getDungeonList);
router.post('/dungeon/query', getDungeonByName);

export default router;
