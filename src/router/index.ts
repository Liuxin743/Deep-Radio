import { createRouter, createWebHashHistory } from 'vue-router'; // 1. 替换为 hash 模式
import HomeView from '@/views/HomeView.vue';
import GeneratorView from '@/views/GeneratorView.vue';
import GuideView from '@/views/GuideView.vue';
import FeaturesView from '@/views/FeaturesView.vue';
import FaqView from '@/views/FaqView.vue';
import CommubityView from '@/views/CommubityView.vue'; 
import DataCenterView from '@/views/DataCenterView.vue';
import CooperationView from '@/views/CooperationView.vue';
import GenerativeModel from '@/views/GenerativeModel.vue';
import NewsView from '@/views/NewsView.vue';
import LoginView from '@/components/LoginView.vue'; 
import UserManagement from '@/components/UserManagement.vue'; 
import ProfileView from '@/components/ProfileView.vue';
import { useAuthStore } from '@/stores/auth.js'; 

const router = createRouter({
  // 3. 改为 hash 模式（适配 GitHub Pages，避免 404）
  history: createWebHashHistory(import.meta.env.BASE_URL),
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
      component: CommubityView 
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
        // 已登录用户禁止访问登录页
        if (authStore.isAuthenticated) {
          return { name: 'home' };
        }
      }
    },
    {
      path: '/user-management',
      name: 'user-management',
      component: UserManagement,
      // 4. 优化守卫逻辑：先初始化，再校验权限
      beforeEnter: async (to, from) => {
        const authStore = useAuthStore();
        try {
          // 初始化本地存储的 token/user
          authStore.init();
          // 未登录 → 跳登录页
          if (!authStore.isAuthenticated) {
            return { name: 'login', query: { redirect: to.fullPath } }; // 登录后返回原页面
          }
          // 有 token 但无用户信息 → 刷新用户数据
          if (authStore.token && !authStore.user) {
            await authStore.fetchCurrentUser();
          }
          // 非管理员 → 跳首页
          if (authStore.user?.role !== 'admin') {
            return { name: 'home' };
          }
        } catch (error) {
          // 异常情况（token 失效）→ 退出登录并跳登录页
          await authStore.logout();
          return { name: 'login' };
        }
      }
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      beforeEnter: async (to, from) => {
        const authStore = useAuthStore();
        try {
          authStore.init();
          if (!authStore.isAuthenticated) {
            return { name: 'login', query: { redirect: to.fullPath } };
          }
          if (authStore.token && !authStore.user) {
            await authStore.fetchCurrentUser();
          }
        } catch (error) {
          await authStore.logout();
          return { name: 'login' };
        }
      }
    }
  ]
});

// 5. 全局守卫：确保所有路由跳转前 Pinia 状态已初始化
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  authStore.init(); // 全局初始化，避免单个守卫重复调用
  next();
});

export default router;