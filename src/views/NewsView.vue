<!-- src/views/NewsView.vue -->
<template>
  <div class="news-view">
<<<<<<< HEAD
    <!-- 页面头部 -->
    <header class="news-header">
      <!-- <div class="container">
        <div class="header-content">
          <div class="logo">
            <h1>AI技术资讯</h1>
          </div>
        </div>
      </div> -->
    </header>

=======
>>>>>>> f27f34f6745d6ea2cad2519642d24f8d6287769d
    <div class="container">
      <div class="news-content">
        <!-- 侧边导航 -->
        <aside class="sidebar">
          <div class="filter-section">
<<<<<<< HEAD
            <h3>📊 技术领域</h3>
=======
            <h3>技术领域</h3>
>>>>>>> f27f34f6745d6ea2cad2519642d24f8d6287769d
            <div class="filter-tags">
              <button 
                v-for="field in techFields" 
                :key="field.id"
                class="filter-tag"
                :class="{ active: selectedField === field.id }"
                @click="selectField(field.id)"
              >
                {{ field.name }}
                <span class="tag-count">{{ field.count }}</span>
              </button>
            </div>
          </div>

          <div class="filter-section">
<<<<<<< HEAD
            <h3>📅 时间范围</h3>
=======
            <h3>时间范围</h3>
>>>>>>> f27f34f6745d6ea2cad2519642d24f8d6287769d
            <div class="time-filters">
              <button 
                v-for="period in timePeriods" 
                :key="period.id"
                class="time-filter"
                :class="{ active: selectedPeriod === period.id }"
                @click="selectPeriod(period.id)"
              >
                {{ period.name }}
              </button>
            </div>
          </div>

          <div class="trending-section">
<<<<<<< HEAD
            <h3>🔥 热门研究方向</h3>
=======
            <h3>热门研究方向</h3>
>>>>>>> f27f34f6745d6ea2cad2519642d24f8d6287769d
            <div class="trending-list">
              <div 
                v-for="trend in trendingTopics" 
                :key="trend.id"
                class="trending-item"
              >
<<<<<<< HEAD
                <span class="trend-rank">#{{ trend.rank }}</span>
=======
                <span class="trend-rank">{{ trend.rank }}</span>
>>>>>>> f27f34f6745d6ea2cad2519642d24f8d6287769d
                <span class="trend-name">{{ trend.name }}</span>
                <span class="trend-growth" :class="getTrendClass(trend.growth)">
                  {{ trend.growth > 0 ? '+' : '' }}{{ trend.growth }}%
                </span>
              </div>
            </div>
          </div>
        </aside>

        <!-- 主内容区 -->
        <main class="main-content">
          <!-- 搜索和排序 -->
          <div class="controls-bar">
            <div class="search-box">
              <input 
                type="text" 
                v-model="searchQuery"
                placeholder="搜索论文、技术或关键词..."
                class="search-input"
              >
<<<<<<< HEAD
              <button class="search-btn">🔍</button>
=======
              <button class="search-btn">搜索</button>
>>>>>>> f27f34f6745d6ea2cad2519642d24f8d6287769d
            </div>
            <div class="sort-options">
              <select v-model="sortBy" class="sort-select">
                <option value="date">按时间排序</option>
<<<<<<< HEAD
=======
                <option value="relevance">按相关性</option>
>>>>>>> f27f34f6745d6ea2cad2519642d24f8d6287769d
                <option value="citations">引用量</option>
                <option value="impact">影响力</option>
              </select>
            </div>
          </div>

          <!-- 突破性进展 -->
          <section class="breakthroughs-section">
<<<<<<< HEAD
            <h2>🚀 突破性进展</h2>
=======
            <h2>突破性进展</h2>
>>>>>>> f27f34f6745d6ea2cad2519642d24f8d6287769d
            <div class="breakthroughs-grid">
              <div 
                v-for="breakthrough in breakthroughs" 
                :key="breakthrough.id"
                class="breakthrough-card"
