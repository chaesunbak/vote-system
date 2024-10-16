import express from 'express';
const app = express();

import 'dotenv/config';
import statRouter from './routes/stats.js';
// 포트번호를 환경변수로 설정해주세요.
const PORT_NUMBER = process.env.PORT_NUMBER;

app.use('/stats', statRouter);

app.listen(PORT_NUMBER, () => {
  console.log(`Server is running on port ${PORT_NUMBER}`);
});
