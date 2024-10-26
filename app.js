import express from 'express';
import './loadEnv.js';
import cookieParser from 'cookie-parser';
import userRouter from './routes/users.js';
import mbtiRouter from './routes/mbti.js';
import surveyRouter from './routes/surveys.js';
import questionRouter from './routes/questions.js';
import responseRouter from './routes/responses.js';
import statRouter from './routes/stats.js';

const app = express();

// 미들웨어 설정
app.use(express.json());
app.use(cookieParser()); // 쿠키 파서 미들웨어 추가

// 포트번호를 환경변수로 설정해주세요.
const PORT_NUMBER = process.env.PORT_NUMBER || 7777;

app.use('/users', userRouter);
app.use('/mbti', mbtiRouter);
app.use('/surveys', surveyRouter);
app.use('/surveys/:survey_id/questions', questionRouter);
app.use('/surveys/:survey_id/responses', responseRouter);
app.use('/surveys/:survey_id/stats', statRouter);

app.listen(PORT_NUMBER, () => {
  console.log(`Server is running on port ${PORT_NUMBER}`);
});