<<<<<<< HEAD
                :class="breakthrough.impact"
              >
                <div class="breakthrough-badge">{{ breakthrough.badge }}</div>
                <h3 class="breakthrough-title">{{ breakthrough.title }}</h3>
                <p class="breakthrough-desc">{{ breakthrough.description }}</p>
                <div class="breakthrough-meta">
                  <span class="meta-item">
                    <span class="meta-icon">🏢</span>
                    {{ breakthrough.institution }}
                  </span>
                  <span class="meta-item">
                    <span class="meta-icon">📅</span>
                    {{ breakthrough.date }}
                  </span>
=======
              >
                <div class="breakthrough-header">
                  <span class="breakthrough-badge">{{ breakthrough.badge }}</span>
                  <span class="breakthrough-date">{{ breakthrough.date }}</span>
                </div>
                <h3 class="breakthrough-title">{{ breakthrough.title }}</h3>
                <p class="breakthrough-desc">{{ breakthrough.description }}</p>
                <div class="breakthrough-meta">
                  <span class="meta-item">{{ breakthrough.institution }}</span>
                  <span class="meta-item">{{ breakthrough.citations }} 引用</span>
>>>>>>> f27f34f6745d6ea2cad2519642d24f8d6287769d
                </div>
                <div class="breakthrough-tags">
                  <span 
                    v-for="tag in breakthrough.tags" 
                    :key="tag"
                    class="tech-tag"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <!-- 技术文章列表 -->
          <section class="articles-section">
<<<<<<< HEAD
            <h2>📚 最新研究</h2>
=======
            <h2>最新研究</h2>
>>>>>>> f27f34f6745d6ea2cad2519642d24f8d6287769d
            <div class="articles-list">
              <article 
                v-for="article in filteredArticles" 
                :key="article.id"
                class="article-card"
              >
                <div class="article-header">
                  <h3 class="article-title">
                    <a :href="article.link" target="_blank">{{ article.title }}</a>
                  </h3>
                  <div class="article-meta">
                    <span class="authors">{{ article.authors.join(', ') }}</span>
<<<<<<< HEAD
=======
                    <span class="journal">{{ article.journal }}</span>
>>>>>>> f27f34f6745d6ea2cad2519642d24f8d6287769d
                    <span class="date">{{ article.date }}</span>
                  </div>
                </div>
                <p class="article-abstract">{{ article.abstract }}</p>
                <div class="article-footer">
                  <div class="article-stats">
<<<<<<< HEAD
                    <span class="stat">
                      <span class="stat-icon">📊</span>
                      {{ article.citations }} 引用
                    </span>
                    <span class="stat">
                      <span class="stat-icon">⭐</span>
                      {{ article.impactFactor }} 影响因子
                    </span>
                  </div>
                  <div class="article-actions">
                    <button class="action-btn" @click="saveArticle(article)">
                      💾 收藏
                    </button>
                    <button class="action-btn" @click="downloadPaper(article)">
                      📥 PDF
                    </button>
                  </div>
                </div>
                <div class="article-tags">
                  <span 
                    v-for="tag in article.tags" 
                    :key="tag"
                    class="tag"
                  >
                    {{ tag }}
                  </span>
                </div>
=======
                    <span class="stat">{{ article.citations }} 引用</span>
                    <span class="stat">影响因子 {{ article.impactFactor }}</span>
                  </div>
                  <div class="article-actions">
                    <button class="action-btn" @click="saveArticle(article)">收藏</button>
                    <button class="action-btn" @click="shareArticle(article)">分享</button>
                    <button class="action-btn" @click="downloadPaper(article)">PDF</button>
                  </div>
                </div>
>>>>>>> f27f34f6745d6ea2cad2519642d24f8d6287769d
              </article>
            </div>
          </section>

