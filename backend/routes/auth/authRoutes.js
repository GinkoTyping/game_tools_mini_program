import express from 'express';

import { queryLogin } from '../../controller/auth/authController.js';

const router = express.Router();
router.post('/login', queryLogin);

export default router;