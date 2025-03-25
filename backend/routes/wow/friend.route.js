import express from 'express';
import { queryFriendOptions } from '../../controller/wow/friend.controller.js';
const router = express.Router();

router.post('/friend/options', queryFriendOptions);

export default router;
