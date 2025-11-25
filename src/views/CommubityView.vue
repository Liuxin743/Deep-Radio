<template>
  <div class="community-view">
    <!-- <header>
      <div class="container">
        <div class="header-content">
          <div class="logo">
            <div class="logo-icon">AI</div>
            <h1>AI通信社区</h1>
          </div>
          <div class="user-info">
            <div class="user-avatar">SG</div>
            <span>SG</span>
          </div>
        </div>
      </div>
    </header>
     -->
    <div class="container">
      <div class="main-content">
        <aside class="sidebar">
          <h2>导航菜单</h2>
          <ul class="nav-menu">
            <li v-for="item in navItems" :key="item.id">
              <a 
                href="#" 
                :class="{ active: item.active }"
                @click.prevent="setActiveNav(item.id)"
              >
                <span class="nav-icon">{{ item.icon }}</span> {{ item.name }}
              </a>
            </li>
          </ul>
        </aside>
        
        <main class="content">
          <div class="category-selector">
            <select v-model="selectedCategory">
              <option value="">选择分类</option>
              <option v-for="category in categories" :value="category" :key="category">
                {{ category }}
              </option>
            </select>
            <button class="publish-btn" @click="showPublishModal = true">发布</button>
          </div>
          
          <div class="post-card" v-for="post in filteredPosts" :key="post.id">
            <!-- 删除按钮 - 只有自己发布的帖子才显示 -->
            <button 
              class="delete-btn" 
              v-if="post.author === currentUser" 
              @click="deletePost(post.id)"
            >
              ×
            </button>
            
            <div class="post-header">
              <div class="author-avatar">{{ post.authorInitials }}</div>
              <div class="author-info">
                <div class="author-name">{{ post.author }}</div>
                <div class="author-title">{{ post.title }}</div>
              </div>
              <div class="post-time">{{ post.time }}</div>
            </div>
            
            <div class="post-content">
              <h3 class="post-title">{{ post.postTitle }}</h3>
              <p class="post-text">{{ post.content }}</p>
              <div class="post-tags">
                <span class="tag" v-for="tag in post.tags" :key="tag">{{ tag }}</span>
              </div>
            </div>
            
            <div class="post-actions">
              <button class="like-btn" @click="toggleLike(post)">
                <span>👍</span>
                <span class="like-count">{{ post.likes }}</span>
              </button>
              <a href="#" class="comment-btn">技术交流</a>
            </div>
          </div>
        </main>
      </div>
    </div>

    <!-- 发布模态框 -->
    <div class="modal" v-if="showPublishModal" @click="showPublishModal = false">
      <div class="modal-content" @click.stop>
        <h3>发布新内容</h3>
        <form @submit.prevent="publishPost">
          <div class="form-group">
            <label>标题</label>
            <input type="text" v-model="newPost.title" required>
          </div>
          <div class="form-group">
            <label>内容</label>
            <textarea v-model="newPost.content" rows="5" required></textarea>
          </div>
          <div class="form-group">
            <label>标签 (用逗号分隔)</label>
            <input type="text" v-model="newPost.tagsInput">
          </div>
          <div class="form-actions">
            <button type="button" @click="showPublishModal = false">取消</button>
            <button type="submit">发布</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// 当前登录用户
const currentUser = ref('SG')

// 导航菜单数据
const navItems = ref([
  { id: 1, name: 'AI资源导航', icon: '📚', active: true },
  { id: 2, name: '热门框架', icon: '🔥', active: false },
  { id: 3, name: '通信技术', icon: '📡', active: false },
  { id: 4, name: '学习资源', icon: '🎓', active: false },
  { id: 5, name: '最新论文', icon: '📄', active: false },
  { id: 6, name: '实战教程', icon: '🛠️', active: false },
  { id: 7, name: '数据集', icon: '📊', active: false },
  { id: 8, name: 'AI工具推荐', icon: '🔧', active: false }
])

// 设置活跃导航项
const setActiveNav = (id) => {
  navItems.value.forEach(item => {
    item.active = item.id === id
  })
}

// 帖子数据
const posts = ref([
  {
    id: 1,
    author: '李华',
    authorInitials: 'LH',
    title: '通信系统专家 | 编译器',
    time: '2小时前',
    postTitle: '基于深度学习的5G信号优化项目',
    content: '使用Transformer架构处理时序信号，相比传统方法性能提升30%。关键点：注意力机制、端到端训练。',
    tags: ['深度学习', 'SG', 'Transformer', '信号处理'],
    likes: 24,
    liked: false,
    category: '深度学习'
  },
  {
    id: 2,
    author: '张明',
    authorInitials: 'ZM',
    title: 'AI算法工程师 | 研究员',
    time: '5小时前',
    postTitle: '夯实AI技术心性，通信算法研究应用日益强',
    content: '分享近期在通信信号处理领域的研究进展，探讨如何将最新的AI技术应用于传统通信领域，实现性能突破。',
    tags: ['AI算法', '通信', '研究应用'],
    likes: 18,
    liked: false,
    category: 'AI算法'
  },
  {
    id: 3,
    author: '王芳',
    authorInitials: 'WF',
    title: '数据科学家 | 研究员',
    time: '1天前',
    postTitle: '通信数据可视化分析实践',
    content: '使用现代可视化工具对通信网络数据进行深度分析，发现隐藏的模式和趋势。',
    tags: ['数据可视化', '通信', '数据分析'],
    likes: 12,
    liked: false,
    category: '数据分析'
  }
])

