<template>
  <div class="user-management">
    <div class="header">
      <h1>用户管理</h1>
      <button @click="showAddUserModal = true" class="add-user-btn">
        <span>+</span> 添加用户
      </button>
    </div>

    <div class="users-table-container">
      <table class="users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>用户名</th>
            <th>邮箱</th>
            <th>角色</th>
            <th>注册时间</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <!-- 修复：渲染用户头像 -->
            <td>
              <img 
                :src="user.avatar || 'https://via.placeholder.com/40/7e22ce/ffffff?text=U'" 
                alt="用户头像"
                class="user-avatar-img"
              />
            </td>
            <td>{{ user.id }}</td>
            <td>{{ user.username }}</td>
            <td>{{ user.email }}</td>
            <td>
              <span class="role-badge" :class="user.role">
                {{ user.role === 'admin' ? '管理员' : '普通用户' }}
              </span>
            </td>
            <td>{{ formatDate(user.createdAt) }}</td>
            <td>
              <span class="status-badge" :class="user.status">
                {{ user.status === 'active' ? '活跃' : '禁用' }}
              </span>
            </td>
            <td class="actions">
              <button @click="editUser(user)" class="btn-edit">编辑</button>
              <button 
                @click="toggleUserStatus(user)" 
                :class="['btn-status', user.status]"
              >
                {{ user.status === 'active' ? '禁用' : '启用' }}
              </button>
              <button 
                v-if="user.id !== currentUser.id"
                @click="deleteUser(user.id)"
                class="btn-delete"
              >
                删除
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 添加/编辑用户模态框 -->
    <div v-if="showAddUserModal || editingUser" class="modal-overlay">
      <div class="modal">
        <h2>{{ editingUser ? '编辑用户' : '添加用户' }}</h2>
        <form @submit.prevent="saveUser">
          <div class="form-group">
            <label>用户名</label>
            <input v-model="userForm.username" required>
          </div>
          <div class="form-group">
            <label>邮箱</label>
            <input v-model="userForm.email" type="email" required>
          </div>
          <div class="form-group">
            <label>密码</label>
            <input 
              v-model="userForm.password" 
              type="password" 
              :placeholder="editingUser ? '留空则不修改' : '请输入密码'"
              :required="!editingUser"
            >
          </div>
          <div class="form-group">
            <label>角色</label>
            <select v-model="userForm.role">
              <option value="user">普通用户</option>
              <option value="admin">管理员</option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn-cancel">取消</button>
            <button type="submit" class="btn-save">保存</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const showAddUserModal = ref(false)
const editingUser = ref<any>(null)

// 接口返回 avatar 字段，更新 User 类型
interface User {
  id: number
  username: string
  email: string
  role: 'user' | 'admin'
  status: 'active' | 'inactive'
  createdAt: string
  avatar?: string // 新增：头像URL（可选）
}

const users = ref<User[]>([])
const currentUser = computed(() => authStore.user)

const userForm = reactive({
  username: '',
  email: '',
  password: '',
  role: 'user' as 'user' | 'admin'
})

// 面挂载重复调用，保留一个即可
onMounted(() => {
  loadUsers()
});

const loadUsers = async () => {
  users.value = await authStore.getUsers();
};

// 补全 editUser 方法（编辑用户时回显数据）
const editUser = (user: User) => {
  editingUser.value = user;
  // 回显用户数据（密码留空，避免暴露）
  userForm.username = user.username;
  userForm.email = user.email;
  userForm.role = user.role;
  userForm.password = '';
};

// 补全 closeModal 方法（关闭模态框）
const closeModal = () => {
  showAddUserModal.value = false;
  editingUser.value = null;
  // 清空表单
  userForm.username = '';
  userForm.email = '';
  userForm.password = '';
  userForm.role = 'user';
};

// 补全 formatDate 方法（格式化时间）
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

const saveUser = async () => {
  try {
    if (editingUser.value) {
      await authStore.updateUser(editingUser.value.id, userForm);
    } else {
      await authStore.addUser(userForm);
    }
    closeModal();
    loadUsers();
  } catch (error) {
    alert('操作失败');
  }
};

const toggleUserStatus = async (user: User) => {
  const newStatus = user.status === 'active' ? 'inactive' : 'active';
  if (confirm(`确定要${newStatus === 'active' ? '启用' : '禁用'}用户 ${user.username} 吗？`)) {
    await authStore.toggleUserStatus(user.id, newStatus);
    loadUsers();
  }
};

const deleteUser = async (userId: number) => {
  if (confirm('确定要删除这个用户吗？此操作不可撤销。')) {
    await authStore.deleteUser(userId);
    loadUsers();
  }
};
</script>

<style scoped>
/* 新增：用户头像样式 */
.user-avatar-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #374151;
}

/* 原有样式不变，保留以下代码 */
.user-management {
  padding: 2rem;
  background: #0f172a;
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h1 {
  color: white;
  font-size: 2rem;
}

.add-user-btn {
  background: linear-gradient(135deg, #7e22ce, #a855f7);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.add-user-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(126, 34, 206, 0.3);
}

.users-table-container {
  background: #1e293b;
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid #374151;
}

.users-table {
  width: 100%;
  color: white;
  border-collapse: collapse;
}

.users-table th {
  text-align: left;
  padding: 1rem;
  border-bottom: 1px solid #374151;
  color: #9ca3af;
  font-weight: 500;
}

.users-table td {
  padding: 1rem;
  border-bottom: 1px solid #374151;
}

.role-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
}

.role-badge.admin {
  background: rgba(126, 34, 206, 0.2);
  color: #a855f7;
}

.role-badge.user {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
}

.status-badge.active {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.status-badge.inactive {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.actions button {
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.btn-edit {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

.btn-edit:hover {
  background: rgba(59, 130, 246, 0.3);
}

.btn-status {
  background: rgba(234, 179, 8, 0.2);
  color: #eab308;
}

.btn-status.inactive {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.btn-delete {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.btn-delete:hover {
  background: rgba(239, 68, 68, 0.3);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #1e293b;
  border-radius: 1rem;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  border: 1px solid #374151;
}

.modal h2 {
  color: white;
  margin-bottom: 1.5rem;
}

.modal .form-group {
  margin-bottom: 1rem;
}

.modal .form-group label {
  display: block;
  color: #e5e7eb;
  margin-bottom: 0.5rem;
}

.modal .form-group input,
.modal .form-group select {
  width: 100%;
  padding: 0.75rem;
  background: #0f172a;
  border: 1px solid #374151;
  border-radius: 0.5rem;
  color: white;
}

.modal .form-group input:focus,
.modal .form-group select:focus {
  outline: none;
  border-color: #7e22ce;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-cancel {
  flex: 1;
  padding: 0.75rem;
  background: #374151;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
}

.btn-save {
  flex: 1;
  padding: 0.75rem;
  background: linear-gradient(135deg, #7e22ce, #a855f7);
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
}
</style>