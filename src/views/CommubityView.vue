<template>
  <div class="community-view">
    <!-- 头部导航 -->
    <header class="community-header">
      <div class="container">
        <div class="header-content">
          <div class="logo">
            <i class="fas fa-satellite-dish"></i>
            <span>通信技术社区</span>
          </div>
          
          <div class="header-search">
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="搜索通信技术、5G/6G、信号处理..."
              @keyup.enter="performSearch"
            >
            <button class="search-btn" @click="performSearch">
              <i class="fas fa-search"></i>
            </button>
          </div>
          
          <div class="header-actions">
            <button class="btn notification-btn" @click="toggleNotifications">
              <i class="fas fa-bell"></i>
              <span v-if="unreadNotifications" class="notification-badge">{{ unreadNotifications }}</span>
            </button>
            <button class="btn btn-primary publish-btn" @click="showPublishModal = true">
              <i class="fas fa-plus"></i> 发帖子
            </button>
            <button class="btn btn-secondary refresh-btn" @click="refreshNews" :disabled="refreshing">
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': refreshing }"></i>
              {{ refreshing ? '更新中...' : '刷新资讯' }}
            </button>
          </div>
        </div>
      </div>
    </header>
    
    <!-- 分类导航 -->
    <div class="container">
      <div class="community-nav">
        <div class="category-tabs">
          <button 
            v-for="category in categories" 
            :key="category.value"
            class="category-tab"
            :class="{ active: selectedCategory === category.value }"
            @click="selectedCategory = category.value"
          >
            <i :class="category.icon"></i>
            {{ category.label }}
          </button>
        </div>
        
        <div class="theme-toggle">
          <button 
            class="theme-btn" 
            @click="toggleTheme"
            :title="isDarkTheme ? '切换到亮色主题' : '切换到暗色主题'"
          >
            <i :class="isDarkTheme ? 'fas fa-sun' : 'fas fa-moon'"></i>
          </button>
        </div>
      </div>
      
      <!-- 主要内容区域 -->
      <div class="main-content">
        <!-- 通信知识动态轮播 -->
        <div v-if="featuredResources.length > 0 && !selectedCategory" class="knowledge-carousel">
          <div class="carousel-container">
            <div 
              v-for="(resource, index) in featuredResources" 
              :key="resource.id"
              class="carousel-slide"
              :class="{ active: currentSlide === index }"
            >
              <div class="slide-content">
                <div class="slide-badge">{{ resource.type }}</div>
                <h3>{{ resource.title }}</h3>
                <p>{{ resource.description }}</p>
                <div class="slide-meta">
                  <span class="slide-source">{{ resource.source }}</span>
                  <span class="slide-time">{{ formatRelativeTime(resource.pubDate) }}</span>
                </div>
                <div class="slide-actions">
                  <a :href="resource.url" target="_blank" class="btn btn-outline">
                    查看详情 <i class="fas fa-arrow-right"></i>
                  </a>
                  <button class="btn btn-secondary" @click="saveResource(resource)">
                    <i class="fas fa-bookmark"></i> 收藏
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="carousel-dots">
            <button 
              v-for="(_, index) in featuredResources" 
              :key="index"
              class="dot"
              :class="{ active: currentSlide === index }"
              @click="currentSlide = index"
            ></button>
          </div>
        </div>
        
        <!-- 通信知识动态网格 -->
        <div v-if="communicationResources.length > 0" class="knowledge-dynamics">
          <div class="dynamics-header">
            <h3 class="section-title">
              <i class="fas fa-bolt"></i> 最新通信知识动态
              <span class="update-time" v-if="lastUpdate">
                (最后更新: {{ formatUpdateTime(lastUpdate) }})
              </span>
            </h3>
            <div class="view-options">
              <button class="view-btn" :class="{ active: viewMode === 'grid' }" @click="viewMode = 'grid'">
                <i class="fas fa-th-large"></i>
              </button>
              <button class="view-btn" :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'">
                <i class="fas fa-list"></i>
              </button>
              <button class="btn btn-small refresh-btn" @click="refreshNews" :disabled="refreshing">
                <i class="fas fa-sync-alt" :class="{ 'fa-spin': refreshing }"></i>
              </button>
            </div>
          </div>
          
          <!-- 加载状态 -->
          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            <p>正在获取最新通信资讯...</p>
          </div>
          
          <!-- 错误状态 -->
          <div v-if="error" class="error-state">
            <i class="fas fa-exclamation-triangle"></i>
            <p>{{ error }}</p>
            <button class="btn btn-secondary" @click="fetchCommunicationResources">重试</button>
          </div>
          
          <div class="resources-container" :class="viewMode" v-if="!loading && !error">
            <div 
              class="knowledge-card" 
              v-for="resource in filteredResources" 
              :key="resource.id"
              :class="getSourceClass(resource.source)"
            >
              <div class="knowledge-header">
                <div class="knowledge-type">{{ resource.type }}</div>
                <div class="knowledge-time">{{ formatRelativeTime(resource.pubDate) }}</div>
              </div>
              <div class="knowledge-body">
                <h4>{{ resource.title }}</h4>
                <p>{{ resource.description }}</p>
                <div class="knowledge-tags">
                  <span v-for="tag in resource.tags" :key="tag" class="knowledge-tag">
                    {{ tag }}
                  </span>
                </div>
              </div>
              <div class="knowledge-footer">
                <span class="knowledge-source">
                  <i class="fas fa-source" v-if="resource.source === '通信世界网'"></i>
                  <i class="fas fa-huawei" v-else-if="resource.source === '华为技术'"></i>
                  <i class="fas fa-newspaper" v-else></i>
                  {{ resource.source }}
                </span>
                <div class="knowledge-actions">
                  <a :href="resource.url" target="_blank" class="knowledge-link">
                    阅读全文 <i class="fas fa-external-link-alt"></i>
                  </a>
                  <button class="action-btn" @click="shareResource(resource)" title="分享">
                    <i class="fas fa-share-alt"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 社区帖子区域 -->
        <div class="community-posts">
          <div class="posts-header">
            <h3 class="section-title">
              <i class="fas fa-comments"></i> 社区技术讨论
              <span class="posts-count">({{ filteredPosts.length }})</span>
            </h3>
            <div class="posts-filter">
              <select v-model="postsSort" class="sort-select">
                <option value="newest">最新发布</option>
                <option value="hottest">最热讨论</option>
                <option value="commented">最多评论</option>
              </select>
            </div>
          </div>
          
          <!-- 快速发帖 -->
          <div class="quick-post-card">
            <div class="post-author">
              <div class="author-avatar">你</div>
            </div>
            <div class="post-input-area">
              <input 
                type="text" 
                v-model="quickPostTitle"
                placeholder="帖子标题..."
                class="post-title-input"
              >
              <textarea 
                v-model="quickPostContent"
                placeholder="分享你的通信技术见解、问题或经验..."
                class="post-content-input"
                @focus="showQuickPostOptions = true"
              ></textarea>
              <div v-if="showQuickPostOptions" class="post-options">
                <div class="option-tags">
                  <span 
                    v-for="tag in quickTags" 
                    :key="tag"
                    class="quick-tag"
                    @click="addTagToQuickPost(tag)"
                  >
                    {{ tag }}
                  </span>
                </div>
                <div class="option-actions">
                  <button class="btn btn-secondary" @click="cancelQuickPost">取消</button>
                  <button class="btn btn-primary" @click="publishQuickPost" :disabled="!quickPostContent.trim()">
                    发布帖子
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 帖子列表 -->
          <div class="posts-list">
            <div 
              class="post-card" 
              v-for="post in sortedPosts" 
              :key="post.id"
              :class="{ 'new-post': post.isNew, 'hot-post': post.likes > 20 }"
            >
              <div class="post-card-header">
                <div class="post-author-info">
                  <div class="author-avatar" :style="{ background: post.authorColor }">
                    {{ post.authorInitials }}
                  </div>
                  <div class="author-details">
                    <div class="author-name">{{ post.author }}</div>
                    <div class="post-meta">
                      <span class="post-category">{{ post.category }}</span>
                      <span class="post-time">{{ formatRelativeTime(post.time) }}</span>
                    </div>
                  </div>
                </div>
                <div class="post-actions-top">
                  <button 
                    v-if="post.author === currentUser" 
                    class="action-btn edit-btn" 
                    @click="editPost(post)"
                    title="编辑"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button 
                    v-if="post.author === currentUser" 
                    class="action-btn delete-btn" 
                    @click="deletePost(post.id)"
                    title="删除"
                  >
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
              
              <div class="post-card-body">
                <h3 class="post-title">{{ post.title }}</h3>
                <div class="post-content">
                  <p>{{ post.content }}</p>
                  
                  <div v-if="post.codeSnippet" class="post-code">
                    <div class="code-header">
                      <span class="code-language">{{ post.codeLanguage || 'python' }}</span>
                      <button class="copy-code-btn" @click="copyCode(post.codeSnippet)">
                        <i class="fas fa-copy"></i> 复制代码
                      </button>
                    </div>
                    <pre><code>{{ post.codeSnippet }}</code></pre>
                  </div>
                  
                  <div v-if="post.images && post.images.length > 0" class="post-images">
                    <div class="image-grid">
                      <div 
                        v-for="(image, index) in post.images" 
                        :key="index"
                        class="image-item"
                        @click="viewImage(image)"
                      >
                        <img :src="image" :alt="`图片${index + 1}`">
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="post-tags">
                  <span 
                    v-for="tag in post.tags" 
                    :key="tag"
                    class="post-tag"
                    @click="filterByTag(tag)"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
              
              <div class="post-card-footer">
                <div class="post-stats">
                  <button 
                    class="stat-btn like-btn" 
                    :class="{ liked: post.liked }"
                    @click="toggleLike(post)"
                  >
                    <i class="fas fa-thumbs-up"></i>
                    <span class="stat-count">{{ post.likes }}</span>
                  </button>
                  <button 
                    class="stat-btn comment-btn" 
                    @click="toggleComments(post)"
                  >
                    <i class="fas fa-comment"></i>
                    <span class="stat-count">{{ post.comments }}</span>
                  </button>
                  <button 
                    class="stat-btn bookmark-btn"
                    :class="{ bookmarked: post.bookmarked }"
                    @click="toggleBookmark(post)"
                  >
                    <i class="fas fa-bookmark"></i>
                    <span class="stat-count">{{ post.bookmarks || 0 }}</span>
                  </button>
                  <button class="stat-btn share-btn" @click="sharePost(post)">
                    <i class="fas fa-share"></i>
                  </button>
                </div>
                
                <div class="post-views">
                  <i class="fas fa-eye"></i>
                  <span>{{ post.views || 0 }} 次浏览</span>
                </div>
              </div>
              
              <!-- 评论区域 -->
              <div v-if="post.showComments" class="post-comments">
                <div class="comment-form">
                  <div class="comment-author-avatar">你</div>
                  <div class="comment-input-wrapper">
                    <input 
                      type="text" 
                      v-model="post.newComment" 
                      placeholder="写下你的评论..."
                      @keyup.enter="addComment(post)"
                    >
                    <button class="btn btn-small" @click="addComment(post)" :disabled="!post.newComment.trim()">
                      发送
                    </button>
                  </div>
                </div>
                <div class="comments-list">
                  <div v-for="comment in post.commentsList" :key="comment.id" class="comment-item">
                    <div class="comment-author-avatar">{{ comment.authorInitials }}</div>
                    <div class="comment-content">
                      <div class="comment-header">
                        <span class="comment-author">{{ comment.author }}</span>
                        <span class="comment-time">{{ comment.time }}</span>
                      </div>
                      <p class="comment-text">{{ comment.text }}</p>
                      <div class="comment-actions">
                        <button class="comment-action-btn" @click="likeComment(comment)">
                          <i class="fas fa-thumbs-up"></i> {{ comment.likes || 0 }}
                        </button>
                        <button class="comment-action-btn" @click="replyToComment(comment, post)">
                          <i class="fas fa-reply"></i> 回复
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 加载更多 -->
          <div v-if="hasMorePosts" class="load-more">
            <button class="btn btn-outline" @click="loadMorePosts">
              <i class="fas fa-plus"></i> 加载更多帖子
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 发帖子模态框 -->
    <div v-if="showPublishModal" class="modal-overlay" @click="showPublishModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3><i class="fas fa-pen"></i> 发表新帖子</h3>
          <button class="modal-close" @click="showPublishModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <form @submit.prevent="publishPost" class="publish-form">
          <div class="form-section">
            <label><i class="fas fa-heading"></i> 帖子标题 *</label>
            <input 
              type="text" 
              v-model="newPost.title" 
              placeholder="请输入帖子标题..." 
              required
              maxlength="100"
            >
            <div class="char-count">{{ newPost.title.length }}/100</div>
          </div>
          
          <div class="form-section">
            <label><i class="fas fa-align-left"></i> 帖子内容 *</label>
            <div class="post-editor">
              <textarea 
                v-model="newPost.content" 
                rows="8" 
                placeholder="详细描述你的技术问题、研究成果或经验分享..." 
                required
              ></textarea>
              <div class="editor-tools">
                <button type="button" @click="insertCodeBlock" class="tool-btn">
                  <i class="fas fa-code"></i> 插入代码
                </button>
                <button type="button" class="tool-btn" @click="triggerImageUpload">
                  <i class="fas fa-image"></i> 插入图片
                </button>
                <button type="button" @click="insertLink" class="tool-btn">
                  <i class="fas fa-link"></i> 插入链接
                </button>
              </div>
            </div>
          </div>
          
          <div class="form-section">
            <label><i class="fas fa-tags"></i> 选择分类</label>
            <div class="category-selection">
              <div 
                v-for="category in categories" 
                :key="category.value"
                class="category-option"
                :class="{ selected: newPost.category === category.value }"
                @click="newPost.category = category.value"
              >
                <i :class="category.icon"></i>
                <span>{{ category.label }}</span>
              </div>
            </div>
          </div>
          
          <div class="form-section">
            <label><i class="fas fa-hashtag"></i> 添加标签</label>
            <div class="tags-editor">
              <div class="selected-tags">
                <div 
                  v-for="tag in newPost.tags" 
                  :key="tag"
                  class="selected-tag"
                >
                  {{ tag }}
                  <button type="button" @click="removeTag(tag)" class="remove-tag-btn">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
              <div class="tag-input-wrapper">
                <input 
                  type="text" 
                  v-model="newTagInput"
                  placeholder="输入标签后按回车添加..."
                  @keyup.enter="addNewTag"
                >
                <button type="button" class="btn btn-small" @click="addNewTag">添加</button>
              </div>
              <div class="suggested-tags">
                <span 
                  v-for="tag in suggestedTags" 
                  :key="tag"
                  class="suggested-tag"
                  @click="addSuggestedTag(tag)"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" @click="showPublishModal = false">
              取消
            </button>
            <button type="submit" class="btn btn-primary">
              <i class="fas fa-paper-plane"></i> 立即发布
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- 图片查看器 -->
    <div v-if="viewingImage" class="image-viewer-overlay" @click="viewingImage = null">
      <div class="image-viewer-content" @click.stop>
        <button class="close-viewer" @click="viewingImage = null">
          <i class="fas fa-times"></i>
        </button>
        <img :src="viewingImage" alt="查看图片">
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CommunicationCommunity',
  data() {
    return {
      currentUser: '用户',
      searchQuery: '',
      selectedCategory: '',
      postsSort: 'newest',
      viewMode: 'grid',
      showPublishModal: false,
      showNotifications: false,
      showQuickPostOptions: false,
      quickPostTitle: '',
      quickPostContent: '',
      currentSlide: 0,
      loading: false,
      error: '',
      newTagInput: '',
      isDarkTheme: true,
      viewingImage: null,
      hasMorePosts: false,
      
      // 新增数据
      refreshing: false,
      lastUpdate: null,
      
      // API配置
      apiConfig: {
        baseUrl: 'http://localhost:8000', // 爬虫API地址
        endpoints: {
          news: '/api/news',
          refresh: '/api/refresh',
          health: '/api/health'
        }
      },
      
      categories: [
        { value: '', label: '全部', icon: 'fas fa-layer-group' },
        { value: '5G技术', label: '5G技术', icon: 'fas fa-tower-broadcast' },
        { value: '6G前沿', label: '6G前沿', icon: 'fas fa-satellite' },
        { value: '信号处理', label: '信号处理', icon: 'fas fa-wave-square' },
        { value: '无线通信', label: '无线通信', icon: 'fas fa-wifi' },
        { value: '网络优化', label: '网络优化', icon: 'fas fa-network-wired' },
        { value: 'AI通信', label: 'AI通信', icon: 'fas fa-brain' },
        { value: '技术问答', label: '技术问答', icon: 'fas fa-question-circle' }
      ],
      
      quickTags: ['5G', '6G', '信号处理', '无线通信', '技术问题', '经验分享', '研究进展'],
      
      suggestedTags: ['5G-A', '毫米波', '波束赋形', '信道估计', '频谱感知', '网络切片', '通感算一体', '太赫兹', 'MIMO', 'OFDM'],
      
      // 帖子数据 - 现在为空数组，用户需要自己发帖
      posts: [],
      
      newPost: {
        title: '',
        content: '',
        category: '技术问答',
        tags: []
      },
      
      // 通信知识动态
      communicationResources: [],
      
      notifications: [
        { id: 1, icon: 'fas fa-thumbs-up', message: '有人点赞了你的帖子', time: '2分钟前', read: false },
        { id: 2, icon: 'fas fa-comment', message: '你的帖子收到了新回复', time: '15分钟前', read: false },
        { id: 3, icon: 'fas fa-user-plus', message: '3个新用户关注了你', time: '1小时前', read: true }
      ]
    };
  },
  
  computed: {
    filteredPosts() {
      let filtered = this.posts;
      
      // 分类筛选
      if (this.selectedCategory) {
        filtered = filtered.filter(post => 
          post.category === this.selectedCategory || 
          post.tags.includes(this.selectedCategory)
        );
      }
      
      // 搜索筛选
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(post => 
          post.title.toLowerCase().includes(query) ||
          post.content.toLowerCase().includes(query) ||
          post.tags.some(tag => tag.toLowerCase().includes(query)) ||
          post.author.toLowerCase().includes(query)
        );
      }
      
      return filtered;
    },
    
    sortedPosts() {
      const posts = [...this.filteredPosts];
      
      switch (this.postsSort) {
        case 'hottest':
          return posts.sort((a, b) => b.likes - a.likes);
        case 'commented':
          return posts.sort((a, b) => b.comments - a.comments);
        case 'newest':
        default:
          return posts.sort((a, b) => new Date(b.time) - new Date(a.time));
      }
    },
    
    filteredResources() {
      if (!this.selectedCategory) {
        return this.communicationResources;
      }
      return this.communicationResources.filter(resource => 
        resource.type === this.selectedCategory || 
        resource.tags?.some(tag => tag === this.selectedCategory)
      );
    },
    
    featuredResources() {
      // 从爬取的数据中选择3篇作为轮播
      const resources = this.communicationResources;
      return resources.slice(0, 3).map((resource, index) => ({
        ...resource,
        id: `featured_${index}_${resource.id}`
      }));
    },
    
    unreadNotifications() {
      return this.notifications.filter(n => !n.read).length;
    }
  },
  
  methods: {
    formatRelativeTime(dateString) {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);
      
      if (diffInSeconds < 60) return '刚刚';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}分钟前`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}小时前`;
      if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}天前`;
      
      return date.toLocaleDateString('zh-CN');
    },
    
    formatUpdateTime(isoString) {
      if (!isoString) return '';
      const date = new Date(isoString);
      const now = new Date();
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      
      if (diffInMinutes < 1) return '刚刚';
      if (diffInMinutes < 60) return `${diffInMinutes}分钟前`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}小时前`;
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    },
    
    performSearch() {
      console.log('搜索通信技术:', this.searchQuery);
    },
    
    toggleLike(post) {
      post.liked = !post.liked;
      post.likes += post.liked ? 1 : -1;
      
      if (post.liked) {
        this.addNotification('fas fa-thumbs-up', `有人点赞了你的帖子：${post.title}`);
      }
    },
    
    toggleBookmark(post) {
      post.bookmarked = !post.bookmarked;
      post.bookmarks = post.bookmarked ? (post.bookmarks || 0) + 1 : Math.max(0, (post.bookmarks || 1) - 1);
    },
    
    toggleComments(post) {
      post.showComments = !post.showComments;
    },
    
    deletePost(postId) {
      if (confirm('确定删除这个帖子吗？删除后无法恢复。')) {
        const index = this.posts.findIndex(p => p.id === postId);
        if (index > -1) {
          this.posts.splice(index, 1);
          this.addNotification('fas fa-trash-alt', '你删除了一篇帖子');
        }
      }
    },
    
    editPost(post) {
      this.newPost = {
        title: post.title,
        content: post.content,
        category: post.category,
        tags: [...post.tags]
      };
      this.showPublishModal = true;
      
      // 标记为编辑模式
      this.editingPostId = post.id;
    },
    
    publishPost() {
      if (this.editingPostId) {
        // 编辑现有帖子
        const index = this.posts.findIndex(p => p.id === this.editingPostId);
        if (index > -1) {
          this.posts[index] = {
            ...this.posts[index],
            title: this.newPost.title,
            content: this.newPost.content,
            category: this.newPost.category,
            tags: this.newPost.tags,
            time: new Date().toISOString()
          };
        }
        this.editingPostId = null;
      } else {
        // 发布新帖子
        const newPost = {
          id: Date.now(),
          author: '用户',
          authorInitials: '你',
          authorColor: '#a855f7',
          title: this.newPost.title,
          content: this.newPost.content,
          category: this.newPost.category,
          time: new Date().toISOString(),
          tags: this.newPost.tags,
          likes: 0,
          liked: false,
          bookmarked: false,
          bookmarks: 0,
          comments: 0,
          views: 0,
          showComments: false,
          newComment: '',
          commentsList: [],
          isNew: true
        };
        
        this.posts.unshift(newPost);
      }
      
      this.showPublishModal = false;
      this.resetNewPost();
      this.addNotification('fas fa-check-circle', '帖子发布成功！');
    },
    
    publishQuickPost() {
      if (!this.quickPostContent.trim()) return;
      
      const newPost = {
        id: Date.now(),
        author: '用户',
        authorInitials: '你',
        authorColor: '#a855f7',
        title: this.quickPostTitle || '技术分享',
        content: this.quickPostContent,
        category: '技术问答',
        time: new Date().toISOString(),
        tags: ['快速分享'],
        likes: 0,
          liked: false,
          bookmarked: false,
          bookmarks: 0,
          comments: 0,
          views: 0,
          showComments: false,
          newComment: '',
          commentsList: [],
          isNew: true
        };
        
        this.posts.unshift(newPost);
        this.resetQuickPost();
        this.addNotification('fas fa-check-circle', '快速帖子发布成功！');
      },
      
      cancelQuickPost() {
        this.resetQuickPost();
      },
      
      resetQuickPost() {
        this.quickPostTitle = '';
        this.quickPostContent = '';
        this.showQuickPostOptions = false;
      },
      
      resetNewPost() {
        this.newPost = {
          title: '',
          content: '',
          category: '技术问答',
          tags: []
        };
        this.newTagInput = '';
      },
      
      addTagToQuickPost(tag) {
        if (!this.quickPostContent.includes(`#${tag}`)) {
          this.quickPostContent += ` #${tag}`;
        }
      },
      
      addNewTag() {
        if (this.newTagInput.trim() && !this.newPost.tags.includes(this.newTagInput.trim())) {
          this.newPost.tags.push(this.newTagInput.trim());
          this.newTagInput = '';
        }
      },
      
      addSuggestedTag(tag) {
        if (!this.newPost.tags.includes(tag)) {
          this.newPost.tags.push(tag);
        }
      },
      
      removeTag(tag) {
        this.newPost.tags = this.newPost.tags.filter(t => t !== tag);
      },
      
      filterByTag(tag) {
        this.selectedCategory = '';
        this.searchQuery = tag;
      },
      
      addComment(post) {
        if (!post.newComment.trim()) return;
        
        const newComment = {
          id: Date.now(),
          author: '评论用户',
          authorInitials: 'CU',
          text: post.newComment,
          time: '刚刚',
          likes: 0
        };
        
        post.commentsList.push(newComment);
        post.comments++;
        post.newComment = '';
        
        this.addNotification('fas fa-comment', '你的帖子收到了新评论');
      },
      
      likeComment(comment) {
        comment.likes = (comment.likes || 0) + 1;
      },
      
      replyToComment(comment, post) {
        post.newComment = `回复 ${comment.author}: `;
        if (!post.showComments) {
          post.showComments = true;
        }
      },
      
      sharePost(post) {
        const shareUrl = `${window.location.origin}/post/${post.id}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
          alert('帖子链接已复制到剪贴板！');
          this.addNotification('fas fa-share', '你分享了一篇帖子');
        });
      },
      
      shareResource(resource) {
        navigator.clipboard.writeText(resource.url).then(() => {
          alert('资源链接已复制到剪贴板！');
        });
      },
      
      saveResource(resource) {
        alert(`已收藏：${resource.title}`);
        this.addNotification('fas fa-bookmark', `你收藏了：${resource.title}`);
      },
      
      copyCode(code) {
        navigator.clipboard.writeText(code).then(() => {
          alert('代码已复制到剪贴板！');
        });
      },
      
      viewImage(image) {
        this.viewingImage = image;
      },
      
      insertCodeBlock() {
        this.newPost.content += '\n```python\n# 在这里输入你的代码\n```\n';
      },
      
      insertLink() {
        this.newPost.content += '\n[链接描述](链接地址)\n';
      },
      
      triggerImageUpload() {
        alert('图片上传功能（演示）');
      },
      
      loadMorePosts() {
        // 如果后续需要实现分页加载，可以在这里添加逻辑
        this.hasMorePosts = false;
      },
      
      toggleTheme() {
        this.isDarkTheme = !this.isDarkTheme;
        document.body.classList.toggle('light-theme', !this.isDarkTheme);
        localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light');
      },
      
      toggleNotifications() {
        this.showNotifications = !this.showNotifications;
      },
      
      markAllAsRead() {
        this.notifications.forEach(notification => {
          notification.read = true;
        });
      },
      
      addNotification(icon, message) {
        this.notifications.unshift({
          id: Date.now(),
          icon,
          message,
          time: '刚刚',
          read: false
        });
      },
      
      // 新增方法：获取通信知识动态
      async fetchCommunicationResources() {
        this.loading = true;
        this.error = '';
        
        try {
          const response = await fetch(`${this.apiConfig.baseUrl}${this.apiConfig.endpoints.news}`);
          
          if (!response.ok) {
            throw new Error(`API请求失败: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data.success && data.data) {
            this.communicationResources = data.data.map(article => ({
              id: `news_${article.id}`,
              title: article.title,
              description: article.description,
              content: article.content || article.description,
              type: article.type,
              pubDate: article.pubDate,
              source: article.source,
              url: article.url,
              tags: article.tags || []
            }));
            this.lastUpdate = data.last_update;
            
            console.log(`从API获取 ${this.communicationResources.length} 篇通信资讯`);
          } else {
            throw new Error('API返回数据格式错误');
          }
        } catch (error) {
          console.error('获取通信知识动态失败:', error);
          this.error = '获取动态失败，请检查API服务是否运行';
          
          // 使用模拟数据作为后备
          await this.getSimulatedResources();
        } finally {
          this.loading = false;
        }
      },
      
      // 模拟数据作为后备
      async getSimulatedResources() {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const currentTime = new Date();
        this.communicationResources = [
          {
            id: 'sim_1',
            title: '5G-A技术正式商用，开启万物智联新时代',
            description: '中国三大运营商宣布5G-A网络正式商用，下行峰值速率突破10Gbps，为工业互联网、车联网等应用提供更强大支撑',
            content: '近日，中国移动、中国电信、中国联通联合宣布5G-Advanced网络正式商用。新一代5G-A技术在下行峰值速率、连接密度、端到端时延等关键指标上实现全面突破。',
            type: '5G技术',
            pubDate: new Date(currentTime.getTime() - 2 * 60 * 60 * 1000).toISOString(),
            source: '行业快讯',
            url: '#',
            tags: ['5G-A', '商用', '物联网', '工业互联网']
          },
          {
            id: 'sim_2',
            title: '6G太赫兹通信实现百米级实时传输',
            description: '国内科研团队在太赫兹频段实现100Gbps实时无线传输，为6G空天地一体化网络奠定基础',
            content: '清华大学与华为联合实验室在6G关键技术研究中取得重要突破，在300GHz频段实现100Gbps实时无线传输，传输距离达到100米。',
            type: '6G前沿',
            pubDate: new Date(currentTime.getTime() - 5 * 60 * 60 * 1000).toISOString(),
            source: '科研动态',
            url: '#',
            tags: ['6G', '太赫兹', '科研突破', '无线传输']
          },
          {
            id: 'sim_3',
            title: 'AI原生通信网络白皮书发布',
            description: '国际标准组织发布AI原生通信网络架构白皮书，提出将AI能力深度嵌入通信网络各层',
            content: '3GPP、ETSI等国际标准组织联合发布AI原生通信网络架构白皮书，提出将AI能力深度嵌入通信网络各层，实现网络自优化、自修复、自演进。',
            type: 'AI通信',
            pubDate: new Date(currentTime.getTime() - 24 * 60 * 60 * 1000).toISOString(),
            source: '标准动态',
            url: '#',
            tags: ['AI', '网络架构', '3GPP', '智能化']
          },
          {
            id: 'sim_4',
            title: 'Open RAN全球部署突破50万站点',
            description: 'O-RAN联盟公布Open RAN全球部署最新数据，开源解耦的网络架构正改变传统电信设备市场格局',
            content: '根据O-RAN联盟最新报告，全球Open RAN部署站点已突破50万个，特别是在日本、美国、英国等市场取得显著进展。',
            type: '无线通信',
            pubDate: new Date(currentTime.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            source: '市场报告',
            url: '#',
            tags: ['Open RAN', 'O-RAN', '开源', '网络架构']
          },
          {
            id: 'sim_5',
            title: '卫星互联网与地面5G融合组网测试成功',
            description: '国内首次实现低轨卫星与地面5G网络深度融合组网，为全球无缝覆盖提供技术验证',
            content: '中国航天科工与中国联通联合完成低轨卫星与地面5G网络融合组网测试，实现了卫星与地面基站的无缝切换和协同传输。',
            type: '无线通信',
            pubDate: new Date(currentTime.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            source: '技术测试',
            url: '#',
            tags: ['卫星互联网', '5G', '融合组网', '低轨卫星']
          },
          {
            id: 'sim_6',
            title: '量子通信安全传输距离创新纪录',
            description: '中国科研团队实现509公里量子密钥分发，创下光纤量子通信最远距离纪录',
            content: '中国科学技术大学团队在量子通信领域取得重大突破，实现了509公里光纤量子密钥分发，刷新了该领域的世界纪录。',
            type: '前沿技术',
            pubDate: new Date(currentTime.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            source: '科研突破',
            url: '#',
            tags: ['量子通信', '网络安全', '光纤传输', '科研纪录']
          }
        ];
        this.lastUpdate = new Date().toISOString();
      },
      
      // 刷新新闻
      async refreshNews() {
        if (this.refreshing) return;
        
        this.refreshing = true;
        try {
          const response = await fetch(
            `${this.apiConfig.baseUrl}${this.apiConfig.endpoints.news}?refresh=true`,
            {
              method: 'GET'
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              await this.fetchCommunicationResources();
              this.addNotification('fas fa-sync-alt', '通信资讯已更新');
            }
          }
        } catch (error) {
          console.error('刷新失败:', error);
          this.addNotification('fas fa-exclamation-triangle', '刷新失败，请检查网络');
        } finally {
          this.refreshing = false;
        }
      },
      
      // 根据来源添加样式类
      getSourceClass(source) {
        const sourceClasses = {
          '通信世界网': 'source-cww',
          '华为技术': 'source-huawei',
          '行业快讯': 'source-industry',
          '科研动态': 'source-research',
          '标准动态': 'source-standard',
          '市场报告': 'source-market',
          '技术测试': 'source-test',
          '科研突破': 'source-breakthrough',
          '前沿技术': 'source-frontier'
        };
        return sourceClasses[source] || '';
      },
      
      // 检查API健康状态
      async checkApiHealth() {
        try {
          const response = await fetch(`${this.apiConfig.baseUrl}${this.apiConfig.endpoints.health}`);
          return response.ok;
        } catch (error) {
          return false;
        }
      }
    },
    
    mounted() {
      // 初始化主题
      const savedTheme = localStorage.getItem('theme') || 'dark';
      this.isDarkTheme = savedTheme === 'dark';
      document.body.classList.toggle('light-theme', !this.isDarkTheme);
      
      // 检查并连接API
      this.checkApiHealth().then(healthy => {
        if (healthy) {
          console.log('API服务连接正常');
          this.fetchCommunicationResources();
        } else {
          console.warn('API服务未启动，使用模拟数据');
          this.getSimulatedResources();
          this.error = '注意：API服务未连接，显示模拟数据。请确保爬虫服务正在运行。';
        }
      });
      
      // 轮播自动播放
      setInterval(() => {
        if (this.featuredResources.length > 0) {
          this.currentSlide = (this.currentSlide + 1) % this.featuredResources.length;
        }
      }, 5000);
      
      // 每30分钟自动刷新一次
      setInterval(() => {
        if (!this.loading && !this.refreshing) {
          this.fetchCommunicationResources();
        }
      }, 30 * 60 * 1000);
      
      console.log('通信技术社区已初始化');
    }
  };
</script>

<style scoped>
/* 基础样式 */
.community-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #f1f5f9;
  font-family: 'Inter', 'PingFang SC', sans-serif;
  transition: background-color 0.3s, color 0.3s;
}

body.light-theme .community-view {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  color: #334155;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 头部样式 */
.community-header {
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

body.light-theme .community-header {
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 0;
  gap: 20px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.5rem;
  font-weight: 700;
  color: #a855f7;
  white-space: nowrap;
}

.logo i {
  font-size: 1.8rem;
}

.header-search {
  flex: 1;
  max-width: 600px;
  position: relative;
}

.header-search input {
  width: 100%;
  padding: 12px 20px;
  padding-right: 50px;
  border-radius: 25px;
  border: 1px solid rgba(168, 85, 247, 0.3);
  background: rgba(30, 41, 59, 0.8);
  color: #f1f5f9;
  font-size: 14px;
  transition: all 0.3s;
}

body.light-theme .header-search input {
  background: rgba(255, 255, 255, 0.9);
  color: #334155;
  border: 1px solid rgba(168, 85, 247, 0.2);
}

.header-search input:focus {
  outline: none;
  border-color: #a855f7;
  box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.2);
}

.search-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #a855f7;
  cursor: pointer;
  padding: 5px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.notification-btn {
  position: relative;
  background: none;
  border: none;
  color: #cbd5e1;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s;
}

.notification-btn:hover {
  background: rgba(168, 85, 247, 0.1);
  color: #a855f7;
}

.notification-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #ef4444;
  color: white;
  font-size: 12px;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

.publish-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 25px;
  font-weight: 500;
}

.refresh-btn {
  padding: 8px 15px;
  font-size: 13px;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 社区导航 */
.community-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

body.light-theme .community-nav {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.category-tabs {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  overflow-x: auto;
  padding-bottom: 5px;
}

.category-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 25px;
  color: #cbd5e1;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  white-space: nowrap;
}

body.light-theme .category-tab {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.1);
  color: #64748b;
}

.category-tab:hover {
  background: rgba(168, 85, 247, 0.1);
  color: #a855f7;
}

.category-tab.active {
  background: #a855f7;
  color: white;
  border-color: #a855f7;
}

.category-tab i {
  font-size: 14px;
}

.theme-btn {
  background: rgba(168, 85, 247, 0.1);
  border: 1px solid rgba(168, 85, 247, 0.3);
  color: #a855f7;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.theme-btn:hover {
  background: rgba(168, 85, 247, 0.2);
  transform: rotate(30deg);
}

/* 主要内容区域 */
.main-content {
  padding: 30px 0;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* 通信知识轮播 */
.knowledge-carousel {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9));
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(168, 85, 247, 0.3);
  box-shadow: 0 8px 32px rgba(168, 85, 247, 0.2);
}

.carousel-container {
  position: relative;
  height: 320px;
}

.carousel-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.5s ease-in-out;
  padding: 40px;
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(99, 102, 241, 0.1));
}

.carousel-slide.active {
  opacity: 1;
}

.slide-badge {
  display: inline-block;
  background: rgba(168, 85, 247, 0.3);
  color: #a855f7;
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 12px;
  margin-bottom: 20px;
}

.slide-content h3 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 15px;
  color: white;
}

.slide-content p {
  color: #cbd5e1;
  margin-bottom: 25px;
  line-height: 1.6;
  font-size: 15px;
}

.slide-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  font-size: 14px;
  color: #94a3b8;
}

.slide-source {
  background: rgba(168, 85, 247, 0.1);
  padding: 4px 10px;
  border-radius: 12px;
}

.slide-time {
  font-size: 13px;
}

.slide-actions {
  display: flex;
  gap: 15px;
}

.carousel-dots {
  display: flex;
  justify-content: center;
  gap: 10px;
  padding: 20px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(168, 85, 247, 0.3);
  border: none;
  cursor: pointer;
  transition: all 0.3s;
}

.dot.active {
  background: #a855f7;
  transform: scale(1.2);
}

/* 通信知识动态 */
.knowledge-dynamics {
  background: rgba(30, 41, 59, 0.8);
  border-radius: 16px;
  padding: 25px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.dynamics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  font-weight: 700;
  color: #a855f7;
}

.section-title i {
  font-size: 22px;
}

.update-time {
  font-size: 14px;
  color: #94a3b8;
  font-weight: normal;
  margin-left: 10px;
}

.view-options {
  display: flex;
  gap: 8px;
}

.view-btn {
  background: rgba(168, 85, 247, 0.1);
  border: 1px solid rgba(168, 85, 247, 0.3);
  color: #a855f7;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.view-btn:hover {
  background: rgba(168, 85, 247, 0.2);
}

.view-btn.active {
  background: #a855f7;
  color: white;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 40px;
  background: rgba(30, 41, 59, 0.5);
  border-radius: 12px;
  margin: 20px 0;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(168, 85, 247, 0.3);
  border-top-color: #a855f7;
  border-radius: 50%;
  margin: 0 auto 15px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state i {
  font-size: 40px;
  color: #ef4444;
  margin-bottom: 15px;
}

.error-state p {
  color: #ef4444;
  margin-bottom: 15px;
}

.resources-container {
  display: grid;
  gap: 20px;
}

.resources-container.grid {
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.resources-container.list {
  grid-template-columns: 1fr;
}

.knowledge-card {
  background: rgba(15, 23, 42, 0.5);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s;
}

body.light-theme .knowledge-card {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.knowledge-card:hover {
  border-color: #a855f7;
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(168, 85, 247, 0.2);
}

/* 来源样式 */
.source-cww {
  border-left: 4px solid #3b82f6;
}

.source-huawei {
  border-left: 4px solid #ef4444;
}

.source-industry {
  border-left: 4px solid #10b981;
}

.source-research {
  border-left: 4px solid #8b5cf6;
}

.source-standard {
  border-left: 4px solid #f59e0b;
}

.source-market {
  border-left: 4px solid #ec4899;
}

.source-test {
  border-left: 4px solid #06b6d4;
}

.source-breakthrough {
  border-left: 4px solid #8b5cf6;
}

.source-frontier {
  border-left: 4px solid #84cc16;
}

.knowledge-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.knowledge-type {
  background: rgba(168, 85, 247, 0.1);
  color: #a855f7;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: 500;
}

.knowledge-time {
  font-size: 12px;
  color: #94a3b8;
}

.knowledge-body h4 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #f1f5f9;
  line-height: 1.3;
}

body.light-theme .knowledge-body h4 {
  color: #334155;
}

.knowledge-body p {
  color: #94a3b8;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 15px;
}

.knowledge-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.knowledge-tag {
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.knowledge-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.knowledge-source {
  font-size: 12px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 6px;
}

.knowledge-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.knowledge-link {
  color: #a855f7;
  text-decoration: none;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.3s;
}

.knowledge-link:hover {
  color: #d8b4fe;
  gap: 8px;
}

.action-btn {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 5px;
  border-radius: 6px;
  transition: all 0.3s;
}

.action-btn:hover {
  background: rgba(168, 85, 247, 0.1);
  color: #a855f7;
}

/* 社区帖子区域 */
.community-posts {
  background: rgba(30, 41, 59, 0.8);
  border-radius: 16px;
  padding: 25px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.posts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.posts-count {
  color: #94a3b8;
  font-size: 16px;
  font-weight: normal;
  margin-left: 5px;
}

.posts-filter {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sort-select {
  padding: 8px 15px;
  border: 1px solid rgba(168, 85, 247, 0.3);
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.5);
  color: #f1f5f9;
  font-size: 14px;
  cursor: pointer;
}

body.light-theme .sort-select {
  background: rgba(255, 255, 255, 0.9);
  color: #334155;
}

/* 快速发帖卡片 */
.quick-post-card {
  background: rgba(15, 23, 42, 0.5);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(168, 85, 247, 0.3);
  margin-bottom: 25px;
  transition: all 0.3s;
}

.quick-post-card:hover {
  border-color: #a855f7;
  box-shadow: 0 5px 15px rgba(168, 85, 247, 0.2);
}

.post-author {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.author-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #a855f7, #7e22ce);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-right: 15px;
}

.post-input-area {
  width: 100%;
}

.post-title-input {
  width: 100%;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid rgba(168, 85, 247, 0.3);
  background: rgba(15, 23, 42, 0.5);
  color: #f1f5f9;
  font-size: 15px;
  margin-bottom: 12px;
  transition: all 0.3s;
}

body.light-theme .post-title-input {
  background: rgba(255, 255, 255, 0.9);
  color: #334155;
}

.post-title-input:focus {
  outline: none;
  border-color: #a855f7;
}

.post-content-input {
  width: 100%;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid rgba(168, 85, 247, 0.3);
  background: rgba(15, 23, 42, 0.5);
  color: #f1f5f9;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;
  transition: all 0.3s;
  font-family: inherit;
}

body.light-theme .post-content-input {
  background: rgba(255, 255, 255, 0.9);
  color: #334155;
}

.post-content-input:focus {
  outline: none;
  border-color: #a855f7;
}

.post-options {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.option-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 15px;
}

.quick-tag {
  background: rgba(168, 85, 247, 0.1);
  color: #a855f7;
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid rgba(168, 85, 247, 0.2);
}

.quick-tag:hover {
  background: rgba(168, 85, 247, 0.2);
  transform: translateY(-2px);
}

.option-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 帖子列表 */
.posts-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.post-card {
  background: rgba(15, 23, 42, 0.5);
  border-radius: 12px;
  padding: 25px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s;
}

body.light-theme .post-card {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.post-card:hover {
  border-color: #a855f7;
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(168, 85, 247, 0.2);
}

.post-card.new-post {
  border-color: #a855f7;
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(168, 85, 247, 0.1));
}

.post-card.hot-post {
  border-color: #f59e0b;
}

.post-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.post-author-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.author-details {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-weight: 600;
  font-size: 16px;
  color: #f1f5f9;
  margin-bottom: 4px;
}

body.light-theme .author-name {
  color: #334155;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.post-category {
  background: rgba(168, 85, 247, 0.1);
  color: #a855f7;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.post-time {
  font-size: 12px;
  color: #94a3b8;
}

.post-actions-top {
  display: flex;
  gap: 8px;
}

.edit-btn {
  color: #3b82f6;
}

.edit-btn:hover {
  background: rgba(59, 130, 246, 0.1);
  color: #60a5fa;
}

.delete-btn {
  color: #ef4444;
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
}

.post-card-body {
  margin-bottom: 20px;
}

.post-title {
  font-size: 20px;
  font-weight: 700;
  color: #f1f5f9;
  margin-bottom: 15px;
  line-height: 1.3;
}

body.light-theme .post-title {
  color: #334155;
}

.post-content {
  color: #cbd5e1;
  line-height: 1.6;
  margin-bottom: 20px;
  font-size: 15px;
}

body.light-theme .post-content {
  color: #64748b;
}

.post-code {
  background: #1e293b;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.code-language {
  color: #a855f7;
  font-size: 13px;
  font-weight: 500;
}

.copy-code-btn {
  background: rgba(168, 85, 247, 0.1);
  color: #a855f7;
  border: 1px solid rgba(168, 85, 247, 0.3);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s;
}

.copy-code-btn:hover {
  background: rgba(168, 85, 247, 0.2);
  transform: translateY(-2px);
}

.post-code pre {
  margin: 0;
  overflow-x: auto;
}

.post-code code {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 13px;
  color: #e2e8f0;
  line-height: 1.5;
}

.post-images {
  margin: 16px 0;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
}

.image-item {
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.image-item:hover {
  transform: scale(1.05);
  border-color: #a855f7;
}

.image-item img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  display: block;
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
}

.post-tag {
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.post-tag:hover {
  background: rgba(99, 102, 241, 0.2);
  transform: translateY(-2px);
}

.post-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.post-stats {
  display: flex;
  gap: 15px;
}

.stat-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
}

body.light-theme .stat-btn {
  background: rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.1);
  color: #64748b;
}

.stat-btn:hover {
  background: rgba(168, 85, 247, 0.1);
  color: #a855f7;
  border-color: rgba(168, 85, 247, 0.3);
}

.stat-btn.liked {
  background: rgba(168, 85, 247, 0.2);
  color: #a855f7;
  border-color: rgba(168, 85, 247, 0.4);
}

.stat-btn.bookmarked {
  color: #f59e0b;
}

.stat-btn.bookmarked:hover {
  background: rgba(245, 158, 11, 0.1);
}

.stat-count {
  font-weight: 500;
  min-width: 16px;
  text-align: center;
}

.post-views {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #94a3b8;
  font-size: 13px;
}

/* 评论区域 */
.post-comments {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.comment-form {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  margin-bottom: 20px;
}

.comment-author-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981, #34d399);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.comment-input-wrapper {
  flex: 1;
  display: flex;
  gap: 10px;
}

.comment-input-wrapper input {
  flex: 1;
  padding: 10px 16px;
  border-radius: 20px;
  border: 1px solid rgba(168, 85, 247, 0.3);
  background: rgba(15, 23, 42, 0.5);
  color: #f1f5f9;
  font-size: 14px;
}

body.light-theme .comment-input-wrapper input {
  background: rgba(255, 255, 255, 0.9);
  color: #334155;
}

.comment-input-wrapper input:focus {
  outline: none;
  border-color: #a855f7;
}

.btn-small {
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 13px;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.comment-item {
  display: flex;
  gap: 12px;
  padding: 15px;
  background: rgba(15, 23, 42, 0.3);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

body.light-theme .comment-item {
  background: rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.comment-author {
  font-weight: 600;
  font-size: 14px;
  color: #f1f5f9;
}

body.light-theme .comment-author {
  color: #334155;
}

.comment-time {
  font-size: 11px;
  color: #94a3b8;
}

.comment-text {
  color: #cbd5e1;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 10px;
}

body.light-theme .comment-text {
  color: #64748b;
}

.comment-actions {
  display: flex;
  gap: 15px;
}

.comment-action-btn {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.3s;
}

.comment-action-btn:hover {
  color: #a855f7;
}

/* 加载更多 */
.load-more {
  text-align: center;
  padding: 30px 0;
}

/* 按钮样式 */
.btn {
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary {
  background: linear-gradient(135deg, #a855f7, #7e22ce);
  color: white;
  border: none;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #c084fc, #a855f7);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(168, 85, 247, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

body.light-theme .btn-secondary {
  background: rgba(0, 0, 0, 0.05);
  color: #64748b;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.btn-outline {
  background: transparent;
  color: #a855f7;
  border: 1px solid #a855f7;
}

.btn-outline:hover {
  background: rgba(168, 85, 247, 0.1);
  transform: translateY(-2px);
}

/* 模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background: linear-gradient(135deg, #1e293b, #0f172a);
  border-radius: 20px;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}

body.light-theme .modal-content {
  background: linear-gradient(135deg, #ffffff, #f8fafc);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

body.light-theme .modal-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.modal-header h3 {
  font-size: 22px;
  font-weight: 700;
  color: #a855f7;
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-close {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 20px;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  transition: all 0.3s;
}

.modal-close:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.publish-form {
  padding: 30px;
}

.form-section {
  margin-bottom: 25px;
}

.form-section label {
  display: block;
  font-weight: 500;
  color: #a855f7;
  margin-bottom: 10px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-section input,
.form-section textarea {
  width: 100%;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid rgba(168, 85, 247, 0.3);
  background: rgba(15, 23, 42, 0.5);
  color: #f1f5f9;
  font-size: 14px;
  transition: all 0.3s;
}

body.light-theme .form-section input,
body.light-theme .form-section textarea {
  background: rgba(255, 255, 255, 0.9);
  color: #334155;
}

.form-section input:focus,
.form-section textarea:focus {
  outline: none;
  border-color: #a855f7;
  box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.2);
}

.char-count {
  text-align: right;
  font-size: 12px;
  color: #94a3b8;
  margin-top: 4px;
}

.post-editor textarea {
  min-height: 200px;
  resize: vertical;
  font-family: inherit;
}

.editor-tools {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.tool-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(168, 85, 247, 0.1);
  color: #a855f7;
  border: 1px solid rgba(168, 85, 247, 0.2);
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
}

.tool-btn:hover {
  background: rgba(168, 85, 247, 0.2);
  transform: translateY(-2px);
}

.category-selection {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
}

.category-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 15px;
  border: 2px solid rgba(168, 85, 247, 0.2);
  border-radius: 12px;
  background: rgba(168, 85, 247, 0.05);
  color: #a855f7;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
}

.category-option:hover {
  background: rgba(168, 85, 247, 0.1);
  border-color: rgba(168, 85, 247, 0.4);
}

.category-option.selected {
  background: #a855f7;
  color: white;
  border-color: #a855f7;
}

.category-option i {
  font-size: 20px;
}

.category-option span {
  font-size: 13px;
  font-weight: 500;
}

.tags-editor {
  border: 1px solid rgba(168, 85, 247, 0.3);
  border-radius: 12px;
  padding: 16px;
  background: rgba(15, 23, 42, 0.3);
}

body.light-theme .tags-editor {
  background: rgba(255, 255, 255, 0.9);
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 15px;
}

.selected-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(168, 85, 247, 0.2);
  color: #a855f7;
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 13px;
}

.remove-tag-btn {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
}

.tag-input-wrapper {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.tag-input-wrapper input {
  flex: 1;
}

.suggested-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.suggested-tag {
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.suggested-tag:hover {
  background: rgba(99, 102, 241, 0.2);
  transform: translateY(-2px);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
}

/* 图片查看器 */
.image-viewer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
}

.image-viewer-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
}

.close-viewer {
  position: absolute;
  top: -40px;
  right: 0;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: all 0.3s;
}

.close-viewer:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg);
}

.image-viewer-content img {
  max-width: 100%;
  max-height: calc(90vh - 50px);
  border-radius: 8px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .category-selection {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 15px;
  }
  
  .header-search {
    max-width: 100%;
    order: 3;
    width: 100%;
  }
  
  .community-nav {
    flex-direction: column;
    gap: 15px;
  }
  
  .category-tabs {
    width: 100%;
    overflow-x: auto;
    padding-bottom: 10px;
  }
  
  .carousel-slide {
    padding: 30px 20px;
  }
  
  .slide-content h3 {
    font-size: 20px;
  }
  
  .dynamics-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .view-options {
    align-self: flex-end;
  }
  
  .resources-container.grid {
    grid-template-columns: 1fr;
  }
  
  .posts-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .posts-filter {
    align-self: flex-end;
  }
  
  .post-card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .post-actions-top {
    align-self: flex-end;
  }
  
  .post-stats {
    flex-wrap: wrap;
  }
  
  .modal-content {
    width: 95%;
    margin: 10px;
  }
  
  .category-selection {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .header-actions .refresh-btn {
    display: none;
  }
  
  .update-time {
    display: block;
    margin-left: 0;
    margin-top: 5px;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 15px;
  }
  
  .carousel-container {
    height: 280px;
  }
  
  .slide-actions {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .knowledge-card,
  .post-card,
  .quick-post-card {
    padding: 20px 15px;
  }
  
  .post-stats {
    gap: 10px;
  }
  
  .stat-btn {
    padding: 6px 12px;
    font-size: 13px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .form-actions .btn {
    width: 100%;
  }
}
</style>