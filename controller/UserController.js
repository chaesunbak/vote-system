import pool from '../mariadb.js';
import { StatusCodes } from 'http-status-codes';

export async function getAllUsers(req, res) {
  try {
    const [rows, fields] = await pool.execute('SELECT * FROM users'); // conn는 그냥 쓰면 되는데 pool은 await pool임, query 대신 execute로 변경

    if (rows.length === 0) {
      return response.status(StatusCodes.NOT_FOUND).send('No users found');
    }
    res.status(StatusCodes.OK).send(rows);
  } catch (err) {
    console.log(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Internal Server Error');
  }
}