// 分类数据
const categories = ref(['深度学习', '通信技术', '信号处理', 'AI算法', '数据分析'])
const selectedCategory = ref('')

// 过滤帖子
const filteredPosts = computed(() => {
  if (!selectedCategory.value) return posts.value
  return posts.value.filter(post => 
    post.category === selectedCategory.value || 
    post.tags.includes(selectedCategory.value)
  )
})

// 点赞功能
const toggleLike = (post) => {
  if (post.liked) {
    post.likes--
  } else {
    post.likes++
  }
  post.liked = !post.liked
  
  // 添加简单的动画效果
  const button = event?.target
  const likeBtn = button.closest('.like-btn')
  if (likeBtn) {
    likeBtn.style.transform = 'scale(1.2)'
    setTimeout(() => {
      likeBtn.style.transform = 'scale(1)'
    }, 200)
  }
}

// 删除帖子功能
const deletePost = (postId) => {
  if (confirm('确定要删除这篇帖子吗？')) {
    const index = posts.value.findIndex(post => post.id === postId)
    if (index !== -1) {
      posts.value.splice(index, 1)
    }
  }
}

// 发布新帖子
const showPublishModal = ref(false)
const newPost = ref({
  title: '',
  content: '',
  tagsInput: ''
})

const publishPost = () => {
  const tags = newPost.value.tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag)
  
  posts.value.unshift({
    id: Date.now(), // 使用时间戳作为ID
    author: currentUser.value,
    authorInitials: currentUser.value,
    title: '社区用户',
    time: '刚刚',
    postTitle: newPost.value.title,
    content: newPost.value.content,
    tags: tags,
    likes: 0,
    liked: false,
    category: tags[0] || '其他'
  })
  
  // 重置表单
  newPost.value = {
    title: '',
    content: '',
    tagsInput: ''
  }
  
  showPublishModal.value = false
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.community-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1f35 0%, #2d3748 100%);
  color: #e2e8f0;
  line-height: 1.6;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

header {
  background: rgba(26, 32, 44, 0.95);
  backdrop-filter: blur(10px);
  color: white;
  /* padding: 20px 0;. */
  border-bottom: 1px solid #4a5568;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
}

