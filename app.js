import express from 'express';
import dotenv from 'dotenv';
import userRouter from './routes/users.js';

dotenv.config();

const app = express();

// 포트번호를 환경변수로 설정해주세요.
const PORT_NUMBER = process.env.PORT_NUMBER;

app.use('/users', userRouter);

app.listen(PORT_NUMBER, () => {
  console.log(`Server is running on port ${PORT_NUMBER}`);
});
