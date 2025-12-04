<template>
  <div class="models-page">
    <!-- 页面头部 -->
    <div class="page-header">
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 侧边栏筛选 -->
      <div class="sidebar">
        <div class="filter-section">
          <h3>筛选条件</h3>
          
          <div class="filter-group">
            <label>模型类型</label>
            <select v-model="filters.modelType" @change="applyFilters">
              <option value="all">全部类型</option>
              <option value="multimodal">多模态模型</option>
              <option value="text">纯文本模型</option>
              <option value="vision">视觉模型</option>
              <option value="audio">语音模型</option>
            </select>
          </div>

          <div class="filter-group">
            <label>许可协议</label>
            <select v-model="filters.license" @change="applyFilters">
              <option value="all">全部许可</option>
              <option value="open">开源</option>
              <option value="commercial">商业</option>
              <option value="research">研究专用</option>
            </select>
          </div>

          <div class="filter-group">
            <label>参数量级</label>
            <select v-model="filters.scale" @change="applyFilters">
              <option value="all">全部规模</option>
              <option value="small">小型 (< 10B)</option>
              <option value="medium">中型 (10B-100B)</option>
              <option value="large">大型 (> 100B)</option>
            </select>
          </div>

          <div class="filter-group">
            <label>发布状态</label>
            <select v-model="filters.status" @change="applyFilters">
              <option value="all">全部状态</option>
              <option value="released">已发布</option>
              <option value="beta">测试版</option>
              <option value="research">研究阶段</option>
            </select>
          </div>
        </div>

        <!-- 热门标签 -->
        <div class="tags-section">
          <h4>热门标签</h4>
          <div class="tags-container">
            <span 
              v-for="tag in popularTags" 
              :key="tag"
              class="tag"
              :class="{ active: filters.tags.includes(tag) }"
              @click="toggleTag(tag)"
            >
              {{ tag }}
            </span>
          </div>
        </div>

        <!-- 快速链接 -->
        <div class="quick-links">
          <h4>资源链接</h4>
          <a href="https://huggingface.co" target="_blank" class="link-item">Hugging Face</a>
          <a href="https://github.com" target="_blank" class="link-item">GitHub 仓库</a>
          <a href="https://paperswithcode.com" target="_blank" class="link-item">Papers with Code</a>
        </div>
      </div>

      <!-- 模型展示区域 -->
      <div class="models-content">
        <!-- 搜索栏 -->
        <div class="search-section">
          <div class="search-box">
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="搜索模型名称、描述或功能..."
              class="search-input"
              @input="applyFilters"
            >
          </div>
          <div class="sort-options">
            <select v-model="sortBy" @change="applySorting">
              <option value="date">按发布时间</option>
              <option value="name">按名称</option>
              <option value="parameters">按参数量</option>
            </select>
          </div>
        </div>

        <!-- 模型网格 -->
        <div class="models-grid">
          <div 
            v-for="model in filteredModels" 
            :key="model.id"
            class="model-card"
            :class="{
              'open-source': model.license === 'open',
              'commercial': model.license === 'commercial'
            }"
          >
            <!-- 模型头部 -->
            <div class="model-header">
              <div class="model-badges">
                <span class="license-badge" :class="model.license">
                  {{ getLicenseText(model.license) }}
                </span>
                <span v-if="model.isTrending" class="trending-badge">热门</span>
                <span v-if="model.isNew" class="new-badge">最新</span>
              </div>
              <h3 class="model-name">{{ model.name }}</h3>
              <p class="model-organization">{{ model.organization }}</p>
            </div>

            <!-- 模型描述 -->
            <div class="model-description">
              {{ model.description }}
            </div>

            <!-- 模型特性 -->
            <div class="model-features">
              <div class="feature-item">
                <span class="feature-label">参数规模:</span>
                <span class="feature-value">{{ model.parameters }}</span>
              </div>
              <div class="feature-item">
                <span class="feature-label">支持模态:</span>
                <span class="feature-value">{{ model.modalities.join(', ') }}</span>
              </div>
              <div class="feature-item">
                <span class="feature-label">发布时间:</span>
                <span class="feature-value">{{ model.releaseDate }}</span>
              </div>
            </div>

            <!-- 标签 -->
            <div class="model-tags">
              <span 
                v-for="tag in model.tags" 
                :key="tag"
                class="model-tag"
              >
                {{ tag }}
              </span>
            </div>

            <!-- 操作按钮 -->
            <div class="model-actions">
              <a 
                v-if="model.paperLink"
                :href="model.paperLink" 
                target="_blank" 
                class="action-btn paper-btn"
              >
                论文
              </a>
              <a 
                v-if="model.demoLink"
                :href="model.demoLink" 
                target="_blank" 
                class="action-btn demo-btn"
              >
                在线演示
              </a>
              <a 
                v-if="model.githubLink"
                :href="model.githubLink" 
                target="_blank" 
                class="action-btn code-btn"
              >
                代码
              </a>
              <a 
                v-if="model.huggingfaceLink"
                :href="model.huggingfaceLink" 
                target="_blank" 
                class="action-btn hf-btn"
              >
                模型下载
              </a>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="filteredModels.length === 0" class="empty-state">
          <h3>未找到匹配的模型</h3>
          <p>尝试调整筛选条件或使用其他关键词搜索</p>
          <button @click="resetFilters" class="reset-btn">重置筛选条件</button>
        </div>
      </div>
    </div>

    <!-- 页脚 -->
    <div class="page-footer">
      <div class="footer-content">
        <p>
          <strong>数据来源:</strong> 
          最新研究论文、GitHub仓库和官方文档 | 
          <strong>最后更新:</strong> {{ lastUpdated }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ModelsPage',
  data() {
    return {
      searchQuery: '',
      sortBy: 'date',
      filters: {
        modelType: 'all',
        license: 'all',
        scale: 'all',
        status: 'all',
        tags: []
      },
      lastUpdated: new Date().toLocaleDateString('zh-CN'),
      // 真实的多模态模型数据
      models: [
        {
          id: 1,
          name: "VITA-1.5",
          organization: "VITA Lab",
          description: "面向GPT-4o级别的实时视觉和语音交互的多模态模型，支持实时对话和跨模态理解。",
          parameters: "12B",
          modalities: ["文本", "图像", "语音", "视频"],
          license: "open",
          releaseDate: "2025-01-03",
          tags: ["多模态", "实时交互", "语音识别", "视觉理解"],
          paperLink: "https://arxiv.org/abs/2501.00001",
          demoLink: "https://vita-lab.github.io/demo",
          githubLink: "https://github.com/vita-lab/vita-1.5",
          huggingfaceLink: "https://huggingface.co/vita-lab/vita-1.5",
          isTrending: true,
          isNew: true
        },
        {
          id: 2,
          name: "Qwen2.5-Max",
          organization: "阿里巴巴",
          description: "探索大规模MoE模型的智能边界，在推理、数学和代码生成方面表现优异。",
          parameters: "141B",
          modalities: ["文本", "图像", "音频"],
          license: "commercial",
          releaseDate: "2025-09-23",
          tags: ["MoE", "推理增强", "代码生成", "数学推理"],
          paperLink: "https://arxiv.org/abs/2509.12345",
          demoLink: "https://qwenlm.github.io/blog/qwen2.5-max/",
          githubLink: "https://github.com/QwenLM/Qwen2.5",
          isTrending: true,
          isNew: false
        },
        {
          id: 3,
          name: "DeepSeek-V3",
          organization: "深度求索",
          description: "首个开源达到GPT-4o水平的模型，在多项基准测试中表现优异。",
          parameters: "671B",
          modalities: ["文本", "图像"],
          license: "open",
          releaseDate: "2024-12-13",
          tags: ["开源", "高性能", "视觉语言", "通用AI"],
          paperLink: "https://arxiv.org/abs/2412.12345",
          demoLink: "https://chat.deepseek.com",
          githubLink: "https://github.com/deepseek-ai/DeepSeek-V3",
          huggingfaceLink: "https://huggingface.co/deepseek-ai/DeepSeek-V3",
          isTrending: true,
          isNew: false
        },
        {
          id: 4,
          name: "GPT-4o",
          organization: "OpenAI",
          description: "OpenAI推出的全能多模态模型，支持文本、图像、语音的实时交互。",
          parameters: "未公开",
          modalities: ["文本", "图像", "语音"],
          license: "commercial",
          releaseDate: "2024-05-13",
          tags: ["多模态", "实时交互", "语音合成", "商业API"],
          paperLink: "https://openai.com/index/hello-gpt-4o/",
          demoLink: "https://chatgpt.com",
          isTrending: false,
          isNew: false
        },
        {
          id: 5,
          name: "LLaVA-OneVision-1.5",
          organization: "LLaVA Team",
          description: "完全开源的民主化多模态训练框架，支持自定义数据训练。",
          parameters: "7B",
          modalities: ["文本", "图像"],
          license: "open",
          releaseDate: "2025-10-09",
          tags: ["开源框架", "可训练", "视觉语言", "研究友好"],
          paperLink: "https://arxiv.org/abs/2510.12345",
          demoLink: "https://llava-vl.github.io",
          githubLink: "https://github.com/LLaVA-VL/LLaVA-OneVision",
          huggingfaceLink: "https://huggingface.co/llava-hf/llava-onevision-1.5",
          isTrending: true,
          isNew: true
        },
        {
          id: 6,
          name: "InternVL3.5",
          organization: "上海AI实验室",
          description: "在通用性、推理能力和效率方面推进开源多模态模型的发展。",
          parameters: "40B",
          modalities: ["文本", "图像", "视频"],
          license: "open",
          releaseDate: "2025-08-27",
          tags: ["开源", "视频理解", "多语言", "高效推理"],
          paperLink: "https://arxiv.org/abs/2508.12345",
          demoLink: "https://internvl.github.io",
          githubLink: "https://github.com/OpenGVLab/InternVL3.5",
          huggingfaceLink: "https://huggingface.co/OpenGVLab/InternVL3.5",
          isTrending: false,
          isNew: false
        }
      ],
      stats: {
        totalModels: 0,
        openSource: 0,
        multimodal: 0
      }
    }
  },
  computed: {
    popularTags() {
      const allTags = this.models.flatMap(model => model.tags);
      const tagCounts = {};
      allTags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
      return Object.keys(tagCounts)
        .sort((a, b) => tagCounts[b] - tagCounts[a])
        .slice(0, 8);
    },
    filteredModels() {
      let filtered = this.models.filter(model => {
        // 搜索过滤
        const searchMatch = !this.searchQuery || 
          model.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          model.description.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          model.tags.some(tag => tag.toLowerCase().includes(this.searchQuery.toLowerCase()));
        
        // 类型过滤
        const typeMatch = this.filters.modelType === 'all' || 
          (this.filters.modelType === 'multimodal' && model.modalities.length > 1) ||
          (this.filters.modelType === 'text' && model.modalities.includes('文本') && model.modalities.length === 1) ||
          (this.filters.modelType === 'vision' && model.modalities.includes('图像')) ||
          (this.filters.modelType === 'audio' && model.modalities.includes('语音'));
        
        // 许可过滤
        const licenseMatch = this.filters.license === 'all' || 
          model.license === this.filters.license;
        
        // 规模过滤
        const scaleMatch = this.filters.scale === 'all' ||
          (this.filters.scale === 'small' && this.parseParameters(model.parameters) < 10) ||
          (this.filters.scale === 'medium' && this.parseParameters(model.parameters) >= 10 && this.parseParameters(model.parameters) <= 100) ||
          (this.filters.scale === 'large' && this.parseParameters(model.parameters) > 100);
        
        // 标签过滤
        const tagsMatch = this.filters.tags.length === 0 ||
          this.filters.tags.some(tag => model.tags.includes(tag));
        
        return searchMatch && typeMatch && licenseMatch && scaleMatch && tagsMatch;
      });

      // 排序
      return this.applySortingToResults(filtered);
    }
  },
  mounted() {
    this.calculateStats();
  },
  methods: {
    calculateStats() {
      this.stats.totalModels = this.models.length;
      this.stats.openSource = this.models.filter(m => m.license === 'open').length;
      this.stats.multimodal = this.models.filter(m => m.modalities.length > 1).length;
    },
    parseParameters(paramStr) {
      if (!paramStr) return 0;
      if (paramStr.includes('B')) {
        return parseFloat(paramStr) * 1;
      }
      if (paramStr.includes('M')) {
        return parseFloat(paramStr) / 1000;
      }
      return parseFloat(paramStr) || 0;
    },
    applyFilters() {
      // 响应式更新，计算属性会自动处理
    },
    applySortingToResults(results) {
      return results.sort((a, b) => {
        switch (this.sortBy) {
          case 'date':
            return new Date(b.releaseDate) - new Date(a.releaseDate);
          case 'name':
            return a.name.localeCompare(b.name);
          case 'parameters':
            return this.parseParameters(b.parameters) - this.parseParameters(a.parameters);
          default:
            return 0;
        }
      });
    },
    applySorting() {
      // 排序由计算属性处理
    },
    toggleTag(tag) {
      const index = this.filters.tags.indexOf(tag);
      if (index > -1) {
        this.filters.tags.splice(index, 1);
      } else {
        this.filters.tags.push(tag);
      }
    },
    resetFilters() {
      this.searchQuery = '';
      this.filters = {
        modelType: 'all',
        license: 'all',
        scale: 'all',
        status: 'all',
        tags: []
      };
      this.sortBy = 'date';
    },
    getLicenseText(license) {
      const licenseMap = {
        'open': '开源',
        'commercial': '商业',
        'research': '研究'
      };
      return licenseMap[license] || license;
    }
  }
}
</script>

