// src/utils/request.ts
import axios from 'axios';
import { useAuthStore } from '../stores/auth';

// 创建 Axios 实例，指向后端服务地址（后端运行在 3001 端口）
const request = axios.create({
  baseURL: 'http://localhost:3001/api', // 后端接口前缀
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器：添加 Token（登录后携带权限）
request.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`; // Token 格式：Bearer xxx
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器：统一处理错误（Token 过期、服务器错误）
request.interceptors.response.use(
  (response) => response.data, // 直接返回响应体（简化前端取值）
  (error) => {
    const authStore = useAuthStore();
    // Token 过期（401）：自动退出登录，跳转登录页
    if (error.response?.status === 401) {
      authStore.logout();
      window.location.href = '/login';
    }
    // 提取后端错误信息，无则用默认提示
    const errorMsg = error.response?.data?.message || '操作失败，请重试';
    alert(errorMsg);
    return Promise.reject(error);
  }
);

export default request;