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
    },{
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
      path:'/generative-model',
      name:'generative-model',
      component:GenerativeModel
    },{
      path:'/login',
      name:'login',
      component:LoginView
    }
  ]
});

export default router;
