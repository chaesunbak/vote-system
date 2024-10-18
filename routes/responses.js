const express = require('express');
const router = express.Router({ mergeParams: true }); // poll_id를 받기 위해 mergeParams 사용
const {
  responseVote,
  responseEdit,
  responseDelete,
} = require('../controller/responsesController'); // 컨트롤러 불러옴

// 설문에 응답하기
router.post('/', responseVote);

// 응답 수정하기
router.put('/:response_id', responseEdit);

// 응답 삭제하기
router.delete('/:response_id', responseDelete);

module.exports = router;
