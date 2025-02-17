import express from 'express';
import { getTranslation } from '../../controller/common/translateController.js';
import { queryAccessCount } from '../../controller/common/infoController.js';

const router = express.Router();

router.post('/translate', getTranslation);
router.get('/access-count', queryAccessCount);

export default router;
