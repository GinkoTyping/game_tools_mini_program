import express from 'express';
import {
  queryAddUserTag,
  queryFilterUserTag,
  queryUpdateUserTag,
  queryUserTagByIds,
  queryUserTagOptions,
} from '../../controller/wow/userTag.controller.js';
const router = express.Router();

router.post('/user-tag/options', queryUserTagOptions);
router.post('/user-tag/add', queryAddUserTag);
router.post('/user-tag/update', queryUpdateUserTag);
router.post('/user-tag/query', queryUserTagByIds);
router.post('/user-tag/list', queryFilterUserTag);

export default router;
