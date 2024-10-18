import pool from '../mariadb.js';
import { StatusCodes } from 'http-status-codes';

export const createMbti = async (req, res) => {
  try {
    const { mbti_data } = req.body;
    return await getMbti(mbti_data);
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to create MBTI',
      error: err,
    });
  }
};

// 사용자가 설문에 응답할 시 설문에 AI로 설정된 데이터 값을 통해 사용자의 MBTI 비율을 수치로 변동
export const updateMbti = async (req, res) => {
  const { userId, question_mbti_data } = req.body;

  let query = `UPDATE users 
                 SET mbti = JSON_SET(
                    mbti,
                    '$.extrovert', JSON_EXTRACT(mbti, '$.extrovert') + ?,
                    '$.sensing', JSON_EXTRACT(mbti, '$.sensing') + ?,
                    '$.thinking', JSON_EXTRACT(mbti, '$.thinking') + ?,
                    '$.judging', JSON_EXTRACT(mbti, '$.judging') + ?
                 )
                 WHERE userId = ?`;

  let values = [
    question_mbti_data.extrovert,
    question_mbti_data.sensing,
    question_mbti_data.thinking,
    question_mbti_data.judging,
    userId,
  ];

  try {
    const [result] = await pool.execute(query, values);
    if (result.affectedRows > 0) {
      res.status(StatusCodes.OK).json({
        message: 'MBTI updated successfully',
      });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to update MBTI',
      });
    }
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to update MBTI',
      error: err,
    });
  }
};

// MBTI에 있는 JSON 데이터 출력
const getbtiData = async (req, res) => {
  const { userId } = req.params;
  let query = `SELECT mbti FROM users WHERE user_id = ?`;

  try {
    const [rows] = await pool.execute(query, [userId]);
    if (rows.length > 0) {
      res.status(StatusCodes.OK).json(rows[0].mbti);
    } else {
      res.status(StatusCodes.NOT_FOUND).json({
        message: 'MBTI not found',
      });
    }
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to retrieve MBTI data',
      error: err,
    });
  }
};

// 사용자의 4자리 MBTI 텍스트 출력
export const getMbtiext = async (req, res) => {
  const { userId } = req.params;
  let MBTI = '';
  let query = `SELECT mbti FROM users WHERE user_id = ?`;

  try {
    const [rows] = await pool.execute(query, [userId]);
    if (rows.length > 0) {
      const mbtiData = rows[0].mbti;
      mbtiData.extrovert >= 50 ? (MBTI += 'E') : (MBTI += 'I');
      mbtiData.sensing >= 50 ? (MBTI += 'S') : (MBTI += 'N');
      mbtiData.thinking >= 50 ? (MBTI += 'T') : (MBTI += 'F');
      mbtiData.judging >= 50 ? (MBTI += 'J') : (MBTI += 'P');

      res.status(StatusCodes.OK).json({ MBTI });
    } else {
      res.status(StatusCodes.NOT_FOUND).json({
        message: 'MBTI not found',
      });
    }
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to retrieve MBTI data',
      error: err,
    });
  }
};

export async function getMbti(mbti_data) {
  let query = `UPDATE users 
                 SET mbti_detail = JSON_OBJECT(
                    'extrovert', ?, 
                    'sensing', ?, 
                    'thinking', ?, 
                    'judging', ?
                 ) 
                 WHERE userId = ?`;

  let values = [
    mbti_data.extrovert,
    mbti_data.sensing,
    mbti_data.thinking,
    mbti_data.judging,
    mbti_data.userId, // userId는 mbti_data에서 가져옴
  ];

  try {
    const [result] = await pool.execute(query, values);
    if (result.affectedRows > 0) {
      return { message: 'MBTI updated successfully' };
    } else {
      return { message: 'Failed to update MBTI' };
    }
  } catch (err) {
    throw new Error('Failed to update MBTI');
  }
}
