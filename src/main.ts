

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import "font-awesome/css/font-awesome.css";
// import 'font-awesome/css/font-awesome.min.css';
// 详细的路由调试
// router.beforeEach((to, from, next) => {
//   console.log('🚀 路由跳转:', from.path, '->', to.path)
//   console.log('📁 路由配置:', router.getRoutes())
//   next()
// })

// router.onError((error) => {
//   console.error('❌ 路由错误:', error)
// })

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.mount('#app')
