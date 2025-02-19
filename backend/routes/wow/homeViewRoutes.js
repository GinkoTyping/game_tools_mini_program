import express from 'express';
import { queryHomeView } from '../../controller/wow/homeViewController.js';

const router = express.Router();

router.get('/home-view', queryHomeView);

export default router;
