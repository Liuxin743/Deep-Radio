// backend/login/routes/auth.js
import express from 'express';
import pool from '../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// 生成 Token 函数（不变）
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

// 1. 登录接口：返回 avatar 字段
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

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

    // 返回用户信息时，添加 avatar 字段
    res.json({
      token,
      user: {
        id: targetUser.id,
        username: targetUser.username,
        email: targetUser.email,
        role: targetUser.role,
        avatar: targetUser.avatar || null // 新增：返回头像URL，无则返回 null
      }
    });
  } catch (err) {
    res.status(500).json({ message: '登录失败', error: err.message });
  }
});

// 2. 获取当前用户信息接口（新增，供前端刷新用户状态）
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: '未登录' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 查询用户信息，包含 avatar 字段
    const [user] = await pool.query(
      'SELECT id, username, email, role, avatar FROM users WHERE id = ?',
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
      avatar: user[0].avatar || null
    });
  } catch (err) {
    res.status(500).json({ message: '获取用户信息失败', error: err.message });
  }
});

export default router;