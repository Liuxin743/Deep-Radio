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
        <router-link to="/news" class="nav-link">前沿动态</router-link>
        <router-link to="/features" class="nav-link">关于我们</router-link>
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

        <!-- 已登录：头像（下拉菜单触发） -->
        <div v-if="authStore.isAuthenticated" class="user-menu-container">
          <!-- 头像触发区：点击显示/隐藏下拉菜单 -->
          <div 
            class="avatar-trigger"
            @click="isDropdownOpen = !isDropdownOpen"
            @blur="closeDropdown"
            tabindex="0"
          >
            <div class="user-avatar">
              <!-- 上传中显示加载动画，否则显示头像/默认图 -->
              <img 
                v-if="!isUploading"
                :src="authStore.user?.avatar || defaultAvatar" 
                alt="用户头像" 
                class="avatar-img"
              />
              <div v-else class="avatar-loading">
                <span class="loading-spinner">●</span>
              </div>
            </div>
            <!-- 下拉箭头：根据菜单状态旋转 -->
            <span class="dropdown-arrow" :class="{ rotated: isDropdownOpen }">▼</span>
          </div>

          <!-- 下拉菜单：点击头像显示 -->
          <div 
            class="user-dropdown"
            :class="{ visible: isDropdownOpen }"
          >
            <!-- 用户名 -->
            <div class="dropdown-user-info">
              <span class="dropdown-username">{{ authStore.user?.username }}</span>
              <span class="dropdown-role">{{ authStore.user?.role === 'admin' ? '管理员' : '普通用户' }}</span>
            </div>
            
            <!-- 菜单分割线 -->
            <!-- <div class="dropdown-divider"></div> -->
            
            <!-- 菜单选项：更换头像 -->
            <label class="dropdown-item avatar-upload-item">
              <span>更换头像</span>
              <input 
                type="file" 
                accept="image/png,image/jpg,image/jpeg,image/gif"
                @change="handleFileSelect"
                class="avatar-file-input"
              />
            </label>
            
            <!-- 菜单选项：个人中心（管理员显示管理入口） -->
            <router-link 
              to="/profile" 
              class="dropdown-item"
              @click="isDropdownOpen = false"
            >
              <span>个人中心</span>
            </router-link>
            
            <!-- 管理员专属：用户管理入口 -->
            <router-link 
              v-if="authStore.user?.role === 'admin'"
              to="/user-management" 
              class="dropdown-item"
              @click="isDropdownOpen = false"
            >
              <span>用户管理</span>
            </router-link>
            
            <!-- 菜单分割线 -->
            <div class="dropdown-divider"></div>
            
            <!-- 菜单选项：退出登录 -->
            <button 
              class="dropdown-item logout-item"
              @click="handleLogout"
            >
              <span>退出登录</span>
            </button>
          </div>
        </div>

        <!-- 未登录：显示登录按钮 -->
        <button v-else class="login-btn">
          <router-link to="/login" class="nav-link">登录</router-link>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { useAppStore } from '@/stores/appStore';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import request from '@/utils/request';

const appStore = useAppStore();
const authStore = useAuthStore();
const router = useRouter();
const defaultAvatar = 'https://via.placeholder.com/40/7e22ce/ffffff?text=U';

// 下拉菜单状态：是否显示
const isDropdownOpen = ref(false);
// 上传状态：控制加载动画
const isUploading = ref(false);

// 点击页面其他地方关闭下拉菜单
watchEffect(() => {
  const handleClickOutside = (e: MouseEvent) => {
    const container = document.querySelector('.user-menu-container');
    if (container && !container.contains(e.target as Node)) {
      isDropdownOpen.value = false;
    }
  };

  document.addEventListener('click', handleClickOutside);
  return () => document.removeEventListener('click', handleClickOutside);
});

// 语言切换逻辑（不变）
const handleLanguageChange = (e: Event) => {
  const target = e.target as HTMLSelectElement;
  appStore.changeLanguage(target.value);
};

// 关闭下拉菜单
const closeDropdown = () => {
  isDropdownOpen.value = false;
};

