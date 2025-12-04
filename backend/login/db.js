import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 测试连接
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('MySQL连接成功！');
    connection.release();
  } catch (err) {
    console.error('MySQL连接失败：', err);
  }
})();

export default pool; 