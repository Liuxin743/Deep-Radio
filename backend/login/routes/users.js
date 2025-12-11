import express from 'express';
import pool from '../db.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// 临时放行（后续加权限）
router.use((req, res, next) => {
  next();
});

// 获取所有用户
router.get('/', async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, username, email, role, status, created_at, avatar FROM users'
    );
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: '获取用户列表失败', error: err.message });
  }
});

// 添加用户
router.post('/', async (req, res) => {
  try {
    const { username, email, password, role = 'user' } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: '用户名、邮箱、密码不能为空' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      'INSERT INTO users (username, email, password, role, status, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [username, email, hashedPassword, role, 'active']
    );

    res.status(201).json({ message: '添加用户成功', userId: result.insertId });
  } catch (err) {
    res.status(500).json({ message: '添加用户失败', error: err.message });
  }
});

// 编辑用户
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role, password } = req.body;

    // 构建更新数据
    const updateData = [];
    const sqlParams = [];
    if (username) {
      updateData.push('username = ?');
      sqlParams.push(username);
    }
    if (email) {
      updateData.push('email = ?');
      sqlParams.push(email);
    }
    if (role) {
      updateData.push('role = ?');
      sqlParams.push(role);
    }
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPwd = await bcrypt.hash(password, salt);
      updateData.push('password = ?');
      sqlParams.push(hashedPwd);
    }

    if (updateData.length === 0) {
      return res.status(400).json({ message: '无更新数据' });
    }

    sqlParams.push(id);
    await pool.query(`UPDATE users SET ${updateData.join(', ')} WHERE id = ?`, sqlParams);
    res.json({ message: '用户更新成功' });
  } catch (err) {
    res.status(500).json({ message: '编辑用户失败', error: err.message });
  }
});

// 切换用户状态
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await pool.query('UPDATE users SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: '用户状态更新成功' });
  } catch (err) {
    res.status(500).json({ message: '更新状态失败', error: err.message });
  }
});

// 删除用户
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: '删除用户成功' });
  } catch (err) {
    res.status(500).json({ message: '删除用户失败', error: err.message });
  }
});

export default router;