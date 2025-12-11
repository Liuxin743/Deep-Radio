<template>
  <div class="news-view">
    <!-- 筛选和搜索 -->
    <div class="filter-section">
      <div class="search-box">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="搜索论文标题、作者或关键词..."
          @input="debouncedSearch"
        >
      </div>
      <div class="filter-controls">
        <select v-model="selectedCategory" @change="filterPapers">
          <option value="all">所有分类</option>
          <option value="cs.AI">人工智能 (cs.AI)</option>
          <option value="cs.LG">机器学习 (cs.LG)</option>
          <option value="cs.CL">计算语言学 (cs.CL)</option>
          <option value="cs.RO">机器人学 (cs.RO)</option>
        </select>
        <select v-model="sortBy" @change="sortPapers">
          <option value="updated">按更新时间</option>
          <option value="citationCount">按引用数</option>
          <option value="published">按发表时间</option>
        </select>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>正在加载最新论文数据...</p>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="error-container">
      <h3>数据加载失败</h3>
      <p>{{ error }}</p>
      <button @click="fetchAllData" class="retry-btn">重新加载</button>
    </div>

    <!-- 论文列表 -->
    <div v-else class="papers-list">
      <FrontierDynamics 
        v-for="paper in filteredPapers" 
        :key="paper.arxivId"
        :paper="paper"
      />

      <!-- 空状态 -->
      <div v-if="filteredPapers.length === 0" class="empty-state">
        <h3>未找到匹配论文</h3>
        <p>尝试调整搜索关键词或筛选条件</p>
        <button @click="resetFilters" class="reset-btn">重置筛选</button>
      </div>
    </div>

    <!-- 底部合规声明 -->
    <footer class="page-footer">
      <p>数据来源：<a href="https://arxiv.org/help/api/tos" target="_blank">arXiv API</a> | <a href="https://api.semanticscholar.org/api-docs/" target="_blank">Semantic Scholar API</a></p>
      <p>遵循 API 服务条款，仅用于学术研究，请勿商用</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import FrontierDynamics from '../components/FrontierDynamics.vue';
import { searchArXivPapers } from '@/api/arxiv';
import { fetchPaperFromSemantic } from '@/api/semanticScholar';

// 状态管理
const loading = ref(true);
const error = ref(null);
const allPapers = ref([]);
const filteredPapers = ref([]);
const totalPapers = ref(0);
const totalCitations = ref(0);
const lastUpdated = ref('');

// 筛选条件
const searchQuery = ref('');
const selectedCategory = ref('all');
const sortBy = ref('updated');

// 防抖函数
const debouncedSearch = ref(() => {});

onMounted(() => {
  debouncedSearch.value = debounce(() => filterPapers(), 300);
  fetchAllData();
});

/**
 * 拉取 arXiv + Semantic Scholar 数据
 */
async function fetchAllData() {
  loading.value = true;
  error.value = null;

  try {
    // 1. 从 arXiv 搜索 LLM-Agent 相关最新论文（30 篇）
    const arxivPapers = await searchArXivPapers(30);
    if (arxivPapers.length === 0) throw new Error('未获取到 arXiv 论文数据');

    // 2. 补充 Semantic Scholar 引用数等信息
    const papersWithSupplement = await Promise.all(
      arxivPapers.map(async (paper) => {
        const supplement = await fetchPaperFromSemantic(paper.arxivId);
        return { ...paper, ...supplement };
      })
    );

    // 3. 更新状态
    allPapers.value = papersWithSupplement;
    filteredPapers.value = papersWithSupplement;
    calculateStats();
    lastUpdated.value = new Date().toLocaleString('zh-CN');
  } catch (err) {
    error.value = err.message || '数据加载失败，请检查网络或稍后重试';
    console.error('数据拉取失败：', err);
  } finally {
    loading.value = false;
  }
}

/**
 * 筛选论文（关键词 + 分类）
 */
