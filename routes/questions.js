import { Router } from 'express';
import {
  addQuestion,
  allQuestion,
  editQuestion,
  editOptions,
  deleteQuestion,
  deleteOptions,
} from '../controller/QuestionController.js';
const router = Router();

router.post('/', addQuestion); // 질문 추가
router.get('/', allQuestion); // 질문 조회
router.patch('/:question_id', editQuestion); // 질문 수정
router.delete('/:question_id', deleteQuestion); // 질문 삭제
router.patch('/:question_id/options/:option_id', editOptions); // 질문 옵션 수정
router.delete('/:question_id/options/:option_id', deleteOptions); // 질문 옵션 삭제

// 모듈화
export default router;