<<<<<<< HEAD
          <!-- 研究工具（简化版） -->
          <section class="tools-section">
            <h2>🛠️ 研究工具</h2>
            <div class="tools-grid">
              <div class="tool-card">
                <div class="tool-icon">🔍</div>
                <h3>论文检索</h3>
                <button class="tool-btn">使用工具</button>
              </div>
              <div class="tool-card">
                <div class="tool-icon">📊</div>
                <h3>数据分析</h3>
                <button class="tool-btn">使用工具</button>
              </div>
              <div class="tool-card">
                <div class="tool-icon">📚</div>
                <h3>文献管理</h3>
                <button class="tool-btn">使用工具</button>
=======
          <!-- 技术趋势 -->
          <section class="trends-section">
            <h2>技术趋势分析</h2>
            <div class="trends-content">
              <div class="trends-list">
                <div 
                  v-for="trend in researchTrends" 
                  :key="trend.technology"
                  class="trend-item"
                >
                  <div class="trend-info">
                    <span class="trend-name">{{ trend.technology }}</span>
                    <span class="trend-growth">{{ trend.growth }}%</span>
                  </div>
                  <div class="trend-bar">
                    <div 
                      class="trend-progress" 
                      :style="{ width: trend.growth + '%' }"
                      :class="getTrendColor(trend.growth)"
                    ></div>
                  </div>
                </div>
>>>>>>> f27f34f6745d6ea2cad2519642d24f8d6287769d
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
<<<<<<< HEAD
import { ref, computed } from 'vue'
=======
import { ref, computed, onMounted } from 'vue'
>>>>>>> f27f34f6745d6ea2cad2519642d24f8d6287769d

// 技术领域
const techFields = ref([
  { id: 'all', name: '全部领域', count: 1247 },
  { id: 'nlp', name: '自然语言处理', count: 342 },
  { id: 'cv', name: '计算机视觉', count: 298 },
  { id: 'rl', name: '强化学习', count: 156 },
  { id: 'gan', name: '生成对抗网络', count: 187 },
  { id: 'transformer', name: 'Transformer', count: 264 }
])

const selectedField = ref('all')

// 时间范围
const timePeriods = ref([
  { id: 'week', name: '本周' },
  { id: 'month', name: '本月' },
  { id: 'quarter', name: '本季度' },
  { id: 'year', name: '本年' }
])

const selectedPeriod = ref('month')

// 热门话题
const trendingTopics = ref([
  { id: 1, name: '多模态大模型', rank: 1, growth: 45 },
  { id: 2, name: '扩散模型', rank: 2, growth: 32 },
  { id: 3, name: '联邦学习', rank: 3, growth: 28 },
  { id: 4, name: '神经渲染', rank: 4, growth: 25 },
  { id: 5, name: 'AI安全', rank: 5, growth: 22 }
])

// 突破性进展
const breakthroughs = ref([
  {
    id: 1,
    badge: 'SOTA',
    title: 'GPT-4V在多模态理解上的突破',
<<<<<<< HEAD
    description: '新一代视觉语言模型在多项基准测试中刷新记录',
    institution: 'OpenAI',
    date: '2024-01-15',
    citations: 1245,
    tags: ['多模态', '大语言模型', '计算机视觉'],
    impact: 'high'
=======
    description: '新一代视觉语言模型在多项基准测试中刷新记录，在图像理解、文本生成等任务上表现优异。',
    institution: 'OpenAI',
    date: '2024-01-15',
    citations: 1245,
    tags: ['多模态', '大语言模型', '计算机视觉']
>>>>>>> f27f34f6745d6ea2cad2519642d24f8d6287769d
  },
  {
    id: 2,
    badge: '创新',
<<<<<<< HEAD
    title: '新型扩散模型生成质量提升200%',
    description: '基于物理启发的采样方法大幅提升生成效率',
    institution: 'Google Research',
    date: '2024-01-12',
    citations: 876,
    tags: ['扩散模型', '生成式AI', '优化算法'],
    impact: 'medium'
=======
    title: '新型扩散模型生成质量提升',
    description: '基于物理启发的采样方法大幅提升生成效率，在图像质量和生成速度上取得平衡。',
    institution: 'Google Research',
    date: '2024-01-12',
    citations: 876,
    tags: ['扩散模型', '生成式AI', '优化算法']
  },
  {
    id: 3,
    badge: '突破',
    title: '联邦学习隐私保护新框架',
    description: '在保持模型性能的同时实现更强的隐私保护，为分布式学习提供新的解决方案。',
    institution: 'MIT',
    date: '2024-01-10',
    citations: 543,
    tags: ['联邦学习', '隐私保护', '分布式学习']
>>>>>>> f27f34f6745d6ea2cad2519642d24f8d6287769d
  }
])

