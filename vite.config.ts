import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import path from 'path' // 新增：引入path模块

// https://vite.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/Deep-Radio/' : '/',
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
       '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  // 新增：允许访问上级目录的node_modules，解决字体文件路径问题
  server: {
    fs: {
      allow: [path.resolve(__dirname, '..')]
    }
  }
})