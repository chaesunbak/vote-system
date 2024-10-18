import pool from '../mariadb.js';
import { StatusCodes } from 'http-status-codes';

// 설문에 응답하기 (POST /surveys/:survey_id/responses)
export const createResponse = (req, res) => {
  const { survey_id } = req.params;
  const { user_id, answers } = req.body; // answers는 [{ question_id, option_id, answer_text }, ...] 형태로 전달

  try {

    for (const answer of answers) {
      const { question_id, option_id, answer_text } = answer;

      const [rows, fields] = await pool.execute(
        'INSERT INTO responses (survey_id, user_id, question_id, option_id, answer_text) VALUES (?, ?, ?, ?, ?)',
        [survey_id, user_id, question_id, option_id || null, answer_text || null]
      );

      if (rows.affectedRows === 0) {
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ error: 'Failed to submit response' });
      }

      return res
      .status(StatusCodes.CREATED)
      .json({ message: 'Response submitted successfully' })
    }

  } catch (error) {
    console.log(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to submit response'});
  }
};

// 응답 수정하기 (PUT /surveys/:survey_id/responses/:response_id)
export const editResponse = (req, res) => {
  const { survey_id, response_id } = req.params;
  const { answers } = req.body;

  // 1. 기존 응답 삭제
  connection.query(
    'DELETE FROM responses WHERE id = ?',
    [response_id],
    (err) => {
      if (err) {
        console.error(err);
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ error: 'Failed to delete previous responses' });
      }

      // 2. 수정된 answers 데이터를 responses 테이블에 다시 삽입
      for (const answer of answers) {
        const { question_id, option_id, answer_text } = answer;

        connection.query(
          'INSERT INTO responses (survey_id, user_id, question_id, option_id, answer_text) VALUES (?, ?, ?, ?, ?)',
          [
            survey_id,
            response_id,
            question_id,
            option_id || null,
            answer_text || null,
          ],
          (err) => {
            if (err) {
              console.error(err);
              return res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .json({ error: 'Failed to update responses' });
            }
          },
        );
      }

      res
        .status(StatusCodes.OK)
        .json({ message: 'Response updated successfully' });
    },
  );
};

// 응답 삭제하기 (DELETE /surveys/:survey_id/responses/:response_id)
export const deleteResponse = (req, res) => {
  const { response_id } = req.params;

  connection.query(
    'DELETE FROM responses WHERE id = ?',
    [response_id],
    (err) => {
      if (err) {
        console.error(err);
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ error: 'Failed to delete response' });
      }

      res.status(StatusCodes.NO_CONTENT).send();
    },
  );
};