.logo h1 {
  font-size: 24px;
  font-weight: 600;
  margin-left: 10px;
  background: linear-gradient(135deg, #a855f7 0%, #7e22ce 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-icon {
  font-size: 28px;
  font-weight: bold;
  background: linear-gradient(135deg, #a855f7 0%, #7e22ce 100%);
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #a855f7 0%, #7e22ce 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  color: white;
  font-weight: bold;
}

.main-content {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 20px;
  margin-top: 30px;
}

.sidebar {
  background: rgba(26, 32, 44, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #4a5568;
  box-shadow: 0 4px 15px rgba(126, 34, 206, 0.3);
}

.sidebar h2 {
  font-size: 18px;
  margin-bottom: 15px;
  color: #a855f7;
  padding-bottom: 10px;
  border-bottom: 1px solid #4a5568;
}

.nav-menu {
  list-style: none;
}

.nav-menu li {
  margin-bottom: 12px;
}

/* 核心样式：hover时才显示边框 */
.nav-menu a {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  color: #d8b4fe;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid transparent; /* 默认透明边框，避免hover跳动 */
}

/* 鼠标停留时显示边框和背景变化 */
.nav-menu a:hover {
  background: rgba(126, 34, 206, 0.2);
  color: #f3e8ff;
  border-color: #a855f7; /* hover时才显示边框 */
  transform: translateX(5px);
}

/* 激活状态：只改变背景和文字，不显示边框 */
.nav-menu a.active {
  background: rgba(126, 34, 206, 0.3);
  color: #f3e8ff;
  font-weight: 500;
  border-color: #7e22ce;
}

.nav-icon {
  margin-right: 10px;
  font-size: 18px;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.category-selector {
  background: rgba(26, 32, 44, 0.8);
  border-radius: 12px;
  padding: 15px 20px;
  border: 1px solid #4a5568;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 15px rgba(126, 34, 206, 0.3);
}

.category-selector select {
  padding: 10px 15px;
  border: 1px solid #4a5568;
  border-radius: 8px;
  background: #2d3748;
  color: #e2e8f0;
  width: 200px;
  font-size: 14px;
}

.category-selector select:focus {
  outline: none;
  border-color: #a855f7;
  box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.3);
}

.publish-btn {
  background: linear-gradient(135deg, #7e22ce 0%, #6b21a8 100%);
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(126, 34, 206, 0.4);
}

.publish-btn:hover {
  background: linear-gradient(135deg, #9333ea 0%, #7e22ce 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(126, 34, 206, 0.5);
}

.post-card {
  background: rgba(26, 32, 44, 0.8);
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #4a5568;
  position: relative;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(126, 34, 206, 0.3);
}

.post-card:hover {
  border-color: #a855f7;
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(168, 85, 247, 0.4);
}

.post-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.author-avatar {
  width: 55px;
  height: 55px;
  border-radius: 50%;
  background: linear-gradient(135deg, #a855f7 0%, #7e22ce 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-weight: bold;
  color: white;
  border: 2px solid rgba(168, 85, 247, 0.5);
  font-size: 16px;
}

.author-info {
  flex: 1;
}

.author-name {
  font-weight: 600;
  font-size: 16px;
  color: #d8b4fe;
  margin-bottom: 4px;
}

.author-title {
  font-size: 13px;
  color: #a0aec0;
}

.post-time {
  font-size: 13px;
  color: #a855f7;
  font-weight: 500;
}

.post-content {
  margin-bottom: 20px;
}

.post-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #f3e8ff;
  line-height: 1.4;
}

.post-text {
  color: #cbd5e0;
  margin-bottom: 18px;
  line-height: 1.7;
  font-size: 15px;
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 18px;
}

.tag {
  background: rgba(126, 34, 206, 0.3);
  color: #e2e8f0;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  border: 1px solid rgba(168, 85, 247, 0.4);
  font-weight: 500;
  transition: all 0.3s;
}

.tag:hover {
  background: rgba(168, 85, 247, 0.4);
  transform: scale(1.05);
}

.post-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #4a5568;
  padding-top: 18px;
}

.like-btn {
  display: flex;
  align-items: center;
  background: none;
  border: none;
  color: #a855f7;
  cursor: pointer;
  transition: all 0.3s;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
}

.like-btn:hover {
  color: #f3e8ff;
  background: rgba(168, 85, 247, 0.2);
  transform: scale(1.05);
}

.like-count {
  margin-left: 8px;
  font-weight: 500;
}

.comment-btn {
  color: #a855f7;
  text-decoration: none;
  transition: all 0.3s;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  border: 1px solid transparent;
}

.comment-btn:hover {
  color: #f3e8ff;
  background: rgba(168, 85, 247, 0.2);
  border-color: #7e22ce;
}

.delete-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  color: #a855f7;
  cursor: pointer;
  font-size: 22px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.delete-btn:hover {
  color: #f3e8ff;
  background: rgba(168, 85, 247, 0.3);
  transform: scale(1.1);
}

/* 模态框样式 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: rgba(26, 32, 44, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 30px;
  width: 90%;
  max-width: 500px;
  border: 1px solid #4a5568;
  box-shadow: 0 10px 30px rgba(126, 34, 206, 0.4);
}

.modal-content h3 {
  margin-bottom: 24px;
  color: #d8b4fe;
  font-size: 22px;
  text-align: center;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #d8b4fe;
  font-size: 14px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #4a5568;
  border-radius: 8px;
  font-size: 14px;
  background: #2d3748;
  color: #e2e8f0;
  transition: all 0.3s;
  resize: vertical;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #a855f7;
  box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.3);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.form-actions button {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
  font-size: 14px;
}

.form-actions button[type="button"] {
  background: rgba(126, 34, 206, 0.2);
  color: #d8b4fe;
  border: 1px solid #4a5568;
}

.form-actions button[type="button"]:hover {
  background: rgba(168, 85, 247, 0.3);
  color: #f3e8ff;
}

.form-actions button[type="submit"] {
  background: linear-gradient(135deg, #7e22ce 0%, #6b21a8 100%);
  color: white;
}

.form-actions button[type="submit"]:hover {
  background: linear-gradient(135deg, #9333ea 0%, #7e22ce 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(126, 34, 206, 0.4);
}

/* 响应式调整，确保小屏幕也能正常显示 */
@media (max-width: 768px) {
  .main-content {
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    display: block; /* 小屏幕也显示侧边栏 */
    margin-bottom: 20px;
  }
  
  .header-content {
    flex-direction: column;
    gap: 15px;
  }
  
  .category-selector {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .category-selector select {
    width: 100%;
  }
  
  .post-card {
    padding: 20px;
  }
  
  .post-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .author-info {
    width: 100%;
  }
  
  .post-time {
    align-self: flex-end;
  }
}
</style>