// 退出登录逻辑
const handleLogout = async () => {
  isDropdownOpen.value = false; // 先关闭菜单
  await authStore.logout();
  router.push('/');
};

// 选择文件后自动上传头像
const handleFileSelect = async (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;

  const selectedFile = target.files[0];
  // 验证文件大小（最大5MB）
  if (selectedFile.size > 5 * 1024 * 1024) {
    alert('图片大小不能超过5MB！');
    target.value = '';
    return;
  }

  // 验证文件类型
  const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif'];
  if (!allowedTypes.includes(selectedFile.type)) {
    alert('仅支持PNG、JPG、JPEG、GIF格式的图片！');
    target.value = '';
    return;
  }

  // 开始上传：显示加载动画，关闭菜单
  isUploading.value = true;
  isDropdownOpen.value = false;
  try {
    const formData = new FormData();
    formData.append('avatar', selectedFile);

    const res = await request.post('/auth/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    // 上传成功：刷新用户信息
    await authStore.fetchCurrentUser();
    alert('头像更换成功！');
  } catch (error: any) {
    alert(error.message || '头像上传失败，请重试');
  } finally {
    isUploading.value = false;
    target.value = '';
  }
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
}

.language-select select {
  width: 100%;
  padding: .5rem 2.5rem 0.5rem 1rem;
  background-color: #1e293b;
  color: #e2e8f0;
  border: 1px solid #374151;
  border-radius: 0.375rem;
  appearance: none;
  outline: none;
  cursor: pointer;
  font-size: 14px;
}

/* 已登录：用户菜单容器 */
.user-menu-container {
  position: relative;
  margin-right: 1.5rem;
}

/* 头像触发区：头像+下拉箭头 */
.avatar-trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.2rem;
  border-radius: 0.375rem;
  transition: background-color 0.2s ease;
}

.avatar-trigger:hover {
  background-color: rgba(126, 34, 206, 0.1);
}

/* 用户头像样式 */
.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid #7e22ce;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #0f172a;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 上传中加载动画 */
.avatar-loading {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  color: #a855f7;
  font-size: 1.5rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 下拉箭头 */
.dropdown-arrow {
  color: #e2e8f0;
  font-size: 0.8rem;
  transition: transform 0.2s ease;
}

.dropdown-arrow.rotated {
  transform: rotate(180deg);
}

/* 下拉菜单：默认隐藏，visible 时显示 */
.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  width: 120px;
  background-color: #1e293b;
  border: 1px solid #374151;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  padding: 0.5rem 0;
  z-index: 999;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.2s ease;
}

.user-dropdown.visible {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

/* 下拉菜单中的用户信息 */
.dropdown-user-info {
  padding: 0.8rem 1rem;
  border-bottom: 1px solid #374151;
  margin-bottom: 0.5rem;
}

.dropdown-username {
  display: block;
  color: white;
  font-weight: 500;
  font-size: 1rem;
}

.dropdown-role {
  display: block;
  color: #9ca3af;
  font-size: 0.8rem;
  margin-top: 0.2rem;
}

/* 菜单分割线 */
.dropdown-divider {
  height: 1px;
  background-color: #374151;
  margin: 0.5rem 0;
}

/* 下拉菜单项 */
.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.8rem 1.2rem;
  color: #e2e8f0;
  text-decoration: none;
  transition: background-color 0.2s ease;
  cursor: pointer;
  width: 100%;
  box-sizing: border-box;
  border: none;
  background: none;
  text-align: left;
  font-size: 0.9rem;
}

.dropdown-item:hover {
  background-color: rgba(126, 34, 206, 0.1);
  color: white;
}

/* 菜单项图标 */
.item-icon {
  font-size: 1.1rem;
  width: 1.2rem;
  text-align: center;
}

/* 更换头像菜单项：隐藏文件选择框 */
.avatar-upload-item {
  position: relative;
}

.avatar-file-input {
  display: none;
}

/* 退出登录菜单项：特殊样式 */
.logout-item {
  color: #ef4444;
}

.logout-item:hover {
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

/* 未登录：登录按钮 */
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