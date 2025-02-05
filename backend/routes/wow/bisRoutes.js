import express from 'express';
import { getBisBySpec } from '../../controller/wow/bisController.js';
 
const router = express.Router();
 
// GET 请求获取所有用户
router.get('/bis/:roleClass/:classSpec', getBisBySpec);

export default router;