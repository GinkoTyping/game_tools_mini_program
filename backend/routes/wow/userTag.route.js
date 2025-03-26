import express from 'express';
import { queryFriendOptions } from '../../controller/wow/userTag.controller.js';
const router = express.Router();

router.post('/user-tag/options', queryFriendOptions);

export default router;
