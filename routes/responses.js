import { Router } from 'express';
const {
  responseVote,
  responseEdit,
  responseDelete,
} = require('../controller/responsesController'); // 컨트롤러 불러옴

const router = Router();

// 설문에 응답하기
router.post('/', responseVote);

// 응답 수정하기
router.put('/:response_id', responseEdit);

// 응답 삭제하기
router.delete('/:response_id', responseDelete);

module.exports = router;
