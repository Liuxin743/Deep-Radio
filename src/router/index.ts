import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import GeneratorView from '@/views/GeneratorView.vue';
import GuideView from '@/views/GuideView.vue';
import FeaturesView from '@/views/FeaturesView.vue';
import FaqView from '@/views/FaqView.vue';
import CommunityView from '@/views/commubityView.vue'; // 注意：文件名可能是 CommunityView.vue（建议统一大小写）
import DataCenterView from '@/views/DataCenterView.vue';
import CooperationView from '@/views/CooperationView.vue';
import GenerativeModel from '@/views/GenerativeModel.vue';
import NewsView from '@/views/NewsView.vue';
import LoginView from '@/components/LoginView.vue';
import UserManagement from '../components/UserManagement.vue';
import ProfileView from '../components/ProfileView.vue'; // 新增：引入个人中心组件
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
      beforeEnter: (to, from) => {
        const authStore = useAuthStore();
        if (authStore.isAuthenticated) {
          return { name: 'home' };
        }
      }
    },
     {
      path: '/user-management',
      name: 'user-management',
      component: UserManagement,
      // 改为 async 守卫
      beforeEnter: async (to, from) => {
        const authStore = useAuthStore();
        authStore.init(); // 手动初始化 Pinia 状态（从本地存储加载 token/user）
        // 若有 token 但无 user 数据，刷新用户信息
        if (authStore.token && !authStore.user) {
          try {
            await authStore.fetchCurrentUser();
          } catch (error) {
            await authStore.logout();
          }
        }
        // 未登录 → 跳登录页
        if (!authStore.isAuthenticated) {
          return { name: 'login' };
        }
        // 非管理员 → 跳首页
        if (authStore.user?.role !== 'admin') {
          return { name: 'home' };
        }
      }
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      // 改为 async 守卫
      beforeEnter: async (to, from) => {
        const authStore = useAuthStore();
        authStore.init(); // 手动初始化
        if (authStore.token && !authStore.user) {
          try {
            await authStore.fetchCurrentUser();
          } catch (error) {
            await authStore.logout();
          }
        }
        if (!authStore.isAuthenticated) {
          return { name: 'login' };
        }
      }
    }
  ]
});

export default router;