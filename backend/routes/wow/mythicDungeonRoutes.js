import express from 'express';
import { queryMythicDungeonById } from '../../controller/wow/mythicDungeonController.js';

const router = express.Router();
router.get('/mythic-dungeon/:id', queryMythicDungeonById);

export default router;
