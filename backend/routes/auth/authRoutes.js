import express from 'express';

import {
  queryLogin,
  queryUpdateUser,
} from '../../controller/auth/authController.js';

const router = express.Router();
router.post('/login', queryLogin);
router.post('/update', queryUpdateUser);

export default router;
