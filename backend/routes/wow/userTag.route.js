import express from 'express';
import {
  queryAddUserTag,
  queryUserTagByIds,
  queryUserTagOptions,
} from '../../controller/wow/userTag.controller.js';
const router = express.Router();

router.post('/user-tag/options', queryUserTagOptions);
router.post('/user-tag/add', queryAddUserTag);
router.post('/user-tag/query', queryUserTagByIds);

export default router;
