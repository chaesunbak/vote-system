import { Router } from 'express';
import {
  createSurvey,
  getSurveys,
  getSurveyById,
  updateSurvey,
  deleteSurvey,
} from '../controller/surveysController.js';

const router = Router();

// 설문조사 관련 API 라우트 설정
router.post('/', createSurvey); // 설문조사 생성
router.get('/', getSurveys); // 설문조사 목록 조회
router.get('/:survey_id', getSurveyById); // 개별 설문조사 조회
router.put('/:survey_id', updateSurvey); // 설문조사 수정
router.delete('/:survey_id', deleteSurvey); // 설문조사 삭제

export default router;
