import { StatusCodes } from 'http-status-codes';
import pool from '../mariadb.js';

export const addQuestion = async (req, res) => {
  const { question_text, question_type, order_num, required, options } =
    req.body;
  const surveyId = req.params.id;

  // questions 테이블 삽입
  let questions_sql = `INSERT INTO questions (survey_id, question_text, question_type, order_num, required) VALUES (?, ?, ?, ?, ?);`;
  let questions_values = [
    surveyId,
    question_text,
    question_type,
    order_num,
    required,
  ];
  let [questions_results] = await pool.execute(questions_sql, questions_values);
  let question_id = questions_results.insertId;

  // question_options 테이블 삽입
  let question_options_sql = `INSERT INTO question_options (question_id, option_text, question_num) VALUES ?;`;

  // items는 배열로 받아오기 때문에 요소들을 하나씩 꺼냄
  let question_options_values = options.map((options) => [
    question_id,
    options.option_text,
    options.question_num,
  ]);

  // 오류가 발생할 수 있으므로 query로 계속 진행
  let [question_options_results] = await pool.query(question_options_sql, [
    question_options_values,
  ]);

  return res.status(StatusCodes.OK).json(question_options_results);
};

export const allQuestion = async (req, res) => {
  let { id } = req.params;
  let sql = `SELECT question_id, question_text, question_type , option_text 
                FROM questions LEFT JOIN question_options
                ON questions.id = question_options.question_id
                WHERE question_id = ?;`;

  try {
    const [rows, fields] = await pool.execute(sql, id);

    if (rows.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).end();
    }
    return res.status(StatusCodes.OK).json(rows);
  } catch (error) {
    console.log(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).end();
  }
};

export const editQuestion = async (req, res) => {
  let { question_text, question_type } = req.body;
  let { id } = req.params;

  // 질문 수정
  const sql = `UPDATE questions
     SET question_text = ?,
     question_type = ?
     WHERE id = ?;`; // 여기서 id는 question_id
  const values = [question_text, question_type, id];

  try {
    const [rows, fields] = await pool.execute(sql, values);

    if (rows.affectedRows === 0) {
      return res.status(StatusCodes.NOT_FOUND).end();
    }

    return res.status(StatusCodes.OK).end();
  } catch (error) {
    console.log(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).end();
  }
};

export const editOptions = async (req, res) => {
  let { option_text } = req.body;
  let { question_id, option_id } = req.params;
  let sql;
  let values = [];

  if (editOptions) {
    // 옵션 수정
    sql = `UPDATE question_options
        SET option_text = ?
        WHERE question_id = ? AND question_num = ?`;
    values = [option_text, question_id, option_id];
  }

  try {
    const [rows, fields] = await pool.execute(sql, values);

    if (rows.affectedRows === 0) {
      return res.status(StatusCodes.NOT_FOUND).end();
    }

    return res.status(StatusCodes.OK).end();
  } catch (error) {
    console.log(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).end();
  }
};

export const deleteQuestion = async (req, res) => {
  const { question_id } = req.params;

  const question_sql = `DELETE FROM questions WHERE id = ?;`;

  try {
    const [rows, fields] = await pool.execute(question_sql, question_id);

    if (rows.affectedRows === 0) {
      return res.status(StatusCodes.NOT_FOUND).end();
    }

    return res.status(StatusCodes.OK).end();
  } catch (error) {
    console.log(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).end();
  }
};

export const deleteOptions = async (req, res) => {
  let { option_id } = req.params;

  const option_sql = `DELETE FROM question_options WHERE question_num = ?;`;

  try {
    const [rows, fields] = await pool.execute(option_sql, option_id);

    if (rows.affectedRows === 0) {
      return res.status(StatusCodes.NOT_FOUND).end();
    }

    return res.status(StatusCodes.OK).end();
  } catch (error) {
    console.log(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).end();
  }
};
