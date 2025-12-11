import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth.js';
import usersRouter from './routes/users.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

// 跨域配置
app.use(cors({
  origin: ['https://Liuxin743.github.io','http://localhost:5173'],
  credentials: true
}));

// 解析JSON
app.use(express.json());

// 挂载 auth 路由（核心：前缀 /api/auth）
app.use('/api/auth', authRoutes);

// 测试接口
app.get('/', (req, res) => {
  res.json({ message: '后端服务运行正常' });
});

// 启动服务
app.listen(PORT, () => {
  console.log(`后端服务运行在 http://localhost:${PORT}`);
});

app.post('/api/hf/generate', async (req, res) => {
  try {
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