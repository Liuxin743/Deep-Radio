import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import GeneratorView from '@/views/GeneratorView.vue';
import GuideView from '@/views/GuideView.vue';
import FeaturesView from '@/views/FeaturesView.vue';
import FaqView from '@/views/FaqView.vue';
import CommunityView from '@/views/commubityView.vue'; 
import DataCenterView from '@/views/DataCenterView.vue';
import CooperationView from '@/views/CooperationView.vue';
import GenerativeModel from '@/views/GenerativeModel.vue';
import NewsView from '@/views/NewsView.vue';
import LoginView from '@/components/LoginView.vue';
import UserManagement from '../components/UserManagement.vue';
import ProfileView from '../components/ProfileView.vue'; 
import { useAuthStore } from '../stores/auth.js';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/generator',
      name: 'generator',
      component: GeneratorView
    },
    {
      path: '/guide',
      name: 'guide',
      component: GuideView
    },
    {
      path: '/features',
      name: 'features',
      component: FeaturesView
    },
    {
      path: '/faq',
      name: 'faq',
      component: FaqView
    },
    {
      path: '/community',
      name: 'community',
      component: CommunityView
    },
    {
      path: '/data-center',
      name: 'data-center',
      component: DataCenterView
    },
    {
      path: '/cooperation',
      name: 'cooperation',
      component: CooperationView
    },
    {
      path: '/news',
      name: 'news',
      component: NewsView
    },
    {
      path: '/generative-model',
      name: 'generative-model',
      component: GenerativeModel
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      beforeEnter: async (to, from) => {
        // 延迟导入+获取Pinia，避免初始化问题
        const { useAuthStore } = await import('../stores/auth.js');
        const authStore = useAuthStore();
<<<<<<< HEAD
=======
        
        // 已登录用户访问登录页 → 跳首页
>>>>>>> d623a64 (彻底移除HF Token硬编码：README.md+GenerativeModel.vue，改用后端代理)
        if (authStore.isAuthenticated) {
          return { name: 'home' };
        }
      }
    },
    {
      path: '/user-management',
      name: 'user-management',
      component: UserManagement,
<<<<<<< HEAD
      beforeEnter: (to, from) => {
        const authStore = useAuthStore();
        // 优化：非管理员禁止访问
        if (!authStore.isAuthenticated) {
          return { name: 'login' };
        }
        if (authStore.user?.role !== 'admin') {
          return { name: 'home' };
        }
=======
      beforeEnter: async (to, from) => {
        const { useAuthStore } = await import('../stores/auth.js');
        const authStore = useAuthStore();
        
        // 1. 未登录 → 跳登录页
        if (!authStore.isAuthenticated) {
          return { name: 'login' };
        }
        
        // 2. 非管理员 → 跳首页
        if (authStore.user?.role !== 'admin') {
          return { name: 'home' };
        }
        
        // 3. 访问前清空残留的用户管理数据（双重保障）
        authStore.userList = [];
        authStore.showAddUserModal = false;
        authStore.editingUser = null;
>>>>>>> d623a64 (彻底移除HF Token硬编码：README.md+GenerativeModel.vue，改用后端代理)
      }
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
<<<<<<< HEAD
      beforeEnter: (to, from) => {
        const authStore = useAuthStore();
        // 未登录用户禁止访问，自动跳登录页
=======
      beforeEnter: async (to, from) => {
        const { useAuthStore } = await import('../stores/auth.js');
        const authStore = useAuthStore();
        
        // 未登录 → 跳登录页
>>>>>>> d623a64 (彻底移除HF Token硬编码：README.md+GenerativeModel.vue，改用后端代理)
        if (!authStore.isAuthenticated) {
          return { name: 'login' };
        }
      }
    }
  ]
});

<<<<<<< HEAD
=======
// 退出后（跳登录页）清空所有用户管理数据
router.afterEach(async (to) => {
  if (to.name === 'login') {
    try {
      const { useAuthStore } = await import('../stores/auth.js');
      const authStore = useAuthStore();
      
      // 清空用户管理相关状态
      authStore.userList = [];
      authStore.showAddUserModal = false;
      authStore.editingUser = null;
    } catch (e) {
      console.warn('清空用户管理数据失败：', e);
    }
  }
});

>>>>>>> d623a64 (彻底移除HF Token硬编码：README.md+GenerativeModel.vue，改用后端代理)
export default router;