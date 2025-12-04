<template>
  <div class="datasets-page">
    <!-- 头部 -->
    <div class="page-header">
      <!-- <h1>Awesome Public Datasets</h1> -->
      <p>高质量的主题中心公共数据源列表 - 所有链接均可点击访问</p>
      <div class="header-actions">
        <button class="btn-primary" @click="refreshData" :disabled="loading">
          {{ loading ? '刷新中...' : '刷新数据' }}
        </button>
        <!-- <a href="https://github.com/awesomedata/awesome-public-datasets" target="_blank" class="btn-secondary">
          查看GitHub仓库
        </a> -->
      </div>
    </div>

    <!-- 主要内容 -->
    <div class="main-content">
      <!-- 左侧导航 -->
      <div class="sidebar">
        <div class="search-box">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="搜索数据集..." 
            class="search-input"
          >
        </div>

        <h3>📁 数据分类</h3>
        <nav>
          <ul>
            <li v-for="category in filteredCategories" :key="category.name">
              <a :href="'#' + getCategoryId(category.name)" 
                 @click.prevent="scrollToCategory(category.name)"
                 :class="{ active: activeCategory === category.name }">
                {{ category.name }}
                <span class="dataset-count">{{ category.datasets.length }}</span>
              </a>
            </li>
          </ul>
        </nav>

        <div class="quick-links">
          <h4>🔗 热门数据源</h4>
          <div class="link-item">
            <a href="https://www.kaggle.com/datasets" target="_blank">Kaggle数据集</a>
          </div>
          <div class="link-item">
            <a href="https://archive.ics.uci.edu/" target="_blank">UCI机器学习库</a>
          </div>
          <div class="link-item">
            <a href="https://www.data.gov/" target="_blank">美国政府数据</a>
          </div>
          <div class="link-item">
            <a href="https://snap.stanford.edu/data/" target="_blank">斯坦福网络数据</a>
          </div>
        </div>

        <!-- 侧边栏统计信息 -->
        <div class="sidebar-stats">
          <div class="stat-item">
            <span class="stat-label">数据类别:</span>
            <span class="stat-value">{{ stats.totalCategories }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">数据集总数:</span>
            <span class="stat-value">{{ stats.totalDatasets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">可用数据集:</span>
            <span class="stat-value">{{ stats.okCount }}</span>
          </div>
        </div>
      </div>

      <!-- 右侧内容 -->
      <div class="content">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>正在加载数据集信息...</p>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="error-state">
          <h3>⚠️ 加载失败</h3>
          <p>{{ error }}</p>
          <button @click="refreshData" class="retry-btn">🔄 重新加载</button>
        </div>

        <!-- 搜索提示 -->
        <div v-else-if="searchQuery && filteredDatasets.length === 0" class="no-results">
          <h3>🔍 未找到匹配的数据集</h3>
          <p>尝试使用其他关键词搜索，或 <a @click="clearSearch" class="clear-link">清除搜索</a></p>
        </div>

        <!-- 数据内容 -->
        <div v-else class="datasets-content">

          <!-- 搜索结果显示 -->
          <div v-if="searchQuery" class="search-results-header">
            <h3>搜索结果 ({{ filteredDatasets.length }}个数据集)</h3>
            <button @click="clearSearch" class="clear-search-btn">清除搜索</button>
          </div>

          <!-- 数据集分类 -->
          <template v-if="!searchQuery">
            <section v-for="category in categories" :key="category.name" 
                     :id="getCategoryId(category.name)" class="category-section">
              <h2 class="category-title">
                <span class="category-icon">📂</span>
                {{ category.name }}
                <span class="category-count">({{ category.datasets.length }}个数据集)</span>
              </h2>
              
              <div class="datasets-grid">
                <div v-for="dataset in category.datasets" :key="dataset.name" class="dataset-card">
                  <div class="dataset-header">
                    <span class="status-badge" :class="dataset.status.toLowerCase()">
                      {{ dataset.status }}
                    </span>
                    <h3 class="dataset-name">
                      <a :href="dataset.link" target="_blank" class="dataset-link" @click="trackClick(dataset.name)">
                        {{ dataset.name }}
                        <span class="external-icon">↗</span>
                      </a>
                    </h3>
                  </div>
                  
                  <p class="dataset-description">{{ dataset.description }}</p>
                  
                  <div class="dataset-footer">
                    <div class="dataset-meta">
                      <span class="source-label">来源:</span>
                      <span class="source-name">{{ dataset.source }}</span>
                    </div>
                    <div class="dataset-actions">
                      <a :href="dataset.link" target="_blank" class="visit-btn" @click="trackClick(dataset.name)">
                        访问数据源
                        <span class="btn-icon">→</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </template>

          <!-- 搜索结果显示 -->
          <template v-else>
            <section class="search-results-section">
              <div class="datasets-grid">
                <div v-for="dataset in filteredDatasets" :key="dataset.name + dataset.category" class="dataset-card">
                  <div class="dataset-header">
                    <span class="status-badge" :class="dataset.status.toLowerCase()">
                      {{ dataset.status }}
                    </span>
                    <div class="dataset-category-tag">
                      {{ dataset.category }}
                    </div>
                  </div>
                  
                  <h3 class="dataset-name">
                    <a :href="dataset.link" target="_blank" class="dataset-link" @click="trackClick(dataset.name)">
                      {{ dataset.name }}
                      <span class="external-icon">↗</span>
                    </a>
                  </h3>
                  
                  <p class="dataset-description">{{ dataset.description }}</p>
                  
                  <div class="dataset-footer">
                    <div class="dataset-meta">
                      <span class="source-label">来源:</span>
                      <span class="source-name">{{ dataset.source }}</span>
                    </div>
                    <a :href="dataset.link" target="_blank" class="visit-btn" @click="trackClick(dataset.name)">
                      立即访问
                      <span class="btn-icon">→</span>
                    </a>
                  </div>
                </div>
              </div>
            </section>
          </template>
        </div>
      </div>
    </div>

    <!-- 页脚 -->
    <div class="page-footer">
      <div class="footer-content">
        <p>
          <strong>数据来源:</strong> 
          <a href="https://github.com/awesomedata/awesome-public-datasets" target="_blank">
            Awesome Public Datasets
          </a>
          | <strong>最后更新:</strong> {{ lastUpdated }}
          | <strong>数据集总数:</strong> {{ stats.totalDatasets }}
        </p>
        <p class="footer-note">
          所有链接均为真实可访问的数据源，点击即可直接查看和下载数据
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DatasetsPage',
  data() {
    return {
      loading: false,
      error: null,
      categories: [],
      lastUpdated: '-',
      searchQuery: '',
      activeCategory: '',
      apiBaseUrl: 'http://localhost:5002/api',
      clickCount: 0
    }
  },
  computed: {
    stats() {
      const totalDatasets = this.categories.reduce((sum, category) => 
        sum + category.datasets.length, 0
      );
      const okCount = this.categories.reduce((sum, category) => 
        sum + category.datasets.filter(d => d.status === 'OK').length, 0
      );

      return {
        totalCategories: this.categories.length,
        totalDatasets: totalDatasets,
        okCount: okCount,
        lastUpdated: this.lastUpdated ? new Date(this.lastUpdated).toLocaleDateString() : '-'
      }
    },
    filteredCategories() {
      if (!this.searchQuery) return this.categories;
      
      return this.categories.filter(category => 
        category.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        category.datasets.some(dataset => 
          dataset.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          dataset.description.toLowerCase().includes(this.searchQuery.toLowerCase())
        )
      );
    },
    filteredDatasets() {
      if (!this.searchQuery) return [];
      
      const results = [];
      this.categories.forEach(category => {
        category.datasets.forEach(dataset => {
          if (dataset.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
              dataset.description.toLowerCase().includes(this.searchQuery.toLowerCase())) {
            results.push({
              ...dataset,
              category: category.name
            });
          }
        });
      });
      return results;
    }
  },
  mounted() {
    this.loadData();
    this.setupIntersectionObserver();
  },
  methods: {
    async loadData() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await fetch(`${this.apiBaseUrl}/datasets`);
        
        if (!response.ok) {
          throw new Error(`HTTP错误: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result && result.success) {
          this.categories = result.data.categories || [];
          this.lastUpdated = result.data.last_updated || '-';
        } else {
          this.error = result?.error || '加载数据失败';
        }
      } catch (err) {
        this.error = `网络错误: ${err.message}`;
      } finally {
        this.loading = false;
      }
    },
    
    async refreshData() {
      await this.loadData();
    },
    
    getCategoryId(categoryName) {
      return categoryName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    },
    
    scrollToCategory(categoryName) {
      this.activeCategory = categoryName;
      const element = document.getElementById(this.getCategoryId(categoryName));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    },
    
    setupIntersectionObserver() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.activeCategory = entry.target.id.replace(/-/g, ' ');
          }
        });
      }, { threshold: 0.5 });
      
      this.$nextTick(() => {
        this.categories.forEach(category => {
          const element = document.getElementById(this.getCategoryId(category.name));
          if (element) {
            observer.observe(element);
          }
        });
      });
    },
    
    trackClick(datasetName) {
      this.clickCount++;
      console.log(`点击数据集: ${datasetName}, 总点击次数: ${this.clickCount}`);
    },
    
    clearSearch() {
      this.searchQuery = '';
    }
  }
}
</script>

<style scoped>
.datasets-page {
  max-width: 1350px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
}

/* 头部样式 */
.page-header {
  /* background: linear-gradient(335deg, #8d9bda 0%, #764ba2 100%); */
  color: white;
  padding: 10px 0;
  border-radius: 12px;
  margin-bottom: 20px;
  text-align: center;
}

.page-header h1 {
  margin-bottom: 10px;
  font-size: 2.5rem;
  font-weight: 700;
}

.page-header p {
  font-size: 1.2rem;
  opacity: 0.9;
  margin-bottom: 25px;
}

.header-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

/* 按钮样式 */
.btn-primary, .btn-secondary {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.btn-primary {
  background: #fff;
  color: #7e22ce;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-secondary {
  background: rgba(255,255,255,0.2);
  color: white;
  border: 1px solid rgba(255,255,255,0.3);
}

.btn-secondary:hover {
  background: rgba(255,255,255,0.3);
}

/* 主要内容布局 */
.main-content {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 30px;
  margin-bottom: 40px;
}

/* 侧边栏样式 */
.sidebar {
  background: #f8f9fa;
  padding: 25px;
  border-radius: 8px;
  height: fit-content;
  position: sticky;
  top: 20px;
}

.sidebar h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.3rem;
}

/* 搜索框 */
.search-box {
  margin-bottom: 25px;
}

.search-input {
  width: 100%;
  padding: 12px 0;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #7e22ce;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* 导航 */
.sidebar nav ul {
  list-style: none;
  padding: 0;
  margin: 0 0 30px 0;
}

.sidebar nav li {
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar nav a {
  color: #495057;
  text-decoration: none;
  flex: 1;
  padding: 8px 0;
  border-bottom: 1px solid transparent;
  transition: all 0.3s ease;
}

.sidebar nav a:hover {
  color: #7e22ce;
  border-bottom-color: #7e22ce;
}

.sidebar nav a.active {
  color: #7e22ce;
  font-weight: 600;
  border-bottom-color: #7e22ce;
}

.dataset-count {
  background: #e9ecef;
  color: #6c757d;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
}

/* 快速链接 */
.quick-links {
  margin-bottom: 25px;
}

.quick-links h4 {
  color: #2c3e50;
  margin-bottom: 15px;
  font-size: 1.1rem;
}

.link-item {
  margin-bottom: 8px;
}

.link-item a {
  color: #495057;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.link-item a:hover {
  color: #7e22ce;
}

/* 侧边栏统计信息 */
.sidebar-stats {
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.stat-label {
  color: #6c757d;
}

.stat-value {
  font-weight: 600;
  color: #2c3e50;
  background: #f8f9fa;
  padding: 2px 8px;
  border-radius: 4px;
}

/* 内容区域 */
.content-section {
  margin-bottom: 40px;
}

/* 介绍部分 */
.intro-section {
  background: white;
  padding: 30px;
  border-radius: 8px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.intro-section h2 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.8rem;
}

.intro-content p {
  margin-bottom: 15px;
  color: #495057;
  font-size: 1.1rem;
}

/* 特性网格 */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 25px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.feature-icon {
  font-size: 1.5rem;
}

.feature-text {
  display: flex;
  flex-direction: column;
}

.feature-text strong {
  color: #2c3e50;
  margin-bottom: 5px;
}

.feature-text span {
  color: #6c757d;
  font-size: 0.9rem;
}

/* 分类区域 */
.category-section {
  background: white;
  padding: 30px;
  border-radius: 8px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.category-title {
  color: #2c3e50;
  margin-bottom: 25px;
  font-size: 1.8rem;
  /* border-bottom: 2px solid #7e22ce; */
  padding-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.category-icon {
  font-size: 1.5rem;
}

.category-count {
  font-size: 1rem;
  color: #6c757d;
  font-weight: normal;
}

/* 数据集网格 */
.datasets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

/* 数据集卡片 */
.dataset-card {
  background: #f8f9fa;
  padding: 25px;
  border-radius: 8px;
  border-left: 4px solid #7e22ce;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: fit-content;
}

.dataset-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.dataset-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 15px;
}

/* 状态徽章 */
.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  flex-shrink: 0;
}

.status-badge.ok {
  background: #d4edda;
  color: #155724;
}

.status-badge.fixme {
  background: #f8d7da;
  color: #721c24;
}

.dataset-name {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  flex: 1;
}

.dataset-link {
  color: #2c3e50;
  text-decoration: none;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.dataset-link:hover {
  color: #7e22ce;
}

.external-icon {
  font-size: 0.8em;
  opacity: 0.7;
}

.dataset-description {
  color: #495057;
  margin-bottom: 20px;
  line-height: 1.5;
  flex: 1;
}

.dataset-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.dataset-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}

.source-label {
  color: #6c757d;
}

.source-name {
  color: #2c3e50;
  font-weight: 500;
}

.visit-btn {
  background: #a855f7;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.visit-btn:hover {
  background: #7e22ce;
  transform: translateY(-1px);
}

.btn-icon {
  font-size: 0.9em;
}

/* 搜索相关样式 */
.search-results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.search-results-header h3 {
  color: #2c3e50;
  margin: 0;
}

.clear-search-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.3s ease;
}

.clear-search-btn:hover {
  background: #545b62;
}

.dataset-category-tag {
  background: #e9ecef;
  color: #495057;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

/* 状态样式 */
.loading-state, .error-state, .no-results {
  text-align: center;
  padding: 60px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.loading-state {
  color: #6c757d;
}

.error-state {
  color: #dc3545;
  background: #f8d7da;
}

.no-results {
  color: #6c757d;
}

.retry-btn {
  margin-top: 15px;
  padding: 10px 20px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.retry-btn:hover {
  background: #c82333;
}

.clear-link {
  color: #667eea;
  cursor: pointer;
  text-decoration: none;
}

.clear-link:hover {
  text-decoration: underline;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #7e22ce;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 2s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 页脚 */
.page-footer {
  text-align: center;
  padding: 25px;
  color: #6c757d;
  border-top: 1px solid #dee2e6;
  margin-top: 50px;
}

.footer-content p {
  margin-bottom: 8px;
}

.footer-note {
  font-size: 0.9rem;
  opacity: 0.8;
}

.page-footer a {
  color: #7e22ce;
  text-decoration: none;
}

.page-footer a:hover {
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    position: static;
    margin-bottom: 20px;
  }
  
  .datasets-grid {
    grid-template-columns: 1fr;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .dataset-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .dataset-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .header-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .search-results-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .page-header {
    padding: 30px 20px;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
}
</style>