// 研究文章
const articles = ref([
  {
    id: 1,
    title: '基于Transformer的多模态预训练模型综述',
    authors: ['Wang, X.', 'Li, Y.', 'Zhang, Z.'],
    journal: 'IEEE TPAMI',
    date: '2024-01-15',
<<<<<<< HEAD
    abstract: '本文系统综述了多模态Transformer的最新进展，包括模型架构、预训练策略和应用场景...',
=======
    abstract: '本文系统综述了多模态Transformer的最新进展，包括模型架构、预训练策略和应用场景，分析了当前技术面临的挑战和未来发展方向。',
>>>>>>> f27f34f6745d6ea2cad2519642d24f8d6287769d
    citations: 342,
    impactFactor: 24.3,
    tags: ['Transformer', '多模态', '预训练'],
    link: '#',
    field: 'nlp'
  },
  {
    id: 2,
    title: '扩散模型在图像生成中的理论分析',
    authors: ['Chen, H.', 'Liu, M.', 'Yang, K.'],
    journal: 'NeurIPS 2024',
    date: '2024-01-12',
<<<<<<< HEAD
    abstract: '从理论角度分析了扩散模型的收敛性和采样效率，提出了改进的训练算法...',
=======
    abstract: '从理论角度分析了扩散模型的收敛性和采样效率，提出了改进的训练算法，在多个数据集上验证了方法的有效性。',
>>>>>>> f27f34f6745d6ea2cad2519642d24f8d6287769d
    citations: 218,
    impactFactor: 18.5,
    tags: ['扩散模型', '生成模型', '理论分析'],
    link: '#',
    field: 'cv'
  },
  {
    id: 3,
<<<<<<< HEAD
    title: '联邦学习隐私保护新框架',
    authors: ['Zhang, S.', 'Wang, L.', 'Chen, J.'],
    journal: 'ICML 2024',
    date: '2024-01-10',
    abstract: '在保持模型性能的同时实现更强的隐私保护，提出了创新性的加密方案...',
    citations: 156,
    impactFactor: 16.2,
    tags: ['联邦学习', '隐私保护', '分布式学习'],
    link: '#',
    field: 'rl'
  }
])

=======
    title: '大语言模型在代码生成中的能力评估',
    authors: ['Smith, J.', 'Johnson, R.', 'Brown, T.'],
    journal: 'ICLR 2024',
    date: '2024-01-08',
    abstract: '系统评估了当前主流大语言模型在代码生成任务上的表现，提出了新的评估指标和基准测试集。',
    citations: 156,
    impactFactor: 16.2,
    tags: ['大语言模型', '代码生成', '评估'],
    link: '#',
    field: 'nlp'
  }
])

// 研究趋势
const researchTrends = ref([
  { technology: '大语言模型', growth: 85 },
  { technology: '扩散模型', growth: 78 },
  { technology: '多模态学习', growth: 72 },
  { technology: '联邦学习', growth: 65 },
  { technology: '神经渲染', growth: 58 },
  { technology: 'AI安全', growth: 52 }
])

>>>>>>> f27f34f6745d6ea2cad2519642d24f8d6287769d
// 搜索和排序
const searchQuery = ref('')
const sortBy = ref('date')

