import { Router } from 'express';
import { showResult, showMostChoiced } from '../controller/statController.js';

const router = Router({ mergeParams: true });

router.get('/', showResult);
router.get('/detail', showMostChoiced);

export default router;
