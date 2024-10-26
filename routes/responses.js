import { Router } from 'express';
import {
  createResponse,
  editResponse,
  deleteResponse,
} from '../controller/responsesController.js';

const router = Router({ mergeParams: true });

// 설문에 응답하기
router.post('/', createResponse);

// 응답 수정하기
router.put('/:response_id', editResponse);

// 응답 삭제하기
router.delete('/:response_id', deleteResponse);

export default router;
