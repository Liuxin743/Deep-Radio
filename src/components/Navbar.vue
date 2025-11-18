<template>
  <header id="navbar">
    <div class="container">
      <div class="logo-section">
        <div class="logo-icon">
          <img src="@/assets/logo.png" alt="Logo" class="w-full h-full object-contain">
        </div>
        <div class="logo-text">Deep Radio</div>
      </div>
      
      <nav class="nav-links">
        <router-link to="/" class="nav-link">首页</router-link>
        <router-link to="/community" class="nav-link">AI通信社区</router-link>
        <router-link to="/data-center" class="nav-link">数据集</router-link>
        <router-link to="/generative-model" class="nav-link">生成模型</router-link>
        <!-- <router-link to="/generator" class="nav-link">生成</router-link> -->
        <!-- <router-link to="/guide" class="nav-link">使用步骤</router-link> -->
        <router-link to="/news" class="nav-link">前沿动态</router-link>
        <router-link to="/features" class="nav-link">关于我们</router-link>
        <!-- <router-link to="/cooperation" class="nav-link">真正合作</router-link> -->
        <router-link to="/faq" class="nav-link">常见问题</router-link>
      </nav>
      
      <div class="right-section">
        <div class="language-select">
          <select 
            v-model="appStore.selectedLanguage" 
            class="language-trigger"
            @change="handleLanguageChange"
          >
            <option value="en">us English</option>
            <option value="zh">CN 简体中文</option>
            <option value="jp">JP 日本語</option>
            <option value="kr">KR 한국어</option>
            <option value="fr">FR Français</option>
            <option value="de">DE Deutsch</option>
          </select>
        </div>
        <button class="login-btn">
          <router-link to="/login" class="nav-link">登录</router-link>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useAppStore } from '@/stores/appStore';

const appStore = useAppStore();

const handleLanguageChange = (e: Event) => {
  const target = e.target as HTMLSelectElement;
  appStore.changeLanguage(target.value);
};
</script>

<style scoped>
#navbar {
  background-color: #1e293b;
  padding: 1rem 0;
  border-bottom: 1px solid #374151;
  width: 100%;
  position: relative;
  z-index: 100;
}

.container {
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}
/* 图标 */
.logo-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(135deg, #a855f7, #7e22ce);
  display: flex;
  align-items: center;
  justify-content: center;
}
.logo-icon img{
    width: 40px;
}


.logo-text {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  white-space: nowrap;
}

.nav-links {
  display: flex;
  gap: clamp(1rem, 3vw, 2rem);
  margin: 0 1rem;
}

@media (max-width: 768px) {
  .nav-links {
    width: 100%;
    justify-content: center;
    margin: 1rem 0 0;
    order: 3;
  }
}

.nav-link {
  color: #e2e8f0;
  transition: color 0.2s ease;
  text-decoration: none;
  white-space: nowrap;
  font-size: clamp(0.9rem, 1.5vw, 1rem);
}

.nav-link:hover,
.nav-link.router-link-exact-active {
  color: white;
  font-weight: 500;
}

.right-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

.language-select {
  position: relative;
  width: 140px;
  /* margin-right: 2rem; */
}

.language-select select {
  width: 100%;
  padding: 0.5rem 2.5rem 0.5rem 1rem;
  background-color: #1e293b;
  color: #e2e8f0;
  border: 1px solid #374151;
  border-radius: 0.375rem;
  appearance: none;
  outline: none;
  cursor: pointer;
  font-size: 14px;
}

.language-select::after {
  content: "\f078";
  font-family: "FontAwesome";
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #e2e8f0;
  pointer-events: none;
  font-size: 12px;
}

.login-btn {
  background: none;
  color: white;
  border: 1px solid #7e22ce;
  border-radius: 0.375rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  margin-right: 1.5rem;
}

.login-btn:hover {
  background-color: rgba(126, 34, 206, 0.1);
}
.login-btn .nav-link {
  color: inherit;
  display: block;
}

.login-btn:hover .nav-link {
  color: inherit;
}
</style>