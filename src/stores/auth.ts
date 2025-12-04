import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import request from '../utils/request.js';
import type { User, LoginResponse, RegisterResponse } from '../types/user.js';

interface LoginData {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem('token'));
  const isAuthenticated = computed(() => !!token.value);

  // 关键：补充 init 方法（路由守卫依赖）
  const init = () => {
    const savedUser = localStorage.getItem('user');
    if (savedUser && token.value) {
      user.value = JSON.parse(savedUser);
      // 适配后端字段名（created_at → createdAt）
      if (user.value?.created_at) {
        user.value = {
          ...user.value,
          createdAt: user.value.created_at
        };
      }
    }
  };

  // 登录
  const login = async (data: LoginData) => {
    const res = await request.post<LoginResponse>('/auth/login', data);
    token.value = res.token;
    const userData = {
      ...res.user,
      createdAt: res.user.created_at
    };
    user.value = userData;
    localStorage.setItem('token', token.value);
    localStorage.setItem('user', JSON.stringify(userData));
    return userData;
  };

  // 注册
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
      const userData = {
        ...res,
        createdAt: res.created_at
      };
      user.value = userData;
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      logout();
      throw error;
    }
  };

  // 用户管理：获取所有用户
  const getUsers = async (params?: any) => {
    const res = await request.get<User[]>('/users', { params });
    return res.map(item => ({
      ...item,
      createdAt: item.created_at
    }));
  };

  // 用户管理：添加用户
  const addUser = async (data: Omit<User, 'id' | 'createdAt' | 'status'> & { password: string }) => {
    return request.post('/users', data);
  };

  // 用户管理：编辑用户
  const updateUser = async (userId: number, data: Partial<User>) => {
    return request.put(`/users/${userId}`, data);
  };

  // 用户管理：切换用户状态
  const toggleUserStatus = async (userId: number, status: 'active' | 'inactive') => {
    return request.patch(`/users/${userId}/status`, { status });
  };

  // 用户管理：删除用户
  const deleteUser = async (userId: number) => {
    return request.delete(`/users/${userId}`);
  };

  // 初始化缓存数据（页面加载时执行）
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