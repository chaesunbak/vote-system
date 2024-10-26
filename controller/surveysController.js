import pool from '../mariadb.js';
import { StatusCodes } from 'http-status-codes';

export const createSurvey = async (req, res) => {
  const { title, description, expires_at, questions } = req.body;

  try {
    const [rows, fields] = await pool.execute(
      `INSERT INTO surveys (title, description, expires_at) VALUES (?, ?, ?);`,
      [title, description, new Date(expires_at)], // expires_at은 문자열로 받아와 Date 객체로 변환
    );

    const surveyId = rows.insertId;

    const questions_sql = `INSERT INTO questions (survey_id, question_text, question_type, order_num, required)
                           VALUES ( ? , ?, ?, ?, ?);`;

    for (const question of questions) {
      const { question_text, question_type, order_num, required, options } =
        question;

      const [questions_results] = await pool.execute(questions_sql, [
        surveyId,
        question_text,
        question_type,
        order_num,
        required,
      ]);

      const question_id = questions_results.insertId;

      const question_options_sql = `INSERT INTO question_options (question_id, option_text, order_num)
                                  VALUES ( ? , ?, ?);`;

      for (const option of options) {
        const { option_text, order_num } = option;
        await pool.execute(question_options_sql, [
          question_id,
          option_text,
          order_num,
        ]);
      }
    }

    return res.status(StatusCodes.CREATED).end();
  } catch (error) {
    console.log(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).end();
  }
};

// 설문조사 목록 조회하기 (GET /surveys)
export const getSurveys = (req, res) => {
  connection.query('SELECT * FROM surveys', (err, results) => {
    if (err) {
      console.error(err);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: 'Failed to retrieve surveys' });
    }

    res.status(StatusCodes.OK).json(results);
  });
};

// 개별 설문조사 조회하기 (GET /surveys/:survey_id)
export const getSurveyById = (req, res) => {
  const { survey_id } = req.params;

  connection.query(
    'SELECT * FROM surveys WHERE id = ?',
    [survey_id],
    (err, results) => {
      if (err) {
        console.error(err);
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ error: 'Failed to retrieve survey' });
      }

      if (results.length === 0) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: 'Survey not found' });
      }

      res.status(StatusCodes.OK).json(results[0]);
    },
  );
};

// 설문조사 수정하기 (PUT /surveys/:survey_id)
export const updateSurvey = (req, res) => {
  const { survey_id } = req.params;
  const { title, description, expires_at } = req.body;

  connection.query(
    'UPDATE surveys SET title = ?, description = ?, expires_at = ? WHERE id = ?',
    [title, description, expires_at, survey_id],
    (err) => {
      if (err) {
        console.error(err);
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ error: 'Failed to update survey' });
      }

      res
        .status(StatusCodes.OK)
        .json({ message: 'Survey updated successfully' });
    },
  );
};

// 설문조사 삭제하기 (DELETE /surveys/:survey_id)
export const deleteSurvey = (req, res) => {
  const { survey_id } = req.params;

  connection.query('DELETE FROM surveys WHERE id = ?', [survey_id], (err) => {
    if (err) {
      console.error(err);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: 'Failed to delete survey' });
    }

    res.status(StatusCodes.NO_CONTENT).send();
  });
};
