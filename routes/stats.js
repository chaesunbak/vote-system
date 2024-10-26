import { Router } from 'express';
import { showResult, showMostChoiced } from '../Controller/StatController.js';

const router = Router({ mergeParams: true });

router.get('/', showResult);
router.get('/detail', showMostChoiced);

export default router;