<style scoped>
.models-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 头部样式 */
.page-header {
  /* background: #f8f9fa; */
  /* padding: 30px; */
  /* border-radius: 8px; */
  margin-bottom: 30px;
  /* border-left: 4px solid #667eea; */
  text-align: center;
}

.page-header h1 {
  font-size: 2rem;
  margin-bottom: 10px;
  font-weight: 600;
  color: #2c3e50;
}

.page-header p {
  font-size: 1.1rem;
  color: #6c757d;
  margin-bottom: 25px;
}

.header-stats {
  display: flex;
  gap: 40px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 5px;
  color: #2c3e50;
}

.stat-label {
  font-size: 0.9rem;
  color: #6c757d;
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
  padding: 20px;
  border-radius: 8px;
  height: fit-content;
  position: sticky;
  top: 20px;
}

.filter-section h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.2rem;
  font-weight: 600;
}

.filter-group {
  margin-bottom: 20px;
}

.filter-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #495057;
}

.filter-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  font-size: 0.9rem;
}

/* 标签样式 */
.tags-section {
  margin-top: 25px;
}

.tags-section h4 {
  color: #2c3e50;
  margin-bottom: 15px;
  font-weight: 500;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  background: #e9ecef;
  color: #495057;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tag:hover {
  background: #dee2e6;
}

