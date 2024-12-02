import pool from '../mariadb.js';
import { StatusCodes } from 'http-status-codes';

// 설문에 응답하기 (POST /surveys/:survey_id/responses)
export const createResponse = async (req, res) => {
  const surveyId = req.params.survey_id;
  const { user_id, answers } = req.body; // answers는 [{ question_id, option_id, answer_text }, ...] 형태로 전달

  try {
    // responses 테이블에 기본 응답 정보 삽입
    const [responseResult] = await pool.execute(
      'INSERT INTO responses (survey_id, user_id) VALUES (?, ?)',
      [surveyId, user_id],
    );

    const responseId = responseResult.insertId;

    // response_details 테이블에 각 질문에 대한 상세 응답 삽입
    for (const answer of answers) {
      const { question_id, option_id, answer_text } = answer;

      const [rows, fields] = await pool.execute(
        'INSERT INTO answer_choices (response_id, question_id, option_id, answer_text) VALUES (?, ?, ?, ?)',
        [responseId, question_id, option_id || null, answer_text || null],
      );

      if (rows.affectedRows === 0) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          success: false,
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          message: 'Failed to submit response details',
        });
      }
    }

    return res
      .status(StatusCodes.CREATED)
      .json({ message: 'Response submitted successfully' });
  } catch (error) {
    console.error('Error submitting response:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: 'Failed to submit response',
    });
  }
};

// 응답 수정하기 (PUT /surveys/:survey_id/responses/:response_id)
export const editResponse = async (req, res) => {
  const { survey_id, response_id } = req.params;
  const { answers } = req.body;

  try {
    // 1. 기존 응답 삭제
    const [rows, fields] = await pool.execute(
      'DELETE FROM responses WHERE id = ?',
      [response_id],
    );
    if (rows.affectedRows === 0) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'Failed to update responses',
      });
    }

    // 2. 수정된 answers 데이터를 responses 테이블에 다시 삽입

    for (const answer of answers) {
      const { question_id, option_id, answer_text } = answer;

      const [rows, fields] = await pool.execute(
        'INSERT INTO responses (survey_id, user_id, question_id, option_id, answer_text) VALUES (?, ?, ?, ?, ?)',
        [
          survey_id,
          response_id,
          question_id,
          option_id || null,
          answer_text || null,
        ],
      );

      if (rows.affectedRows === 0) {
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ error: 'Failed to update responses' });
      }
    }

    return res
      .status(StatusCodes.OK)
      .json({ message: 'Response updated successfully' });
  } catch (error) {
    console.log(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      error: 'Failed to update',
    });
  }
};

// 응답 삭제하기 (DELETE /surveys/:survey_id/responses/:response_id)
export const deleteResponse = async (req, res) => {
  const { survey_id, response_id } = req.params;

  try {
    const [rows, fields] = await pool.execute(
      'DELETE FROM responses WHERE id = ?',
      [response_id],
    );

    if (rows.affectedRows === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        status: StatusCodes.NOT_FOUND,
        message: 'Response not found',
      });
    }

    return res.status(StatusCodes.OK).json({
      message: 'Response deleted successfully',
    });
  } catch (error) {
    console.log(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: 'Failed to delete response',
    });
  }
};
