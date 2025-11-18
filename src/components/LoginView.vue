<template>
  <div class="login-page">
    <div class="container">
      <div class="login-card">
        <h1 class="login-title">登录</h1>
        <form class="login-form" @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="email">邮箱地址</label>
            <input
              type="email"
              id="email"
              v-model="form.email"
              placeholder="请输入邮箱地址"
              required
            />
          </div>
          <div class="form-group">
            <label for="password">密码</label>
            <input
              type="password"
              id="password"
              v-model="form.password"
              placeholder="请输入密码"
              required
            />
          </div>
          <button type="submit" class="login-btn" :disabled="loading">
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </form>
        <div class="login-footer">
          <p>还没有账号？ <a href="#" class="register-link">立即注册</a></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)

const form = ref({
  email: '',
  password: ''
})

const handleLogin = async () => {
  loading.value = true
  try {
    // 模拟登录过程
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('登录信息:', form.value)
    // 登录成功后跳转到首页
    router.push('/')
  } catch (error) {
    console.error('登录失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background-color: #0f172a;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.container {
  max-width: 400px;
  width: 100%;
}

.login-card {
  background: #1e293b;
  border-radius: 1rem;
  padding: 2rem;
  border: 1px solid #374151;
}

.login-title {
  font-size: 2rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 2rem;
  background: linear-gradient(135deg, #7e22ce, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-form {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #e5e7eb;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #374151;
  border-radius: 0.5rem;
  background: #0f172a;
  color: white;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #7e22ce;
}

.form-group input::placeholder {
  color: #6b7280;
}

.login-btn {
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #7e22ce, #a855f7);
  border: none;
  border-radius: 0.5rem;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(126, 34, 206, 0.3);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.login-footer {
  text-align: center;
  color: #9ca3af;
}

.register-link {
  color: #7e22ce;
  text-decoration: none;
}

.register-link:hover {
  text-decoration: underline;
}
</style>