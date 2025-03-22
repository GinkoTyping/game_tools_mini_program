import express from 'express';
import { getTranslation } from '../../controller/common/translateController.js';
import {
  queryAccessCount,
  queryScrollInfo,
} from '../../controller/common/infoController.js';
import { queryAdviceList } from '../../controller/common/adviceController.js';
import { queryPatchList } from '../../controller/common/patchController.js';
import {
  queryUpdateAdCount,
  queryAdCount,
  queryUpdateAdCountByUser,
  queryAdCountByUser,
} from '../../controller/common/dynamic/adController.js';
import { authenticateToken } from '../../auth/validateAdmin.js';
import {
  queryCheckDrawTarot,
  queryDrawTarot,
} from '../../controller/common/dynamic/tarotController.js';

const router = express.Router();

router.post('/translate', getTranslation);
router.get('/access-count', queryAccessCount);
router.get('/scroll-info', queryScrollInfo);
router.get('/advice/list', queryAdviceList);
router.get('/patch/list', queryPatchList);

router.get('/ad/query', queryAdCount);
router.get('/ad/update', queryUpdateAdCount);

router.post('/ad/query', queryAdCountByUser);
router.post('/ad/update', queryUpdateAdCountByUser);

router.post('/tarot/check', queryCheckDrawTarot);
router.post('/tarot/draw', queryDrawTarot);

export default router;
