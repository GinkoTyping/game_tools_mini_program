import express from 'express';
import {
  getBisBySpec,
  getItemPreviewById,
  queryBisTrends,
} from '../../controller/wow/bisController.js';

const router = express.Router();

// GET 请求获取所有用户
router.get('/bis/:roleClass/:classSpec', getBisBySpec);
router.get('/item/:id', getItemPreviewById);
router.get('/bis/trend', queryBisTrends);

export default router;
