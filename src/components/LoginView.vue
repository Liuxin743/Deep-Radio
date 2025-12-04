<!-- LoginView -->
<template>
  <div class="login-page">
    <div class="container">
      <div class="login-card">
        <h1 class="login-title">{{ isRegister ? '注册' : '登录' }}</h1>
        <form class="login-form" @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="username">{{ isRegister ? '用户名' : '邮箱/用户名' }}</label>
            <input
              :type="isRegister ? 'text' : 'text'"
              id="username"
              v-model="form.username"
              :placeholder="isRegister ? '请输入用户名' : '请输入邮箱或用户名'"
              required
            />
          </div>
          
          <div v-if="isRegister" class="form-group">
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
              :placeholder="isRegister ? '请设置密码（至少6位）' : '请输入密码'"
              required
              :minlength="isRegister ? 6 : 1"
            />
          </div>
          
          <div v-if="isRegister" class="form-group">
            <label for="confirmPassword">确认密码</label>
            <input
              type="password"
              id="confirmPassword"
              v-model="form.confirmPassword"
              placeholder="请再次输入密码"
              required
            />
          </div>
          
          <button type="submit" class="login-btn" :disabled="loading">
            {{ loading ? (isRegister ? '注册中...' : '登录中...') : (isRegister ? '注册' : '登录') }}
          </button>
        </form>
        
        <div class="login-footer">
          <p v-if="isRegister">
            已有账号？ 
            <a href="#" class="toggle-link" @click.prevent="toggleMode">立即登录</a>
          </p>
          <p v-else>
            还没有账号？ 
            <a href="#" class="toggle-link" @click.prevent="toggleMode">立即注册</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const isRegister = ref(false)

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// 监听模式切换，清空表单
watch(isRegister, () => {
  Object.keys(form).forEach(key => {
    form[key] = ''
  })
})

const toggleMode = () => {
  isRegister.value = !isRegister.value
}

const validateForm = () => {
  if (isRegister.value) {
    if (form.password !== form.confirmPassword) {
      alert('两次输入的密码不一致')
      return false
    }
    if (form.password.length < 6) {
      alert('密码长度至少为6位')
      return false
    }
    if (!form.email.includes('@')) {
      alert('请输入有效的邮箱地址')
      return false
    }
  }
  return true
}

const handleSubmit = async () => {
  if (!validateForm()) return
  
  loading.value = true
  
  try {
    if (isRegister.value) {
      // 注册逻辑
      await authStore.register({
        username: form.username,
        email: form.email,
        password: form.password
      })
      alert('注册成功！请登录')
      isRegister.value = false
    } else {
      // 登录逻辑
      await authStore.login({
        username: form.username,
        password: form.password
      })
      router.push('/')
    }
  } catch (error: any) {
    alert(error.message || '操作失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.toggle-link {
  color: #7e22ce;
  text-decoration: none;
  cursor: pointer;
}

.toggle-link:hover {
  text-decoration: underline;
}
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