import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import pool from './db.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

// 解决 ES Module 中 __dirname 问题
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 跨域配置
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// 静态文件服务（允许前端访问上传的头像）
app.use('/uploads/avatars', express.static(path.join(__dirname, 'uploads/avatars')));

// 解析 JSON 请求体
app.use(express.json());

// 挂载 auth 路由
app.use('/api/auth', authRoutes);

// 配置 multer 上传
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads/avatars');
    import('fs').then(fs => {
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      cb(null, uploadDir);
    });
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.id}_${Date.now()}${ext}`);
  }
});
const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif'];
    allowedTypes.includes(file.mimetype) ? cb(null, true) : cb(new Error('仅支持图片格式'), false);
  }
});

// 头像上传接口（POST /api/auth/upload-avatar）
app.post(
  '/api/auth/upload-avatar',
  (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: '未登录' });
    }
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { id: decoded.id };
      next();
    } catch (err) {
      res.status(401).json({ message: 'Token 无效' });
    }
  },
  avatarUpload.single('avatar'),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: '请选择图片' });
      const avatarUrl = `http://localhost:${PORT}/uploads/avatars/${req.file.filename}`;
      
      // 更新数据库（确保 avatar 字段被修改）
      const [result] = await pool.query(
        'UPDATE users SET avatar = ? WHERE id = ?',
        [avatarUrl, req.user.id]
      );
      
      if (result.affectedRows > 0) {
        // 返回最新的 avatarUrl（前端可直接使用）
        res.json({ message: '上传成功', avatarUrl });
      } else {
        res.status(404).json({ message: '用户不存在' });
      }
    } catch (err) {
      res.status(500).json({ message: '上传失败', error: err.message });
    }
  }
);

// 启动服务
app.listen(PORT, () => {
  console.log(`后端运行在 http://localhost:${PORT}`);
});