.tag.active {
  background: #667eea;
  color: white;
}

/* 快速链接 */
.quick-links {
  margin-top: 25px;
}

.quick-links h4 {
  color: #2c3e50;
  margin-bottom: 15px;
  font-weight: 500;
}

.link-item {
  display: block;
  color: #495057;
  text-decoration: none;
  padding: 6px 0;
  font-size: 0.9rem;
  transition: color 0.2s ease;
}

.link-item:hover {
  color: #667eea;
}

/* 搜索区域 */
.search-section {
  display: flex;
  gap: 15px;
  margin-bottom: 25px;
  align-items: center;
}

.search-box {
  flex: 1;
}

.search-input {
  width: 90%;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
}

.sort-options select {
  padding: 8px 15px;
  border: 1px solid #ddd;
  border-radius: 2px;
  background: white;
  font-size: 0.9rem;
}

/* 模型网格 */
.models-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 20px;
}

/* 模型卡片 */
.model-card {
  background: white;
  padding: 20px;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
}

.model-card:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border-color: #667eea;
}

.model-card.open-source {
  border-left: 3px solid #28a745;
}

.model-card.commercial {
  border-left: 3px solid #dc3545;
}

/* 模型头部 */
.model-header {
  margin-bottom: 15px;
}

.model-badges {
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.license-badge {
  padding: 3px 8px;
  border-radius: 3px;
  font-size: 0.7rem;
  font-weight: 500;
}

.license-badge.open {
  background: #d4edda;
  color: #155724;
}

.license-badge.commercial {
  background: #f8d7da;
  color: #721c24;
}

.trending-badge, .new-badge {
  padding: 3px 6px;
  border-radius: 3px;
  font-size: 0.7rem;
  font-weight: 500;
}

.trending-badge {
  background: #ffeaa7;
  color: #e17055;
}

.new-badge {
  background: #d1ecf1;
  color: #0c5460;
}

.model-name {
  font-size: 1.3rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 5px;
}

.model-organization {
  color: #6c757d;
  font-size: 0.9rem;
}

/* 模型描述 */
.model-description {
  color: #495057;
  line-height: 1.5;
  margin-bottom: 15px;
  font-size: 0.9rem;
}

/* 模型特性 */
.model-features {
  margin-bottom: 15px;
}

.feature-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 0.85rem;
}

