const { StatusCodes } = require('http-status-codes');
const connection = require('../mariadb');

// 설문조사 생성하기 (POST /surveys)
const createSurvey = (req, res) => {
  const { title, description, expires_at } = req.body;

  connection.query(
    'INSERT INTO surveys (title, description, expires_at) VALUES (?, ?, ?)',
    [title, description, expires_at],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to create survey' });
      }

      res.status(StatusCodes.CREATED).json({ message: 'Survey created successfully', surveyId: results.insertId });
    }
  );
};

// 설문조사 목록 조회하기 (GET /surveys)
const getSurveys = (req, res) => {
  connection.query('SELECT * FROM surveys', (err, results) => {
    if (err) {
      console.error(err);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to retrieve surveys' });
    }

    res.status(StatusCodes.OK).json(results);
  });
};

// 개별 설문조사 조회하기 (GET /surveys/:survey_id)
const getSurveyById = (req, res) => {
  const { survey_id } = req.params;

  connection.query('SELECT * FROM surveys WHERE id = ?', [survey_id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to retrieve survey' });
    }

    if (results.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Survey not found' });
    }

    res.status(StatusCodes.OK).json(results[0]);
  });
};

// 설문조사 수정하기 (PUT /surveys/:survey_id)
const updateSurvey = (req, res) => {
  const { survey_id } = req.params;
  const { title, description, expires_at } = req.body;

  connection.query(
    'UPDATE surveys SET title = ?, description = ?, expires_at = ? WHERE id = ?',
    [title, description, expires_at, survey_id],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to update survey' });
      }

      res.status(StatusCodes.OK).json({ message: 'Survey updated successfully' });
    }
  );
};

// 설문조사 삭제하기 (DELETE /surveys/:survey_id)
const deleteSurvey = (req, res) => {
  const { survey_id } = req.params;

  connection.query('DELETE FROM surveys WHERE id = ?', [survey_id], (err) => {
    if (err) {
      console.error(err);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to delete survey' });
    }

    res.status(StatusCodes.NO_CONTENT).send();
  });
};

module.exports = {
  createSurvey,
  getSurveys,
  getSurveyById,
  updateSurvey,
  deleteSurvey,
};