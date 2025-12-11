import axios from 'axios';
import { useAuthStore } from '../stores/auth';
import { storeToRefs } from 'pinia';

// 创建 Axios 实例（baseURL 包含 /api 前缀，简化接口调用）
const request = axios.create({
  baseURL: 'http://localhost:3001/api', // 关键修正：添加 /api 前缀
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器：添加 Token
request.interceptors.request.use(
  (config) => {
    try {
      const authStore = useAuthStore();
      const { token } = storeToRefs(authStore);
      if (token.value) {
        config.headers.Authorization = `Bearer ${token.value}`;
      }
    } catch (e) {
      console.warn('获取Token失败', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器：统一处理错误
request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    try {
      const authStore = useAuthStore();
      // Token过期/未授权（401）：退出登录并跳转
      if (error.response?.status === 401) {
        // 避免重复触发退出
        if (authStore.isAuthenticated) {
          authStore.logout();
          // 延迟跳转，避免阻塞代码
          setTimeout(() => {
            window.location.href = '/login';
          }, 500);
        }
      }
    } catch (e) {
      console.warn('响应拦截器：处理401失败', e);
    }

    // 统一错误提示（避免重复alert）
    const errorMsg = error.response?.data?.message 
      || error.message 
      || (error.code === 'ERR_NETWORK' ? '后端服务未启动，请检查端口3001' : '操作失败，请重试');
    
    // 只提示一次错误（避免多个请求同时报错）
    if (!window.errorAlertShowing) {
      window.errorAlertShowing = true;
      alert(errorMsg);
      setTimeout(() => {
        window.errorAlertShowing = false;
      }, 2000);
    }

    return Promise.reject(error);
  }
);

// ❗移除 TS 的 declare global，直接使用 window 变量（JS 环境无需类型声明）
window.errorAlertShowing = window.errorAlertShowing || false;

export default request;