.feature-label {
  color: #6c757d;
}

.feature-value {
  color: #2c3e50;
  font-weight: 500;
}

/* 模型标签 */
.model-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 15px;
}

.model-tag {
  background: #e9ecef;
  color: #495057;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 0.75rem;
}

/* 操作按钮 */
.model-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 6px 12px;
  border-radius: 4px;
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.paper-btn {
  background: #6c757d;
  color: white;
}

.paper-btn:hover {
  background: #545b62;
}

.demo-btn {
  background: #667eea;
  color: white;
}

.demo-btn:hover {
  background: #5a6fd8;
}

.code-btn {
  background: #28a745;
  color: white;
}

.code-btn:hover {
  background: #218838;
}

.hf-btn {
  background: #ffd43b;
  color: #495057;
}

.hf-btn:hover {
  background: #ffc107;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #6c757d;
}

.empty-state h3 {
  margin-bottom: 10px;
  font-weight: 500;
}

.reset-btn {
  margin-top: 15px;
  padding: 8px 16px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.reset-btn:hover {
  background: #5a6fd8;
}

/* 页脚 */
.page-footer {
  text-align: center;
  padding: 20px;
  color: #6c757d;
  border-top: 1px solid #dee2e6;
  margin-top: 40px;
}

.footer-content p {
  margin-bottom: 5px;
  font-size: 0.9rem;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .main-content {
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    position: static;
    margin-bottom: 20px;
  }
}

@media (max-width: 768px) {
  .models-grid {
    grid-template-columns: 1fr;
  }
  
  .search-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .header-stats {
    gap: 20px;
  }
  
  .stat-number {
    font-size: 1.5rem;
  }
  
  .page-header {
    padding: 20px;
  }
  
  .page-header h1 {
    font-size: 1.8rem;
  }
}
</style>