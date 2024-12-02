import pool from '../mariadb.js';
import { StatusCodes } from 'http-status-codes';

export const showMostChoiced = async (req, res) => {
  const { survey_id } = req.params;
  let { mbti } = req.query;
  try {
    mbti = mbti === 'true';

    let mostChoicedNames = [];

    const [surveyTitle] = await pool.execute(
      `SELECT title FROM surveys WHERE id = ?`,
      [survey_id],
    );

    const [totalVoteCount] = await pool.execute(
      `SELECT count(*) FROM responses WHERE survey_id = ?`,
      [survey_id],
    );

    const [mostChoiced] = await pool.execute(
      `WITH OptionCounts AS (
    SELECT option_id, COUNT(*) AS count
    FROM answer_choices
    WHERE response_id IN (SELECT id FROM responses WHERE survey_id = ?)
    GROUP BY option_id) SELECT option_id, count
    FROM OptionCounts WHERE count = (SELECT MAX(count) FROM OptionCounts);`,
      [survey_id],
    );

    for (let answer of mostChoiced) {
      let [result] = await pool.execute(
        'SELECT option_text FROM question_options WHERE id = ?',
        [answer.option_id],
      );
      mostChoicedNames.push(result[0].option_text);
    }

    let result = {
      title: surveyTitle[0].title,
      totalVoteCount: totalVoteCount[0]['count(*)'],
      mostChoiced: mostChoicedNames,
      voteCount: mostChoiced[0].count,
    };

    if (mbti) {
      let mbtiResults = [];
      for (let answer of mostChoiced) {
        const [optionTextResult] = await pool.execute(
          `SELECT option_text FROM question_options WHERE id = ?`,
          [answer.option_id],
        );
        const optionText = optionTextResult[0].option_text;

        const [mbtiData] = await pool.execute(
          `SELECT u.mbti, COUNT(*) as count FROM users u
          JOIN responses r ON u.id = r.user_id 
          JOIN answer_choices ac ON r.id = ac.response_id 
          WHERE ac.option_id = ? GROUP BY u.mbti ORDER BY count DESC;`,
          [answer.option_id],
        );

        mbtiResults.push({
          option_text: optionText,
          mbtiStatistics: mbtiData.map((data) => ({
            mbti: data.mbti,
            count: data.count,
          })),
        });
      }
      result['mbtiResults'] = mbtiResults;
    }
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: 'Failed to show most choiced',
    });
  }
};

export const showResult = async (req, res) => {
  const { survey_id } = req.params;

  console.log(survey_id);
  try {
    const sql = `SELECT option_id, COUNT(*) AS count FROM answer_choices
             WHERE question_id = ? GROUP BY option_id; `;
    const [optionsCount] = await pool.execute(sql, [survey_id]);

    const result = [];
    for (let option of optionsCount) {
      const [text] = await pool.execute(
        `SELECT option_text FROM question_options WHERE id = ?`,
        [option.option_id],
      );
      result.push({ [text[0].option_text]: option.count });
    }

    result.sort((a, b) => {
      const val1 = Object.values(a)[0];
      const val2 = Object.values(b)[0];
      return val2 - val1;
    });
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: 'Failed to show result',
    });
  }
};