// 计算属性
const filteredArticles = computed(() => {
  let filtered = articles.value
  
  // 按领域筛选
  if (selectedField.value !== 'all') {
    filtered = filtered.filter(article => article.field === selectedField.value)
  }
  
  // 搜索筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(article => 
      article.title.toLowerCase().includes(query) ||
      article.abstract.toLowerCase().includes(query) ||
      article.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }
  
  // 排序
  switch (sortBy.value) {
    case 'citations':
      filtered.sort((a, b) => b.citations - a.citations)
      break
    case 'impact':
      filtered.sort((a, b) => b.impactFactor - a.impactFactor)
      break
    case 'date':
    default:
      filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }
  
  return filtered
})

// 方法
const selectField = (fieldId: string) => {
  selectedField.value = fieldId
}

const selectPeriod = (periodId: string) => {
  selectedPeriod.value = periodId
}

const getTrendClass = (growth: number) => {
  if (growth > 30) return 'growth-high'
  if (growth > 15) return 'growth-medium'
  return 'growth-low'
}

<<<<<<< HEAD
const saveArticle = (article: any) => {
  console.log('收藏文章:', article.title)
  alert('已收藏该文章！')
=======
const getTrendColor = (growth: number) => {
  if (growth > 70) return 'trend-high'
  if (growth > 50) return 'trend-medium'
  return 'trend-low'
}

const saveArticle = (article: any) => {
  console.log('收藏文章:', article.title)
}

const shareArticle = (article: any) => {
  if (navigator.share) {
    navigator.share({
      title: article.title,
      text: article.abstract,
      url: article.link
    })
  }
>>>>>>> f27f34f6745d6ea2cad2519642d24f8d6287769d
}

const downloadPaper = (article: any) => {
  console.log('下载论文:', article.title)
<<<<<<< HEAD
  alert('正在下载论文PDF...')
=======
>>>>>>> f27f34f6745d6ea2cad2519642d24f8d6287769d
}
</script>

<style scoped>
.news-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1f35 0%, #2d3748 100%);
  color: #e2e8f0;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

<<<<<<< HEAD
/* 头部样式 */
.news-header {
  background: rgba(26, 32, 44, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #4a5568;
}

.header-content {
  display: flex;
  justify-content: center;
  align-items: center;
}

.logo h1 {
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #a855f7 0%, #7e22ce 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

=======
>>>>>>> f27f34f6745d6ea2cad2519642d24f8d6287769d
/* 主要内容布局 */
.news-content {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2rem;
  padding: 2rem 0;
}

/* 侧边栏样式 */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.filter-section h3,
.trending-section h3 {
<<<<<<< HEAD
  color: #a855f7;
  margin-bottom: 1rem;
  font-size: 1.1rem;
=======
  color: #63b3ed;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-bottom: 2px solid #4a5568;
  padding-bottom: 0.5rem;
>>>>>>> f27f34f6745d6ea2cad2519642d24f8d6287769d
}

.filter-tags {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-tag {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: rgba(45, 55, 72, 0.6);
  border: 1px solid #4a5568;
<<<<<<< HEAD
  border-radius: 0.5rem;
  color: #cbd5e0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-tag:hover,
.filter-tag.active {
  border-color: #a855f7;
  background: rgba(168, 85, 247, 0.1);
  color: #d8b4fe;
=======
  border-radius: 0.375rem;
  color: #cbd5e0;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.filter-tag:hover {
  border-color: #4299e1;
  background: rgba(66, 153, 225, 0.1);
}

.filter-tag.active {
  border-color: #4299e1;
  background: rgba(66, 153, 225, 0.2);
  color: #63b3ed;
  font-weight: 500;
>>>>>>> f27f34f6745d6ea2cad2519642d24f8d6287769d
}

.tag-count {
  background: #4a5568;
<<<<<<< HEAD
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.8rem;
=======
  padding: 0.2rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  color: #a0aec0;
>>>>>>> f27f34f6745d6ea2cad2519642d24f8d6287769d
}

.time-filters {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.time-filter {
<<<<<<< HEAD
  padding: 0.5rem;
=======
  padding: 0.6rem;
>>>>>>> f27f34f6745d6ea2cad2519642d24f8d6287769d
  background: rgba(45, 55, 72, 0.6);
  border: 1px solid #4a5568;
  border-radius: 0.25rem;
  color: #cbd5e0;
  cursor: pointer;
<<<<<<< HEAD
  transition: all 0.3s ease;
}

.time-filter.active {
  border-color: #a855f7;
  background: #7e22ce;
=======
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.time-filter.active {
  border-color: #4299e1;
  background: #4299e1;
>>>>>>> f27f34f6745d6ea2cad2519642d24f8d6287769d
  color: white;
}

.trending-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.trending-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
<<<<<<< HEAD
  padding: 0.5rem;
  border-radius: 0.25rem;
  background: rgba(45, 55, 72, 0.4);
=======
  padding: 0.75rem;
  border-radius: 0.375rem;
  background: rgba(45, 55, 72, 0.6);
  border: 1px solid #4a5568;
>>>>>>> f27f34f6745d6ea2cad2519642d24f8d6287769d
}

.trend-rank {
  font-weight: 600;
<<<<<<< HEAD
  color: #a855f7;
  min-width: 2rem;
=======
  color: #63b3ed;
  min-width: 1.5rem;
  font-size: 0.9rem;
>>>>>>> f27f34f6745d6ea2cad2519642d24f8d6287769d
}

.trend-name {
  flex: 1;
<<<<<<< HEAD
  color: #cbd5e0;
=======
  color: #e2e8f0;
>>>>>>> f27f34f6745d6ea2cad2519642d24f8d6287769d
  font-size: 0.9rem;
}

.trend-growth {
  font-size: 0.8rem;
  font-weight: 600;
}

.growth-high { color: #48bb78; }
.growth-medium { color: #ecc94b; }
.growth-low { color: #a0aec0; }

/* 主内容区样式 */
.main-content {
  display: flex;
  flex-direction: column;
<<<<<<< HEAD
  gap: 2rem;
=======
  gap: 2.5rem;
>>>>>>> f27f34f6745d6ea2cad2519642d24f8d6287769d
}

.controls-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
<<<<<<< HEAD
  flex-wrap: wrap;
=======
  background: rgba(45, 55, 72, 0.6);
  padding: 1.5rem;
  border-radius: 0.5rem;
  border: 1px solid #4a5568;
>>>>>>> f27f34f6745d6ea2cad2519642d24f8d6287769d
}

.search-box {
  display: flex;
  flex: 1;
  max-width: 400px;
}

.search-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #4a5568;
  border-right: none;
<<<<<<< HEAD
  border-radius: 0.5rem 0 0 0.5rem;
  background: #2d3748;
  color: #e2e8f0;
}

.search-btn {
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #7e22ce 0%, #6b21a8 100%);
  border: 1px solid #7e22ce;
  border-radius: 0 0.5rem 0.5rem 0;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.search-btn:hover {
  background: linear-gradient(135deg, #9333ea 0%, #7e22ce 100%);
=======
  border-radius: 0.375rem 0 0 0.375rem;
  background: #2d3748;
  color: #e2e8f0;
  font-size: 0.9rem;
}

.search-btn {
  padding: 0.75rem 1.5rem;
  background: #4299e1;
  border: 1px solid #4299e1;
  border-radius: 0 0.375rem 0.375rem 0;
  color: white;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
>>>>>>> f27f34f6745d6ea2cad2519642d24f8d6287769d
}

.sort-select {
  padding: 0.75rem;
  border: 1px solid #4a5568;
<<<<<<< HEAD
  border-radius: 0.5rem;
  background: #2d3748;
  color: #e2e8f0;
}

/* 突破性进展 */
.breakthroughs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
=======
  border-radius: 0.375rem;
  background: #2d3748;
  color: #e2e8f0;
  font-size: 0.9rem;
}

/* 突破性进展 */
.breakthroughs-section h2,
.articles-section h2,
.trends-section h2 {
  color: #63b3ed;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  font-weight: 600;
  border-bottom: 2px solid #4a5568;
  padding-bottom: 0.5rem;
}

.breakthroughs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
>>>>>>> f27f34f6745d6ea2cad2519642d24f8d6287769d
  gap: 1.5rem;
}

.breakthrough-card {
<<<<<<< HEAD
  background: rgba(45, 55, 72, 0.8);
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid #4a5568;
  position: relative;
}

.breakthrough-card.high {
  border-left: 4px solid #e53e3e;
}

.breakthrough-card.medium {
  border-left: 4px solid #dd6b20;
}

.breakthrough-badge {
  position: absolute;
  top: -10px;
  right: 1rem;
  background: #7e22ce;
=======
  background: rgba(45, 55, 72, 0.6);
  border-radius: 0.5rem;
  padding: 1.5rem;
  border: 1px solid #4a5568;
  transition: all 0.2s ease;
}

.breakthrough-card:hover {
  border-color: #4299e1;
}

.breakthrough-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.breakthrough-badge {
  background: #e53e3e;
>>>>>>> f27f34f6745d6ea2cad2519642d24f8d6287769d
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: 600;
}

<<<<<<< HEAD
.breakthrough-title {
  color: #d8b4fe;
  margin-bottom: 0.75rem;
  font-size: 1.1rem;
=======
.breakthrough-date {
  color: #a0aec0;
  font-size: 0.9rem;
}

.breakthrough-title {
  color: #90cdf4;
  margin-bottom: 0.75rem;
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.4;
>>>>>>> f27f34f6745d6ea2cad2519642d24f8d6287769d
}

.breakthrough-desc {
  color: #cbd5e0;
  margin-bottom: 1rem;
  line-height: 1.5;
<<<<<<< HEAD
=======
  font-size: 0.95rem;
>>>>>>> f27f34f6745d6ea2cad2519642d24f8d6287769d
}

.breakthrough-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
<<<<<<< HEAD
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;
=======
  font-size: 0.9rem;
}

.meta-item {
>>>>>>> f27f34f6745d6ea2cad2519642d24f8d6287769d
  color: #a0aec0;
}

.breakthrough-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tech-tag {
<<<<<<< HEAD
  background: rgba(168, 85, 247, 0.2);
  color: #d8b4fe;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  border: 1px solid rgba(168, 85, 247, 0.3);
=======
  background: rgba(66, 153, 225, 0.2);
  color: #63b3ed;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.8rem;
  border: 1px solid rgba(66, 153, 225, 0.3);
>>>>>>> f27f34f6745d6ea2cad2519642d24f8d6287769d
}

/* 文章列表 */
.articles-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.article-card {
<<<<<<< HEAD
  background: rgba(45, 55, 72, 0.8);
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid #4a5568;
  transition: all 0.3s ease;
}

.article-card:hover {
  border-color: #a855f7;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(168, 85, 247, 0.2);
=======
  background: rgba(45, 55, 72, 0.6);
  border-radius: 0.5rem;
  padding: 1.5rem;
  border: 1px solid #4a5568;
  transition: all 0.2s ease;
}

.article-card:hover {
  border-color: #4299e1;
>>>>>>> f27f34f6745d6ea2cad2519642d24f8d6287769d
}

.article-header {
  margin-bottom: 1rem;
}

.article-title {
<<<<<<< HEAD
  margin-bottom: 0.5rem;
}

.article-title a {
  color: #d8b4fe;
  text-decoration: none;
  font-size: 1.2rem;
  transition: color 0.3s ease;
}

.article-title a:hover {
  color: #a855f7;
=======
  margin-bottom: 0.75rem;
}

.article-title a {
  color: #90cdf4;
  text-decoration: none;
  font-size: 1.2rem;
  font-weight: 600;
  line-height: 1.4;
}

.article-title a:hover {
  color: #63b3ed;
>>>>>>> f27f34f6745d6ea2cad2519642d24f8d6287769d
}

.article-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: #a0aec0;
}

.authors {
  font-style: italic;
}

.article-abstract {
  color: #cbd5e0;
  line-height: 1.6;
  margin-bottom: 1rem;
<<<<<<< HEAD
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
=======
  font-size: 0.95rem;
>>>>>>> f27f34f6745d6ea2cad2519642d24f8d6287769d
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
<<<<<<< HEAD
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
=======
>>>>>>> f27f34f6745d6ea2cad2519642d24f8d6287769d
}

.article-stats {
  display: flex;
<<<<<<< HEAD
  gap: 1rem;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.9rem;
  color: #a0aec0;
=======
  gap: 1.5rem;
  font-size: 0.9rem;
  color: #a0aec0;
}

.stat {
  font-weight: 500;
>>>>>>> f27f34f6745d6ea2cad2519642d24f8d6287769d
}

.article-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
<<<<<<< HEAD
  background: rgba(168, 85, 247, 0.1);
  color: #a855f7;
  border: 1px solid rgba(168, 85, 247, 0.3);
=======
  background: rgba(66, 153, 225, 0.1);
  color: #63b3ed;
  border: 1px solid rgba(66, 153, 225, 0.3);
>>>>>>> f27f34f6745d6ea2cad2519642d24f8d6287769d
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.9rem;
<<<<<<< HEAD
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: #7e22ce;
  color: white;
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  background: rgba(113, 128, 150, 0.2);
  color: #a0aec0;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  border: 1px solid #4a5568;
}

/* 工具区域 */
.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.tool-card {
  background: rgba(45, 55, 72, 0.8);
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid #4a5568;
  text-align: center;
  transition: all 0.3s ease;
}

.tool-card:hover {
  border-color: #a855f7;
  transform: translateY(-3px);
}

.tool-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #a855f7;
}

.tool-card h3 {
  color: #d8b4fe;
  margin-bottom: 1rem;
}

.tool-btn {
  background: linear-gradient(135deg, #7e22ce 0%, #6b21a8 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tool-btn:hover {
  background: linear-gradient(135deg, #9333ea 0%, #7e22ce 100%);
  transform: translateY(-2px);
}
=======
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #4299e1;
  color: white;
}

/* 趋势分析 */
.trends-content {
  background: rgba(45, 55, 72, 0.6);
  border-radius: 0.5rem;
  padding: 1.5rem;
  border: 1px solid #4a5568;
}

.trends-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.trend-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.trend-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.trend-name {
  color: #e2e8f0;
  font-weight: 500;
  font-size: 0.95rem;
}

.trend-growth {
  color: #63b3ed;
  font-weight: 600;
  font-size: 0.9rem;
}

.trend-bar {
  width: 100%;
  height: 6px;
  background: #4a5568;
  border-radius: 3px;
  overflow: hidden;
}

.trend-progress {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.trend-high { background: #48bb78; }
.trend-medium { background: #ecc94b; }
.trend-low { background: #4299e1; }
>>>>>>> f27f34f6745d6ea2cad2519642d24f8d6287769d

/* 响应式设计 */
@media (max-width: 1024px) {
  .news-content {
    grid-template-columns: 1fr;
  }
<<<<<<< HEAD
  
  .sidebar {
    order: 2;
  }
  
  .main-content {
    order: 1;
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
=======
}

@media (max-width: 768px) {
  .container {
    padding: 0 15px;
>>>>>>> f27f34f6745d6ea2cad2519642d24f8d6287769d
  }
  
  .controls-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    max-width: none;
  }
  
  .breakthroughs-grid {
    grid-template-columns: 1fr;
  }
  
  .article-footer {
    flex-direction: column;
<<<<<<< HEAD
    align-items: flex-start;
  }
=======
    gap: 1rem;
    align-items: flex-start;
  }
  
  .article-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .time-filters {
    grid-template-columns: 1fr;
  }
>>>>>>> f27f34f6745d6ea2cad2519642d24f8d6287769d
}
</style>