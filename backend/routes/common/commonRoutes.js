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
} from '../../controller/common/adController.js';
import { authenticateToken } from '../../auth/validateAdmin.js';

const router = express.Router();

router.post('/translate', getTranslation);
router.get('/access-count', queryAccessCount);
router.get('/scroll-info', queryScrollInfo);
router.get('/advice/list', queryAdviceList);
router.get('/patch/list', queryPatchList);

router.get('/ad/query', authenticateToken, queryAdCount);
router.get('/ad/update', authenticateToken, queryUpdateAdCount);

export default router;
