<template>
  <div class="llm-agents-page">
    <!-- 头部 -->
    <div class="page-header">
      <h1>LLM Agents 前沿动态与知识库</h1>
      <p>基于大语言模型的智能体研究进展与论文汇总</p>
      <div class="header-actions">
        <button class="btn-primary" @click="refreshData" :disabled="loading">
          {{ loading ? '刷新中...' : '刷新数据' }}
        </button>
        <a href="https://github.com/WooooDyy/LLM-Agent-Paper-List" target="_blank" class="btn-secondary">
          查看GitHub仓库
        </a>
      </div>
    </div>

    <!-- 主要内容 -->
    <div class="main-content">
      <!-- 左侧导航 -->
      <div class="sidebar">
        <h3>目录导航</h3>
        <nav>
          <ul>
            <li><a href="#introduction" @click.prevent="scrollToSection('introduction')">项目介绍</a></li>
            <li><a href="#news" @click.prevent="scrollToSection('news')">最新动态</a></li>
            <li><a href="#papers" @click.prevent="scrollToSection('papers')">论文列表</a></li>
            <li><a href="#framework" @click.prevent="scrollToSection('framework')">智能体框架</a></li>
            <li><a href="#applications" @click.prevent="scrollToSection('applications')">应用场景</a></li>
          </ul>
        </nav>

        <div class="stats">
          <h4>数据统计</h4>
          <div class="stat-item">
            <span>动态更新:</span>
            <strong>{{ news.length }}</strong>
          </div>
          <div class="stat-item">
            <span>论文数量:</span>
            <strong>{{ papers.length }}</strong>
          </div>
          <div class="stat-item">
            <span>最后更新:</span>
            <span>{{ lastUpdated }}</span>
          </div>
        </div>
      </div>

      <!-- 右侧内容 -->
      <div class="content">
        <!-- 项目介绍 -->
        <section id="introduction" class="content-section">
          <h2>项目介绍</h2>
          <div class="section-content">
            <p>长期以来，人类一直追求达到或超越人类水平的人工智能，而AI智能体被认为是实现这一目标的有希望的载体。AI智能体是能够感知环境、做出决策并采取行动的人工实体。</p>
            
            <p>由于大语言模型展示出的多功能和卓越能力，它们被认为是通往通用人工智能的潜在火花，为构建通用AI智能体带来了希望。许多研究工作利用LLMs作为基础来构建AI智能体，并取得了显著进展。</p>
            
            <p>在这个仓库中，我们提供了关于基于LLM的智能体的系统性和全面性调查，并列出了一些必读论文。</p>
            
            <h3>核心框架</h3>
            <p>基于LLM的智能体通用概念框架包含三个主要组件：大脑、感知和行动，该框架可以根据不同的应用场景进行调整。</p>
          </div>
        </section>

        <!-- 最新动态 -->
        <section id="news" class="content-section">
          <h2>最新动态</h2>
          <div class="section-content">
            <div v-if="loading" class="loading">正在加载最新动态...</div>
            
            <div v-else-if="error" class="error">
              <p>加载失败: {{ error }}</p>
              <button @click="refreshData">重试</button>
            </div>
            
            <div v-else-if="news.length === 0" class="empty">
              暂无最新动态
            </div>
            
            <div v-else class="news-list">
              <div v-for="item in news" :key="item.timestamp" class="news-item">
                <div class="news-header">
                  <span class="news-date">{{ item.date || '近期' }}</span>
                  <div class="news-links">
                    <a v-if="item.links.paper" :href="item.links.paper" target="_blank" class="link">论文</a>
                    <a v-if="item.links.code" :href="item.links.code" target="_blank" class="link">代码</a>
                    <a v-if="item.links.project" :href="item.links.project" target="_blank" class="link">项目</a>
                  </div>
                </div>
                <p class="news-content">{{ item.content }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- 论文列表 -->
        <section id="papers" class="content-section">
          <h2>最新论文</h2>
          <div class="section-content">
            <div v-if="loading" class="loading">正在加载论文列表...</div>
            
            <div v-else-if="papers.length === 0" class="empty">
              暂无论文数据
            </div>
            
            <div v-else class="papers-list">
              <div v-for="paper in papers" :key="paper.title + paper.date" class="paper-item">
                <h4 class="paper-title">{{ paper.title }}</h4>
                <p class="paper-authors">{{ paper.authors }}</p>
                <div class="paper-footer">
                  <span class="paper-date">{{ paper.date }}</span>
                  <div class="paper-links">
                    <a v-if="paper.paper_link" :href="paper.paper_link" target="_blank" class="link">论文链接</a>
                    <a v-if="paper.code_link" :href="paper.code_link" target="_blank" class="link">代码仓库</a>
                    <a v-if="paper.project_link" :href="paper.project_link" target="_blank" class="link">项目页面</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 智能体框架 -->
        <section id="framework" class="content-section">
          <h2>智能体构建框架</h2>
          <div class="section-content">
            <h3>1.1 大脑：主要由LLM组成</h3>
            <ul>
              <li><strong>自然语言交互</strong>：高质量生成、深度理解</li>
              <li><strong>知识</strong>：预训练模型、语言知识、常识知识、可操作知识</li>
              <li><strong>记忆</strong>：记忆能力、Transformer长度限制、记忆总结、记忆检索</li>
              <li><strong>推理与规划</strong>：推理、计划制定、计划反思</li>
              <li><strong>可转移性与泛化</strong>：未见任务泛化、上下文学习、持续学习</li>
            </ul>

            <h3>1.2 感知：多模态输入</h3>
            <ul>
              <li>视觉感知</li>
              <li>音频感知</li>
            </ul>

            <h3>1.3 行动：扩展行动空间</h3>
            <ul>
              <li>工具使用</li>
              <li>具身行动</li>
            </ul>
          </div>
        </section>

        <!-- 应用场景 -->
        <section id="applications" class="content-section">
          <h2>应用场景</h2>
          <div class="section-content">
            <h3>2.1 单智能体通用能力</h3>
            <ul>
              <li>任务导向部署</li>
              <li>创新导向部署</li>
              <li>生命周期导向部署</li>
            </ul>

            <h3>2.2 多智能体协调潜力</h3>
            <ul>
              <li>互补性合作交互</li>
              <li>对抗性交互促进进步</li>
            </ul>

            <h3>2.3 人机交互参与</h3>
            <ul>
              <li>指导者-执行者范式</li>
              <li>平等伙伴关系范式</li>
            </ul>
          </div>
        </section>
      </div>
    </div>

    <!-- 页脚 -->
    <div class="page-footer">
      <p>
        数据来源: 
        <a href="https://github.com/WooooDyy/LLM-Agent-Paper-List" target="_blank">
          LLM-Agent-Paper-List
        </a>
        | 最后更新: {{ lastUpdated }}
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LLMAgentsPage',
  data() {
    return {
      loading: false,
      error: null,
      news: [],
      papers: [],
      lastUpdated: '-',
      apiBaseUrl: 'http://localhost:5001/api'
    }
  },
  mounted() {
    this.loadData();
  },
  methods: {
    async loadData() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await fetch(`${this.apiBaseUrl}/data`);
        
        if (!response.ok) {
          throw new Error(`HTTP错误: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result && result.success) {
          this.news = result.data?.news || [];
          this.papers = result.data?.papers || [];
          this.lastUpdated = result.data?.last_updated ? 
            new Date(result.data.last_updated).toLocaleString() : '-';
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
    
    scrollToSection(sectionId) {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }
}
</script>

<style scoped>
.llm-agents-page {
  max-width: 1350px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
}

/* 头部样式 */
.page-header {
  background: #f8f9fa;
  padding: 30px;
  border-radius: 8px;
  margin-bottom: 30px;
  text-align: center;
}

.page-header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 2.2rem;
}

.page-header p {
  color: #6c757d;
  font-size: 1.1rem;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

/* 按钮样式 */
.btn-primary, .btn-secondary {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #7e22ce;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #7e22ce;
}

.btn-primary:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

/* 主要内容布局 */
.main-content {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 30px;
  margin-bottom: 40px;
}

/* 侧边栏样式 */
.sidebar {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  height: fit-content;
  position: sticky;
  top: 20px;
}

.sidebar h3 {
  color: #2c3e50;
  margin-bottom: 15px;
  font-size: 1.2rem;
}

.sidebar nav ul {
  list-style: none;
  padding: 0;
  margin: 0 0 25px 0;
}

.sidebar nav li {
  margin-bottom: 8px;
}

.sidebar nav a {
  color: #495057;
  text-decoration: none;
  padding: 5px 0;
  display: block;
  border-bottom: 1px solid transparent;
  transition: all 0.3s ease;
}

.sidebar nav a:hover {
  color: #7e22ce;
  border-bottom-color: #7e22ce;
}

/* 统计样式 */
.stats {
  border-top: 1px solid #dee2e6;
  padding-top: 15px;
}

.stats h4 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 1.1rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.stat-item span:first-child {
  color: #6c757d;
}

.stat-item strong {
  color: #2c3e50;
}

/* 内容区域样式 */
.content-section {
  background: white;
  padding: 30px;
  border-radius: 8px;
  margin-bottom: 25px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.content-section h2 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.6rem;
  border-bottom: 2px solid #7e22ce;
  padding-bottom: 10px;
}

.content-section h3 {
  color: #2c3e50;
  margin: 25px 0 15px 0;
  font-size: 1.3rem;
}

.content-section h4 {
  color: #2c3e50;
  margin: 20px 0 10px 0;
}

.section-content p {
  margin-bottom: 15px;
  color: #495057;
}

.section-content ul {
  margin-bottom: 20px;
  padding-left: 20px;
}

.section-content li {
  margin-bottom: 8px;
  color: #495057;
}

/* 新闻和论文列表样式 */
.news-list, .papers-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.news-item, .paper-item {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 6px;
  border-left: 4px solid #7e22ce;
}

.news-header, .paper-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  flex-wrap: wrap;
  gap: 10px;
}

.news-date, .paper-date {
  color: #6c757d;
  font-size: 0.9rem;
}

.news-links, .paper-links {
  display: flex;
  gap: 10px;
}

.link {
  background: #7e22ce;
  color: white;
  padding: 4px 12px;
  border-radius: 15px;
  text-decoration: none;
  font-size: 0.8rem;
  transition: background 0.3s ease;
}

.link:hover {
  background: #0056b3;
}

.news-content {
  margin: 0;
  color: #495057;
  line-height: 1.5;
}

.paper-title {
  color: #2c3e50;
  margin: 0 0 8px 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.paper-authors {
  color: #6c757d;
  font-style: italic;
  margin: 0 0 15px 0;
}

/* 状态样式 */
.loading, .error, .empty {
  text-align: center;
  padding: 40px;
  color: #6c757d;
  background: #f8f9fa;
  border-radius: 6px;
}

.error {
  color: #dc3545;
  background: #f8d7da;
}

.error button {
  margin-top: 10px;
  padding: 8px 16px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* 页脚样式 */
.page-footer {
  text-align: center;
  padding: 20px;
  color: #6c757d;
  border-top: 1px solid #dee2e6;
  margin-top: 40px;
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
  
  .header-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .news-header, .paper-footer {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .news-links, .paper-links {
    margin-top: 10px;
  }
}
</style>


