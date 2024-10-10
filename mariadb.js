// createConnection
// 장점: 단일 연결을 사용하므로 간단한 애플리케이션에 적합합니다.
// 단점: 여러 요청이 동시에 들어올 경우 성능이 저하될 수 있습니다. 연결이 끊어지면 수동으로 다시 연결해야 합니다.
// createPool
// 장점: 연결 풀을 사용하여 여러 연결을 관리하므로, 동시에 여러 요청을 처리할 수 있습니다. 연결이 끊어지면 자동으로 다시 연결됩니다.
// 단점: 설정이 약간 더 복잡할 수 있습니다.

// Get the client
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Create the connection to database
// const connection = await mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "root",
//   database: Process.env.DB_NAME,
//   dateStrings: true,
// });

// 설정 예시
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: process.env.DB_NAME,
  waitForConnections: true, // 커넥션 풀이 가득 찼을 때 대기
  connectionLimit: 10, // 최대 커넥션 수
  queueLimit: 0, // 대기 큐 제한 없음
  maxIdle: 10, // 유휴 커넥션 최대 수
  idleTimeout: 60000, // 유휴 커넥션 타임아웃 (60초) (디폴트)
  enableKeepAlive: true, // 커넥션 유지
  keepAliveInitialDelay: 0, // keepalive 초기 딜레이
  dateStrings: true,
});

// 사용법 예시 코드

// import pool from './mariadb.js';

// export async function getData() {
//   try {
//     // For pool initialization, see above
//     const [rows, fields] = await pool.query('SELECT `field` FROM `table`');
//     // Connection is automatically released when query resolves
//   } catch (err) {
//     console.log(err);
//   }
// }

// https://sidorares.github.io/node-mysql2/docs

export default pool;