function filterPapers() {
  let result = [...allPapers.value];

  // 分类筛选
  if (selectedCategory.value !== 'all') {
    result = result.filter(paper => paper.category === selectedCategory.value);
  }

  // 关键词搜索
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    result = result.filter(paper => 
      paper.title.toLowerCase().includes(query) ||
      paper.authors.toLowerCase().includes(query) ||
      paper.abstract.toLowerCase().includes(query) ||
      paper.fieldsOfStudy.some(field => field.toLowerCase().includes(query))
    );
  }

  // 排序
  result = sortPapers(result);
  filteredPapers.value = result;
}

/**
 * 排序论文
 */
function sortPapers(papers = null) {
  const targetPapers = papers || [...filteredPapers.value];
  
  switch (sortBy.value) {
    case 'citationCount':
      return targetPapers.sort((a, b) => b.citationCount - a.citationCount);
    case 'published':
      return targetPapers.sort((a, b) => new Date(b.published) - new Date(a.published));
    case 'updated':
    default:
      return targetPapers.sort((a, b) => new Date(b.updated) - new Date(a.updated));
  }
}

/**
 * 计算统计信息
 */
function calculateStats() {
  totalPapers.value = allPapers.value.length;
  totalCitations.value = allPapers.value.reduce((sum, paper) => sum + paper.citationCount, 0);
}

/**
 * 重置筛选条件
 */
function resetFilters() {
  searchQuery.value = '';
  selectedCategory.value = 'all';
  sortBy.value = 'updated';
  filterPapers();
}

/**
 * 防抖工具函数
 */
function debounce(func, delay = 300) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}
</script>

<style scoped>
.news-view {
  max-width: 1320px;
  margin: 0 auto;
  padding: 24px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #2d3748;
  background-color: #fafafa;
  min-height: 100vh;
  margin-top: 40px;
  border-radius: 10px;
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e5e5e5;
}

.page-header h1 {
  font-size: 2rem;
  margin-bottom: 8px;
  color: #2d3748;
}

.page-header p {
  font-size: 1rem;
  color: #718096;
  margin-bottom: 20px;
}

.stats-container {
  display: flex;
  justify-content: center;
  gap: 40px;
  flex-wrap: wrap;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 600;
  color: #4299e1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.85rem;
  color: #718096;
}

.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.search-box {
  flex: 1;
  min-width: 200px;
}

.search-box input {
  width: 100%;
  padding: 10px 4px;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  font-size: 0.95rem;
  outline: none;
  transition: border 0.2s;
}

.search-box input:focus {
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

.filter-controls {
  display: flex;
  gap: 12px;
}

.filter-controls select {
  padding: 10px 12px;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  font-size: 0.95rem;
  background: white;
  outline: none;
  transition: border 0.2s;
  min-width: 140px;
}

.filter-controls select:focus {
  border-color: #4299e1;
}

.loading-container {
  text-align: center;
  padding: 80px 20px;
  color: #718096;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4299e1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  text-align: center;
  padding: 80px 20px;
  color: #dc3545;
}

.error-icon {
  font-size: 2.5rem;
  margin-bottom: 16px;
}

.error-container h3 {
  font-size: 1.2rem;
  margin-bottom: 8px;
}

.error-container p {
  color: #718096;
  margin-bottom: 20px;
}

.retry-btn {
  padding: 10px 20px;
  background: #4299e1;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.2s;
}

.retry-btn:hover {
  background: #3182ce;
}

.papers-list {
  display: grid;
  gap: 20px;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  color: #718096;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 16px;
  color: #cbd5e0;
}

.empty-state h3 {
  font-size: 1.2rem;
  margin-bottom: 8px;
  color: #2d3748;
}

.reset-btn {
  padding: 10px 20px;
  background: #9f7aea;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 16px;
}

.reset-btn:hover {
  background: #805ad5;
}

.page-footer {
  text-align: center;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #e5e5e5;
  font-size: 0.85rem;
  color: #718096;
}

.page-footer a {
  color: #4299e1;
  text-decoration: none;
  margin: 0 4px;
}

.page-footer a:hover {
  text-decoration: underline;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .news-view {
    padding: 16px;
  }

  .page-header h1 {
    font-size: 1.6rem;
  }

  .stats-container {
    gap: 20px;
  }

  .filter-section {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-controls {
    width: 100%;
    justify-content: space-between;
  }
}
</style>