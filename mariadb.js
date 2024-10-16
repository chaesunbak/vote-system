const mariadb = require('mysql2');

//db와 연결통로 생성
const connection = mariadb.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'voteSystem'
  // dateString 옵션은 제거했습니다.
});

module.exports = connection;