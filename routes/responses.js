import { Router } from 'express';
const {
  createResponse,
  editResponse,
  deleteResponse,
} = require('../controller/responsesController'); // 컨트롤러 불러옴

const router = Router();

// 설문에 응답하기
router.post('/', createResponse);

// 응답 수정하기
router.put('/:response_id', editResponse);

// 응답 삭제하기
router.delete('/:response_id', deleteResponse);

module.exports = router;
