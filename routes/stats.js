import { Router } from 'express';
import { showResult, showMostChoiced } from '../controllers/statsController.js';
const router = Router();

router.get('/:id/stats', showResult);
router.get('/:id/stats/detail', showMostChoiced);

export default router;
