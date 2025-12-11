import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// 创建数据库连接池
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Root123456', // 替换为你的MySQL密码
  database: process.env.DB_NAME || 'login',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 测试连接
pool.getConnection()
  .then(conn => {
    console.log('数据库连接成功');
    conn.release();
  })
  .catch(err => {
    console.error('数据库连接失败：', err);
  });

export default pool;