import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url'; // 解决ESModule __dirname缺失

// 导入变量名 和 使用的变量名保持一致
import authRouter from './routes/auth.js';
import usersRouter from './routes/users.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

// 补充：ESModule 中手动定义 __dirname（后续静态文件/路径需要）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 跨域配置
app.use(cors({
  origin: ['https://Liuxin743.github.io', 'http://localhost:5173'],
  credentials: true
}));

// 解析JSON和表单数据（补充：避免POST请求参数解析失败）
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 挂载路由（变量名和导入一致）
app.use('/api/auth', authRouter); // 认证路由（登录/注册/退出）
app.use('/api/users', usersRouter); // 补充：挂载用户管理路由

// HF API路由放在listen之前（否则无法生效）
app.post('/api/hf/generate', async (req, res) => {
  try {
    // 校验参数（补充：避免空参数调用HF API）
    if (!modelId || !inputs) {
      return res.status(400).json({ message: 'modelId和inputs为必填参数' });
    }
    const { modelId, inputs } = req.body;
    const response = await fetch(`https://api-inference.huggingface.co/models/${modelId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.HF_TOKEN}` // 从环境变量读取Token
      },
      body: JSON.stringify({ inputs })
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'HF API调用失败', error: err.message });
  }
});

// 测试接口
app.get('/', (req, res) => {
  res.json({ message: '后端服务运行正常' });
});

// listen放在所有路由/中间件最后
app.listen(PORT, () => {
  console.log(`后端服务运行在 http://localhost:${PORT}`);
});