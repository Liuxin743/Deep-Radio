import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import request from '../utils/request';
import type { User, LoginData, LoginResponse, RegisterData, RegisterResponse } from '../types/user';

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem('token'));
  const isAuthenticated = computed(() => !!token.value);

  // 初始化（页面加载时恢复缓存）
  const init = () => {
    const savedUser = localStorage.getItem('user');
    if (savedUser && token.value) {
      user.value = JSON.parse(savedUser);
    }
  };

  // 登录（接口路径：/auth/login → 实际请求：http://localhost:3001/api/auth/login）
  const login = async (data: LoginData) => {
    const res = await request.post<LoginResponse>('/auth/login', data);
    token.value = res.token;
    user.value = res.user;
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    return res.user;
  };

  // 注册（接口路径：/auth/register → 实际请求：http://localhost:3001/api/auth/register）
  const register = async (data: RegisterData) => {
    const res = await request.post<RegisterResponse>('/auth/register', data);
    return res;
  };

  // 退出登录
  const logout = async () => {
    try {
      if (token.value) {
        await request.post('/auth/logout');
      }
    } finally {
      user.value = null;
      token.value = null;
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
      logout();
      throw error;
    }
  };

  // 用户管理：获取所有用户
  const getUsers = async (params?: any) => {
    const res = await request.get<User[]>('/users', { params });
    return res;
  };

  // 用户管理：添加用户
  const addUser = async (data: Omit<User, 'id' | 'created_at' | 'status'> & { password: string }) => {
    return request.post('/users', data);
  };

  // 用户管理：编辑用户
  const updateUser = async (userId: number, data: Partial<User>) => {
    return request.put(`/users/${userId}`, data);
  };

  // 用户管理：切换状态
  const toggleUserStatus = async (userId: number, status: 'active' | 'inactive') => {
    return request.patch(`/users/${userId}/status`, { status });
  };

  // 用户管理：删除用户
  const deleteUser = async (userId: number) => {
    return request.delete(`/users/${userId}`);
  };

  // 初始化
  init();

  return {
    user,
    token,
    isAuthenticated,
    init,
    login,
    register,
    logout,
    fetchCurrentUser,
    getUsers,
    addUser,
    updateUser,
    toggleUserStatus,
    deleteUser
  };
});