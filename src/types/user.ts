
export interface User {
  id: number;
  username: string;
  email: string;
  password?: string; // 密码仅注册/登录时使用，返回用户信息时可能不含
  role: 'user' | 'admin';
  status: 'active' | 'inactive';
  created_at: string; // 后端字段
  createdAt?: string; // 前端适配字段
  avatar?: string; // 新增：头像URL（可选）
}

export interface LoginResponse {
  token: string;
  user: Omit<User, 'password'>; // 登录成功不返回密码
}

export interface RegisterResponse {
  message: string;
  userId: number;
}