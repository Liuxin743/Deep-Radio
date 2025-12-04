<template>
  <div class="profile-page">
    <div class="container">
      <!-- <h1 class="page-title">个人中心</h1> -->
      
      <div class="profile-content">
        <!-- 头像上传区域 -->
        <div class="avatar-section">
          <AvatarUpload />
        </div>
        
        <!-- 用户信息展示 -->
        <div class="user-info-section">
          <h2 class="section-title">基本信息</h2>
          <div class="info-item">
            <label>用户名：</label>
            <span>{{ authStore.user?.username }}</span>
          </div>
          <div class="info-item">
            <label>邮箱：</label>
            <span>{{ authStore.user?.email }}</span>
          </div>
          <div class="info-item">
            <label>角色：</label>
            <span>{{ authStore.user?.role === 'admin' ? '管理员' : '普通用户' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'; 
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
onMounted(() => {
  authStore.fetchCurrentUser();
});
</script>

<style scoped>
.profile-page {
  min-height: calc(100vh - 60px);
  background-color: #0f172a;
  padding: 2rem;
  margin: 0 auto;
}

.container {
  max-width: 200px;
  margin: 0 auto;
}

.page-title {
  color: white;
  font-size: 2rem;
  margin-bottom: 2rem;
  text-align: center;
}

.profile-content {
  display: flex;
  gap: 3rem;
  justify-content: center;
  flex-wrap: wrap;
}

.avatar-section {
  flex: 1;
  min-width: 300px;
}

.user-info-section {
  flex: 2;
  min-width: 300px;
  background: #1e293b;
  padding: 2rem;
  border-radius: 1rem;
  border: 1px solid #374151;
}

.section-title {
  color: white;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #374151;
  padding-bottom: 0.5rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  color: #e2e8f0;
  font-size: 1rem;
}

.info-item label {
  width: 80px;
  font-weight: 500;
  color: #a855f7;
}
</style>