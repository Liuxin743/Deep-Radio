import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import request from '../utils/request';
import type { User } from '../types/user';

// 补充缺失的类型定义（匹配登录/注册参数）
interface LoginData {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: Omit<User, 'password'>;
}

interface RegisterResponse {
  message: string;
  userId: number;
}

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem('token'));
  const isAuthenticated = computed(() => !!token.value);

  // 初始化（页面加载时恢复缓存）
  const init = () => {
    const savedUser = localStorage.getItem('user');
    if (savedUser && token.value) {
      try {
        user.value = JSON.parse(savedUser);
      } catch (e) {
        localStorage.removeItem('user');
        user.value = null;
      }
    }
  };

  // 登录
  const login = async (data: LoginData) => {
    const res = await request.post<LoginResponse>('/auth/login', data);
    token.value = res.token;
    user.value = res.user;
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    return res.user;
  };

  // 注册
  const register = async (data: RegisterData) => {
    const res = await request.post<RegisterResponse>('/auth/register', data);
    return res;
  };

  // 退出登录（修复核心逻辑）
  const logout = async () => {
    try {
      // 调用退出接口（忽略失败，避免影响退出流程）
      if (token.value) {
        await request.post('/auth/logout').catch(() => {});
      }
    } finally {
      // 清空状态 + 本地存储
      token.value = null;
      user.value = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  // 刷新当前用户信息
  const fetchCurrentUser = async () => {
    try {
      const res = await request.get<User>('/auth/me');
      user.value = res;
      localStorage.setItem('user', JSON.stringify(res));
      return res;
    } catch (error) {
      await logout(); // 确保退出登录
      throw error;
    }
  };

  // 用户管理：获取所有用户
  const getUsers = async (params?: any) => {
    const res = await request.get<User[]>('/users', { params });
    return res;
  };

  // 用户管理：添加用户（补充TS类型）
  const addUser = async (data: Omit<User, 'id' | 'created_at' | 'status'> & { password: string }) => {
    const res = await request.post('/users', data);
    await getUsers(); // 添加后刷新列表
    return res;
  };

  // 用户管理：编辑用户（补充缺失的updateUser函数）
  const updateUser = async (
    userId: number,
    data: Partial<Omit<User, 'id' | 'created_at' | 'status'> & { password?: string }>
  ) => {
    const res = await request.put(`/users/${userId}`, data);
    await getUsers(); // 编辑后刷新列表
    return res;
  };

  // 用户管理：切换状态（补充TS类型）
  const toggleUserStatus = async (userId: number, status: 'active' | 'inactive') => {
    const res = await request.patch(`/users/${userId}/status`, { status });
    await getUsers(); // 切换后刷新列表
    return res;
  };

  // 用户管理：删除用户（补充TS类型）
  const deleteUser = async (userId: number) => {
    const res = await request.delete(`/users/${userId}`);
    await getUsers(); // 删除后刷新列表
    return res;
  };

  // 初始化
  init();

  return {
    user,
    token,
    isAuthenticated,
    init,
    login,
    register, // 补充暴露register（登录/注册组件需要）
    logout,
    fetchCurrentUser, // 补充暴露（个人中心需要）
    getUsers,
    addUser,
    updateUser, // 现在有对应的函数定义了
    toggleUserStatus,
    deleteUser
  };
});