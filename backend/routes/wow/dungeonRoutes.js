import express from 'express';
import { getDungeonList } from '../../controller/wow/dungeonController.js';
 
const router = express.Router();
 
// GET 请求获取所有用户
router.get('/dungeon/list', getDungeonList);

export default router;