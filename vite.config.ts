import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import path from 'path' // 引入path模块

export default defineConfig({
  // 基础路径配置
  base: process.env.NODE_ENV === 'production' ? '/Deep-Radio/' : '/',
  // 插件配置
  plugins: [
    vue(),
    vueDevTools(),
  ],
  // 路径别名配置
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  // 开发服务器配置（整合fs和proxy）
  server: {
    // 解决字体文件路径问题：允许访问上级目录
    fs: {
      allow: [path.resolve(__dirname, '..')]
    },
    proxy: {
      // arXiv API 代理（解决跨域）
      '/api/arxiv': {
        target: 'https://export.arxiv.org/api', // 改为 https
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/arxiv/, ''),
        secure: false // 允许非安全证书
      },
      // Semantic Scholar API 代理（解决跨域）
      '/api/semantic': {
        target: 'https://api.semanticscholar.org/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/semantic/, '')
      }
    }
  }
})