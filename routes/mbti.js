import { Router } from 'express';
import {
  createMbti,
  updateMbti,
  getMbtiData,
  getMbtiText,
} from '../controllers/mbtiController.js';

const router = Router();

router.post('/createMBTI', createMbti);

router.post('/vote', updateMbti);

router.get('/getMBTI', getMbtiText);

router.post('/getMBTIData', getMbtiData);

export default router;
