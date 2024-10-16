const { StatusCodes } = require('http-status-codes');
const connection = require('../mariadb');

// 설문에 응답하기 (POST /surveys/:survey_id/responses)
const responseVote = (req, res) => {
  const { survey_id } = req.params;
  const { user_id, answers } = req.body; // answers는 [{ question_id, option_id, answer_text }, ...] 형태로 전달

  // 1. responses 테이블에 각 질문과 그에 대한 응답을 함께 삽입
  for (const answer of answers) {
    const { question_id, option_id, answer_text } = answer;

    connection.query(
      'INSERT INTO responses (survey_id, user_id, question_id, option_id, answer_text) VALUES (?, ?, ?, ?, ?)',
      [survey_id, user_id, question_id, option_id || null, answer_text || null],
      (err) => {
        if (err) {
          console.error(err);
          return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to submit response' });
        }
      }
    );
  }

  // 응답 완료 후 성공 메시지 반환
  res.status(StatusCodes.CREATED).json({ message: 'Response submitted successfully' });
};

// 응답 수정하기 (PUT /surveys/:survey_id/responses/:response_id)
const responseEdit = (req, res) => {
  const { survey_id, response_id } = req.params;
  const { answers } = req.body;

  // 1. 기존 응답 삭제
  connection.query(
    'DELETE FROM responses WHERE id = ?',
    [response_id],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to delete previous responses' });
      }

      // 2. 수정된 answers 데이터를 responses 테이블에 다시 삽입
      for (const answer of answers) {
        const { question_id, option_id, answer_text } = answer;

        connection.query(
          'INSERT INTO responses (survey_id, user_id, question_id, option_id, answer_text) VALUES (?, ?, ?, ?, ?)',
          [survey_id, response_id, question_id, option_id || null, answer_text || null],
          (err) => {
            if (err) {
              console.error(err);
              return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to update responses' });
            }
          }
        );
      }

      res.status(StatusCodes.OK).json({ message: 'Response updated successfully' });
    }
  );
};

// 응답 삭제하기 (DELETE /surveys/:survey_id/responses/:response_id)
const responseDelete = (req, res) => {
  const { response_id } = req.params;

  connection.query(
    'DELETE FROM responses WHERE id = ?',
    [response_id],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to delete response' });
      }

      res.status(StatusCodes.NO_CONTENT).send();
    }
  );
};

module.exports = {
  responseVote,
  responseEdit,
  responseDelete,
};