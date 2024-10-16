const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const responseRoutes = require('./routes/responses');
const surveyRoutes = require('./routes/surveys'); // 설문조사 API 라우트 추가

app.use(bodyParser.json());

// 기본 경로 테스트
app.get('/', (req, res) => {
    res.send('Survey System API is running');
});

// Survey 관련 API 라우트 등록
app.use('/surveys', surveyRoutes); // 설문조사 API

// Response 관련 API 라우트 등록
app.use('/surveys/:survey_id/responses', responseRoutes); // polls를 surveys로 변경

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});