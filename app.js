const express = require("express");
const app = express();

const dotenv = require("dotenv");
dotenv.config();

// 포트번호를 환경변수로 설정해주세요.
const PORT_NUMBER = process.env.PORT_NUMBER;

app.listen(PORT_NUMBER, () => {
  console.log(`Server is running on port ${PORT_NUMBER}`);
});
