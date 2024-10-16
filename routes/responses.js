const express = require('express');
const router = express.Router({ mergeParams: true }); // poll_id를 받기 위해 mergeParams 사용
const {
  responseVote,
  responseEdit,
  responseDelete
} = require('../controller/responsesController'); // 컨트롤러 불러옴

router.use(express.json()); // POST를 사용하면 값을 json형태로 받아오기 때문에 추가


// 설문에 응답하기
router.post('/', responseVote)

// 응답 수정하기
router.put('/:response_id', responseEdit)

// 응답 삭제하기
router.delete('/:response_id', responseDelete)

module.exports = router;