import express from 'express';
import { getTranslation } from '../../controller/common/translateController.js';
import {
  queryAccessCount,
  queryScrollInfo,
} from '../../controller/common/infoController.js';
import { queryAdviceList } from '../../controller/common/adviceController.js';
import { queryPatchList } from '../../controller/common/patchController.js';

const router = express.Router();

router.post('/translate', getTranslation);
router.get('/access-count', queryAccessCount);
router.get('/scroll-info', queryScrollInfo);
router.get('/advice/list', queryAdviceList);
router.get('/patch/list', queryPatchList);

export default router;
