<template>
  <footer>
    <div class="container">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div>
          <div class="flex items-center mb-4">
            <div class="logo-icon mr-2">
              <i class="fa fa-magic text-white"></i>
            </div>
            <span class="text-2xl font-bold">Viggle AI</span>
          </div>
          <p class="text-gray-400 mb-4">
            利用 AI 技术创建专业级图像内容，将创意变为现实。
          </p>
          <p class="text-gray-400">
            <i class="fa fa-envelope mr-2"></i> contact@viggleai.com
          </p>
        </div>
        
        <div>
          <h3 class="text-lg font-bold mb-4">产品</h3>
          <ul class="space-y-2">
            <li><router-link to="/generator" class="text-gray-400 hover:text-white transition-colors">图生图</router-link></li>
            <li><a href="#" class="text-gray-400 hover:text-white transition-colors">文生图</a></li>
            <li><a href="#" class="text-gray-400 hover:text-white transition-colors">风格库</a></li>
          </ul>
        </div>
        
        <div>
          <h3 class="text-lg font-bold mb-4">资源</h3>
          <ul class="space-y-2">
            <li><router-link to="/guide" class="text-gray-400 hover:text-white transition-colors">使用教程</router-link></li>
            <li><router-link to="/faq" class="text-gray-400 hover:text-white transition-colors">常见问题</router-link></li>
            <li><a href="#" class="text-gray-400 hover:text-white transition-colors">API文档</a></li>
          </ul>
        </div>
        
        <div>
          <h3 class="text-lg font-bold mb-4">公司</h3>
          <ul class="space-y-2">
            <li><a href="#" class="text-gray-400 hover:text-white transition-colors">关于我们</a></li>
            <li><a href="#" class="text-gray-400 hover:text-white transition-colors">隐私政策</a></li>
            <li><a href="#" class="text-gray-400 hover:text-white transition-colors">服务条款</a></li>
          </ul>
        </div>
      </div>
      
      <div class="border-t border-navBorder pt-6 flex flex-col md:flex-row justify-between items-center">
        <p class="text-gray-400 text-sm mb-4 md:mb-0">
          © 2025 Viggle AI. All rights reserved.
        </p>
        <div class="flex space-x-4">
          <button 
            class="px-2 py-1 rounded text-sm"
            :class="appStore.selectedLanguage === 'en' ? 'bg-purple text-white' : 'text-gray-400 hover:text-white'"
            @click="appStore.changeLanguage('en')"
          >
            us English
          </button>
          <button 
            class="px-2 py-1 rounded text-sm"
            :class="appStore.selectedLanguage === 'zh' ? 'bg-purple text-white' : 'text-gray-400 hover:text-white'"
            @click="appStore.changeLanguage('zh')"
          >
            简体中文
          </button>
          <button 
            class="px-2 py-1 rounded text-sm"
            :class="appStore.selectedLanguage === 'jp' ? 'bg-purple text-white' : 'text-gray-400 hover:text-white'"
            @click="appStore.changeLanguage('jp')"
          >
            日本語
          </button>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useAppStore } from '@/stores/appStore';

const appStore = useAppStore();
</script>

<style scoped>
footer {
  background-color: #1e293b;
  border-top: 1px solid #374151;
  padding: 4rem 0 2rem;
  color: white;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
}

footer a {
  text-decoration: none;
  transition: color 0.2s ease;
}

.logo-icon {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  background: linear-gradient(135deg, #a855f7, #7e22ce);
  display: flex;
  align-items: center;
  justify-content: center;
}

.border-t {
  border-top-width: 1px;
}

.navBorder {
  border-color: #374151;
}

.purple {
  background-color: #7e22ce;
}
</style>