import { Router } from 'express';
import { showResult, showMostChoiced } from '../controller/statController.js';
const router = Router();

router.get('/stats', showResult);
router.get('/stats/detail', showMostChoiced);

export default router;
