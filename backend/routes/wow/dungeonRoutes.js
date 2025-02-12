import express from 'express';
import { getDungeonList } from '../../controller/wow/dungeonController.js';
 
const router = express.Router();
 
router.get('/dungeon/list', getDungeonList);

export default router;