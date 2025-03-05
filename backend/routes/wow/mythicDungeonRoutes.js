import express from 'express';
import {
  queryMythicDungeonById,
  queryMythicDungeonList,
} from '../../controller/wow/mythicDungeonController.js';

const router = express.Router();
router.get('/mythic-dungeon/list', queryMythicDungeonList);
router.get('/mythic-dungeon/:id', queryMythicDungeonById);

export default router;
