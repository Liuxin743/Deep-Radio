import express from 'express';
import pool from '../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// 生成 Token 函数
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
};

// 1. 注册接口
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 校验参数
    if (!username || !email || !password) {
      return res.status(400).json({ message: '用户名、邮箱、密码不能为空' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: '密码长度至少6位' });
    }

    // 检查用户名/邮箱是否已存在
    const [existingUser] = await pool.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    if (existingUser.length > 0) {
      return res.status(409).json({ message: '用户名或邮箱已被注册' });
    }

    // 加密密码
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 插入新用户
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password, role, avatar, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [username, email, hashedPassword, 'user', null]
    );

    res.status(201).json({
      message: '注册成功',
      userId: result.insertId
    });
  } catch (err) {
    res.status(500).json({ message: '注册失败', error: err.message });
  }
});

// 2. 登录接口
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // admin免密码登录
    if (username === 'admin') {
      let [adminUser] = await pool.query('SELECT * FROM users WHERE username = ?', ['admin']);
      
      // 不存在则自动创建admin
      if (adminUser.length === 0) {
        const salt = await bcrypt.genSalt(10);
        const hashedPwd = await bcrypt.hash('admin123', salt);
        await pool.query(
          'INSERT INTO users (username, email, password, role, status, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
          ['admin', 'admin@example.com', hashedPwd, 'admin', 'active']
        );
        [adminUser] = await pool.query('SELECT * FROM users WHERE username = ?', ['admin']);
      }

      const token = generateToken(adminUser[0].id);
      return res.json({
        token,
        user: {
          id: adminUser[0].id,
          username: adminUser[0].username,
          email: adminUser[0].email,
          role: adminUser[0].role,
          avatar: adminUser[0].avatar || null
        }
      });
    }

    // 普通用户登录
    const [user] = await pool.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, username]
    );
    if (user.length === 0) {
      return res.status(401).json({ message: '用户名/邮箱或密码错误' });
    }
    const targetUser = user[0];

    const isPasswordValid = await bcrypt.compare(password, targetUser.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: '用户名/邮箱或密码错误' });
    }

    const token = generateToken(targetUser.id);
    res.json({
      token,
      user: {
        id: targetUser.id,
        username: targetUser.username,
        email: targetUser.email,
        role: targetUser.role,
        avatar: targetUser.avatar || null
      }
    });
  } catch (err) {
    res.status(500).json({ message: '登录失败', error: err.message });
  }
});

// 3. 获取当前用户信息接口
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: '未登录' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    const [user] = await pool.query(
      'SELECT id, username, email, role, avatar, created_at FROM users WHERE id = ?',
      [decoded.id]
    );
    
    if (user.length === 0) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    res.json({
      id: user[0].id,
      username: user[0].username,
      email: user[0].email,
      role: user[0].role,
      avatar: user[0].avatar || null,
      created_at: user[0].created_at
    });
  } catch (err) {
    res.status(500).json({ message: '获取用户信息失败', error: err.message });
  }
});

// 4. 退出登录接口
router.post('/logout', (req, res) => {
  res.json({ message: '退出成功' });
});

export default router;