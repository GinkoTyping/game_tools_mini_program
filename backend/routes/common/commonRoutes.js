import express from 'express';
import { getTranslation } from '../../controller/common/translateController.js';

const router = express.Router();

router.post('/translate', getTranslation);

export default router;
