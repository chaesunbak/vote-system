import pool from '../mariadb.js';
import { StatusCodes } from 'http-status-codes';
import { randomBytes, pbkdf2Sync } from 'crypto';
import getChoseong from '../utils/getChoseong.js';
import jwt from 'jsonwebtoken'; // CJS module;

export async function searchUsers(req, res) {
  const { searchQuery } = req.query; // TODO : 유효성 검사 시 특수문자 못받게 해야함

  try {
    const [rows, fields] = await pool.execute(
      `SELECT id, username, mbti FROM users
       WHERE username LIKE ? OR mbti LIKE ? OR choseong LIKE ?
       LIMIT 10`,
      [`${searchQuery}%`, `${searchQuery}%`, `${searchQuery}%`],
    );

    if (rows.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        status: StatusCodes.NOT_FOUND,
        message: 'No users found',
      });
    }

    return res.status(StatusCodes.OK).send(rows);
  } catch (error) {
    console.log(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: 'Failed to search users',
    });
  }
}

export async function createUser(req, res) {
  const { userName, email, password, promotionEmailConsent, mbti } = req.body;

  const passwordSalt = randomBytes(10).toString('base64');
  const passwordHash = pbkdf2Sync(
    password,
    passwordSalt,
    100000,
    10,
    'sha512',
  ).toString('base64');

  const choseong = getChoseong(userName);

  try {
    await pool.execute(
      `INSERT INTO users (username, email, password_hash, password_salt, choseong, promotion_email_consent, mbti)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userName,
        email,
        passwordHash,
        passwordSalt,
        choseong,
        promotionEmailConsent,
        mbti,
      ],
    );

    if (rows.affectedRows === 0) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'Failed to create user',
      });
    }
    return res.status(StatusCodes.CREATED).end();
  } catch (error) {
    console.log(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: 'Failed to create user',
    });
  }
}

// 유저 정보가져오는 함수
export async function getUser(req, res) {
  const { userId } = req.params;

  try {
    const [rows, fields] = await pool.execute(
      `SELECT id, username, mbti FROM users WHERE id = ?`,
      [userId],
    );

    if (rows.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        status: StatusCodes.NOT_FOUND,
        message: 'User not found',
      });
    }

    return res.status(StatusCodes.OK).send(rows[0]);
  } catch (error) {
    console.log(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: 'Failed to get user',
    });
  }
}

// 사용자 프로필 조회 함수
// TODO : 사용자가 생성한 surveys, responses 등도 함께 조회할 수 있게 하면 좋을듯 (담당 DB구조 확인 후 수정)
export async function getMyProfile(req, res) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      status: StatusCodes.UNAUTHORIZED,
      message: 'Unauthorized',
    });
  }

  const JWT_SECRET = process.env.JWT_SECRET;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const [rows, fields] = await pool.execute(
      `SELECT id, username, email, email_verified, promotion_email_consent, mbti FROM users WHERE id = ?`,
      [decoded.id],
    );

    if (rows.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        status: StatusCodes.NOT_FOUND,
        message: 'User not found',
      });
    }

    return res.status(StatusCodes.OK).send(rows[0]);
  } catch (error) {
    console.log(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: 'Failed to get user',
    });
  }
}

// 사용자 프로필 수정 함수
// TODO : 최소한으로 수정할 수 있게 하기
// TODO : 회원가입시 이메일인증 기능을 추가하려고 하는데 email 수정기능은 없애야 할 듯
export async function updateMyProfile(req, res) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      status: StatusCodes.UNAUTHORIZED,
      message: 'Unauthorized',
    });
  }

  const JWT_SECRET = process.env.JWT_SECRET;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { userName, promotionEmailConsent, mbti } = req.body;

    let sql = `UPDATE users SET`;
    const values = [];

    if (userName) {
      const choseong = getChoseong(userName);
      sql += ` username = ?, choseong = ?,`;
      values.push(userName, choseong);
    }

    if (promotionEmailConsent) {
      sql += ` promotion_email_consent = ?,`;
      values.push(promotionEmailConsent);
    }

    if (mbti) {
      sql += ` mbti = ?,`;
      values.push(mbti);
    }

    // 마지막 쉼표 제거
    sql = sql.slice(0, -1);

    sql += ` WHERE id = ?;`;
    values.push(decoded.id);

    await pool.execute(sql, values);

    if (rows.affectedRows === 0) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'Failed to update user',
      });
    }

    return res.status(StatusCodes.OK).end();
  } catch (error) {
    console.log(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: 'Failed to update user',
    });
  }
}

// 사용자 탈퇴 함수
export async function deleteMyAccount(req, res) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      status: StatusCodes.UNAUTHORIZED,
      message: 'Unauthorized',
    });
  }

  const JWT_SECRET = process.env.JWT_SECRET;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    await pool.execute(`DELETE FROM users WHERE id = ?`, [decoded.id]);

    if (rows.affectedRows === 0) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'Failed to delete user',
      });
    }

    return res.status(StatusCodes.NO_CONTENT).end();
  } catch (error) {
    console.log(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: 'Failed to delete user',
    });
  }
}

// 비밀번호 변경 함수
export async function changeMyPassword(req, res) {
  const { newPassword } = req.body;
  const token = req.cookies.token;

  if (!token) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      status: StatusCodes.UNAUTHORIZED,
      message: 'Unauthorized',
    });
  }

  const JWT_SECRET = process.env.JWT_SECRET;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const passwordSalt = randomBytes(10).toString('base64');
    const passwordHash = pbkdf2Sync(
      newPassword,
      passwordSalt,
      100000,
      10,
      'sha512',
    ).toString('base64');

    await pool.execute(
      `UPDATE users SET password_hash = ?, password_salt = ? WHERE id = ?`,
      [passwordHash, passwordSalt, decoded.id],
    );

    if (rows.affectedRows === 0) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'Failed to change password',
      });
    }

    return res.status(StatusCodes.OK).end();
  } catch (error) {
    console.log(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: 'Failed to change password',
    });
  }
}

// 로그인 함수
// TODO 클라이언트에서 암호화해서 보내야하는지?
export async function login(req, res) {
  const { email, password } = req.body;

  try {
    const [rows, fields] = await pool.execute(
      `SELECT * FROM users WHERE email = ?`,
      [email],
    );

    if (rows.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        status: StatusCodes.NOT_FOUND,
        message: 'User not found',
      });
    }

    const user = rows[0];
    const passwordHash = pbkdf2Sync(
      password,
      user.password_salt,
      100000,
      10,
      'sha512',
    ).toString('base64');

    if (passwordHash !== user.password_hash) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        status: StatusCodes.NOT_FOUND,
        message: 'User not found',
      }); // 보안상의 이유로 UNAUTHORIZED대신 NOT_FOUND를 응답해도 됨
    }

    const JWT_SECRET = process.env.JWT_SECRET;

    // JWT 토큰 생성
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        mbti: user.mbti,
      }, // TODO : 토큰에 최소한의 정보만 담기
      JWT_SECRET,
      { expiresIn: '24h' }, // 토큰 만료 시간 설정 (24시간)
    );

    // 민감한 정보 제외하고 응답
    const { password_hash, password_salt, verification_token, ...safeUser } =
      user;

    // JWT 토큰을 쿠키에 설정
    res.cookie('token', token, {
      httpOnly: true, // 클라이언트에서 쿠키에 접근하지 못하도록 설정
      maxAge: 3600000 * 24, // 쿠키 만료 시간 설정 (24시간)
    });

    return res.status(StatusCodes.OK).json({ user: safeUser });
  } catch (error) {
    console.log(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: 'Failed to login',
    });
  }
}

// 로그아웃 함수
export async function logout(req, res) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(StatusCodes.OK).json({
      success: false,
      status: StatusCodes.OK,
      message: 'Already logged out',
    });
  }

  res.clearCookie('token');
  return res.status(StatusCodes.OK).end();
}

// 이메일 중복 여부 확인 함수
export async function checkEmailExists(req, res) {
  const { email } = req.query;

  try {
    const [rows, fields] = await pool.execute(
      `SELECT id FROM users WHERE email = ?`,
      [email],
    );

    if (rows.length > 0) {
      return res
        .status(StatusCodes.CONFLICT)
        .send({ message: '이미 사용 중인 이메일입니다.' });
    }

    return res
      .status(StatusCodes.OK)
      .send({ message: '사용 가능한 이메일입니다.' });
  } catch (error) {
    console.log(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: 'Failed to check email',
    });
  }
}
