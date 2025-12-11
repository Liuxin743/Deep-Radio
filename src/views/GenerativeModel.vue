<template>
  <div class="hf-models-page">

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>正在从Hugging Face加载模型数据...</p>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="error-container">
      <div class="error-icon">⚠️</div>
      <h3>数据加载失败</h3>
      <p>{{ error }}</p>
      <button @click="fetchModels" class="retry-btn">重试加载</button>
    </div>

    <!-- 主要内容区域 -->
    <div v-else class="main-content">
      <!-- 筛选和搜索 -->
      <div class="filters-section">
        <div class="search-box">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="搜索模型名称、描述或标签..."
            @input="debouncedFilterModels"
          >
        </div>
        <div class="filter-controls">
          <select v-model="selectedTask" @change="handleTaskChange">
            <option value="all">所有任务类型</option>
            <option value="text-generation">文本生成</option>
            <option value="image-to-text">图像转文本</option>
            <option value="text-to-image">文本转图像</option>
            <option value="audio-classification">音频分类</option>
            <option value="question-answering">问答</option>
            <option value="summarization">摘要</option>
            <option value="multimodal">多模态</option>
          </select>
          <select v-model="sortBy" @change="fetchModels">
            <option value="downloads">按下载量</option>
            <option value="likes">按收藏数</option>
            <option value="created">按创建时间</option>
            <option value="name">按名称</option>
          </select>
        </div>
      </div>

      <!-- 模型网格 -->
      <div class="models-grid">
        <div 
          v-for="model in paginatedModels"  
          :key="model.modelId"
          class="model-card"
        >
          <!-- 卡片内容容器（改为弹性布局，固定按钮在底部） -->
          <div class="model-card-content">
            <!-- 模型头部 -->
            <div class="model-header">
              <div class="model-badges">
                <span v-if="model.downloads > 1000000" class="badge popular">热门</span>
                <span v-if="model.likes > 1000" class="badge liked">高收藏</span>
                <span v-if="model.private" class="badge private">私有</span>
                <span v-if="model.isMultimodal" class="badge multimodal">多模态</span>
              </div>
              <h3 class="model-name">{{ model.name || model.modelId.split('/').pop() }}</h3>
              <p class="model-author">@{{ model.author || model.owner }}</p>
            </div>

            <!-- 模型信息 -->
            <div class="model-info">
              <div class="info-row">
                <span class="label">任务类型:</span>
                <span class="value">{{ model.task || '通用' }}</span>
              </div>
              <div class="info-row">
                <span class="label">下载量:</span>
                <span class="value">{{ formatNumber(model.downloads) }}</span>
              </div>
              <div class="info-row">
                <span class="label">收藏数:</span>
                <span class="value">{{ model.likes || 0 }}</span>
              </div>
              <div class="info-row">
                <span class="label">最后更新:</span>
                <span class="value">{{ formatDate(model.lastModified) }}</span>
              </div>
            </div>

            <!-- 模型标签 -->
            <div class="model-tags">
              <span 
                v-for="tag in (model.tags || []).slice(0, 4)"  
                :key="`tag-${model.modelId}-${tag}`"
                class="tag"
              >
                {{ tag }}
              </span>
            </div>

            <!-- 操作按钮（固定在卡片底部） -->
            <div class="model-actions">
              <a 
                :href="`https://huggingface.co/${model.modelId}`" 
                target="_blank" 
                rel="noopener noreferrer"
                class="btn hf-btn"
              >
                详情
              </a>
              <button 
                @click="copyModelId(model.modelId)" 
                class="btn copy-btn"
              >
                复制ID
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredModels.length === 0" class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>未找到匹配的模型</h3>
        <p>尝试调整搜索关键词或筛选条件</p>
        <button @click="resetFilters" class="reset-btn">重置筛选</button>
      </div>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="pagination">
        <button 
          @click="changePage(currentPage - 1)" 
          :disabled="currentPage === 1"
          class="page-btn"
        >
          上一页
        </button>
        <span class="page-info">
          第 {{ currentPage }} 页 / 共 {{ totalPages }} 页
        </span>
        <button 
          @click="changePage(currentPage + 1)" 
          :disabled="currentPage === totalPages"
          class="page-btn"
        >
          下一页
        </button>
      </div>
    </div>

    <!-- 复制成功提示 -->
    <div v-if="copySuccess" class="copy-toast">
      <span class="toast-icon">✓</span> 模型ID复制成功！
    </div>
  </div>
</template>

<script>
export default {
  name: 'HuggingFaceModelsPage',
  data() {
    return {
      // API配置
      hfConfig: {
        baseUrl: 'https://huggingface.co/api',
        perPage: 10,
        multimodalTags: ['vision', 'multimodal', 'image-to-text', 'text-to-image', 'vlm', 'vision-language']
      },
      // 数据状态
      allModels: [],
      filteredModels: [],
      loading: false,
      error: null,
      // 筛选条件
      searchQuery: '',
      selectedTask: 'multimodal',
      sortBy: 'downloads',
      // 分页
      currentPage: 1,
      totalPages: 1,
      // 统计信息
      stats: {
        totalModels: 0,
        downloads: 0,
        languages: 0
      },
      // 交互状态
      copySuccess: false,
      copyTimer: null
    }
  },
  created() {
    // 初始化防抖函数
    this.debouncedFilterModels = this.debounce(this.filterModels, 300);
    // 加载模型数据
    this.fetchModels();
  },
  computed: {
    // 计算当前页显示的模型（本地分页）
    paginatedModels() {
      const start = (this.currentPage - 1) * this.hfConfig.perPage;
      const end = start + this.hfConfig.perPage;
      return this.filteredModels.slice(start, end);
    }
  },
  methods: {
    /**
     * 从Hugging Face API获取模型数据
     */
    async fetchModels() {
      this.loading = true;
      this.error = null;

      try {
        // 构建请求参数
        const params = new URLSearchParams();
        params.append('limit', '100');
        params.append('offset', '0');
        params.append('sort', this.sortBy);
        params.append('direction', '-1');
        params.append('library', 'transformers');
        
        // 只在任务类型不是all/multimodal时添加task参数
        if (this.selectedTask !== 'all' && this.selectedTask !== 'multimodal') {
          params.append('pipeline_tag', this.selectedTask);
        }

        // 发送请求（添加超时处理）
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        
        const response = await fetch(
          `${this.hfConfig.baseUrl}/models?${params.toString()}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${this.hfConfig.apiKey}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            signal: controller.signal,
            mode: 'cors'
          }
        );
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API请求失败: ${response.status} ${response.statusText} - ${errorText.substring(0, 100)}`);
        }

        const data = await response.json();
        
        // 处理响应数据
        this.allModels = Array.isArray(data) ? data.map(model => this.formatModelData(model)) : [];
        
        // 如果选择的是multimodal，额外筛选多模态模型
        if (this.selectedTask === 'multimodal') {
          this.allModels = this.allModels.filter(model => this.isMultimodalModel(model));
        }
        
        // 初始筛选
        this.filterModels();
        
        // 计算统计信息
        this.calculateStats();

      } catch (err) {
        console.error('获取模型数据失败:', err);
        // 错误处理
        if (err.name === 'AbortError') {
          this.error = '请求超时，请检查网络连接或稍后重试';
        } else if (err.message.includes('400')) {
          this.error = '请求参数错误，已切换到本地模型数据';
          this.useFallbackModels();
        } else if (err.message.includes('401')) {
          this.error = 'API密钥无效，请检查您的API密钥';
        } else {
          this.error = err.message || '无法连接到Hugging Face API，已切换到本地数据';
          this.useFallbackModels();
        }
      } finally {
        this.loading = false;
      }
    },

    /**
     * 本地回退模型数据
     */
    useFallbackModels() {
      // 模拟多模态模型数据（修复语法错误：移除所有特殊字符和无效符号）
      this.allModels = [
        {
          modelId: 'meta-llama/Llama-3.2-11B-Vision-Instruct',
          name: 'Llama-3.2-11B-Vision-Instruct',
          author: 'meta-llama',
          owner: 'meta-llama',
          task: 'multimodal',
          tags: ['llama', 'vision', 'multimodal', 'instruct', 'english'],
          downloads: 1850000,
          likes: 3250,
          lastModified: '2025-01-15',
          private: false,
          isMultimodal: true,
          createdAt: '2025-01-15'
        },
        {
          modelId: 'Qwen/Qwen2-VL-7B-Instruct',
          name: 'Qwen2-VL-7B-Instruct',
          author: 'Qwen',
          owner: 'Qwen',
          task: 'image-to-text',
          tags: ['qwen', 'vision-language', 'chinese', 'multimodal'],
          downloads: 1250000,
          likes: 2100,
          lastModified: '2025-02-10',
          private: false,
          isMultimodal: true,
          createdAt: '2025-02-10'
        },
        {
          modelId: 'OpenGVLab/InternVL2-8B',
          name: 'InternVL2-8B',
          author: 'OpenGVLab',
          owner: 'OpenGVLab',
          task: 'vision',
          tags: ['internvl', 'vision', 'chinese', 'multimodal'],
          downloads: 780000,
          likes: 1650,
          lastModified: '2025-03-05',
          private: false,
          isMultimodal: true,
          createdAt: '2025-03-05'
        },
        {
          modelId: 'THUDM/CogVLM2-7B',
          name: 'CogVLM2-7B',
          author: 'THUDM',
          owner: 'THUDM',
          task: 'vision-question-answering',
          tags: ['cogvlm', 'vqa', 'chinese', 'multimodal'],
          downloads: 620000,
          likes: 1450,
          lastModified: '2025-01-25',
          private: false,
          isMultimodal: true,
          createdAt: '2025-01-25'
        },
        {
          modelId: 'stabilityai/stable-diffusion-xl-base-1.0',
          name: 'Stable Diffusion XL 1.0',
          author: 'stabilityai',
          owner: 'stabilityai',
          task: 'text-to-image',
          tags: ['sdxl', 'text-to-image', 'diffusion', 'multimodal'],
          downloads: 5200000,
          likes: 8500,
          lastModified: '2025-01-10',
          private: false,
          isMultimodal: true,
          createdAt: '2025-01-10'
        },
        {
          modelId: 'openai/whisper-large-v3',
          name: 'Whisper Large V3',
          author: 'openai',
          owner: 'openai',
          task: 'audio-classification',
          tags: ['whisper', 'audio', 'speech-recognition', 'multilingual'],
          downloads: 4800000,
          likes: 7800,
          lastModified: '2025-02-25',
          private: false,
          isMultimodal: false,
          createdAt: '2025-02-25'
        },
        {
          modelId: 'google/gemma-2-9b-it',
          name: 'Gemma-2-9b-it',
          author: 'google',
          owner: 'google',
          task: 'text-generation',
          tags: ['gemma', 'text-generation', 'english', 'open-source'],
          downloads: 2100000,
          likes: 3500,
          lastModified: '2025-02-18',
          private: false,
          isMultimodal: false,
          createdAt: '2025-02-18'
        },
        {
          modelId: 'mistralai/Mistral-Large-v2',
          name: 'Mistral Large v2',
          author: 'mistralai',
          owner: 'mistralai',
          task: 'text-generation',
          tags: ['mistral', 'text-generation', 'english', 'large'],
          downloads: 950000,
          likes: 2800,
          lastModified: '2025-03-15',
          private: true,
          isMultimodal: false,
          createdAt: '2025-03-15'
        },
        {
          modelId: 'Microsoft/Phi-3-vision-128k-instruct',
          name: 'Phi-3-vision-128k-instruct',
          author: 'Microsoft',
          owner: 'Microsoft',
          task: 'multimodal',
          tags: ['phi', 'vision', 'small', 'multilingual'],
          downloads: 750000,
          likes: 1950,
          lastModified: '2025-01-30',
          private: false,
          isMultimodal: true,
          createdAt: '2025-01-30'
        },
        {
          modelId: 'Salesforce/BLIP-2-FlanT5-XL',
          name: 'BLIP-2-FlanT5-XL',
          author: 'Salesforce',
          owner: 'Salesforce',
          task: 'image-to-text',
          tags: ['blip', 'vision-language', 'vqa', 'open-source'],
          downloads: 680000,
          likes: 1750,
          lastModified: '2025-02-05',
          private: false,
          isMultimodal: true,
          createdAt: '2025-02-05'
        },
        {
          modelId: 'facebook/segment-anything',
          name: 'Segment Anything Model',
          author: 'facebook',
          owner: 'facebook',
          task: 'vision',
          tags: ['segmentation', 'vision', 'image-processing', 'open-source'],
          downloads: 3200000,
          likes: 6500,
          lastModified: '2025-01-05',
          private: false,
          isMultimodal: true,
          createdAt: '2025-01-05'
        },
        {
          modelId: 'meta-llama/Llama-3.2-90B-Vision-Instruct',
          name: 'Llama-3.2-90B-Vision-Instruct',
          author: 'meta-llama',
          owner: 'meta-llama',
          task: 'multimodal',
          tags: ['llama', 'vision', 'multimodal', 'large'],
          downloads: 950000,
          likes: 2800,
          lastModified: '2025-01-20',
          private: false,
          isMultimodal: true,
          createdAt: '2025-01-20'
        },
        {
          modelId: 'Qwen/Qwen2-VL-72B-Instruct',
          name: 'Qwen2-VL-72B-Instruct',
          author: 'Qwen',
          owner: 'Qwen',
          task: 'multimodal',
          tags: ['qwen', 'vision-language', 'chinese', 'large'],
          downloads: 850000,
          likes: 1850,
          lastModified: '2025-02-15',
          private: false,
          isMultimodal: true,
          createdAt: '2025-02-15'
        }
      ];
      
      this.filterModels();
      this.calculateStats();
    },

    /**
     * 判断是否为多模态模型
     */
    isMultimodalModel(model) {
      // 多模态任务类型列表
      const multimodalTasks = ['image-to-text', 'text-to-image', 'vision-question-answering', 'multimodal', 'vision'];
      // 多模态标签判断
      const hasMultimodalTag = model.tags && model.tags.some(tag => 
        this.hfConfig.multimodalTags.includes(tag.toLowerCase())
      );
      // 任务类型判断
      const hasMultimodalTask = model.task && multimodalTasks.includes(model.task.toLowerCase());
      
      return hasMultimodalTag || hasMultimodalTask;
    },

    /**
     * 格式化模型数据
     */
    formatModelData(model) {
      // 安全处理：确保所有字段都有默认值
      const tags = Array.isArray(model.tags) ? model.tags : [];
      const isMultimodal = this.isMultimodalModel({
        tags: tags,
        task: model.pipeline_tag
      });

      return {
        modelId: model.modelId || model.id || '',
        name: model.name || (model.modelId ? model.modelId.split('/').pop() : '未知模型'),
        author: model.author || model.owner || '未知作者',
        owner: model.owner || 'unknown',
        task: model.pipeline_tag || '通用',
        tags: tags,
        downloads: Number(model.downloads) || 0,
        likes: Number(model.likes) || 0,
        lastModified: model.lastModified || model.createdAt || new Date().toISOString(),
        private: Boolean(model.private),
        isMultimodal: isMultimodal,
        createdAt: model.createdAt || new Date().toISOString()
      };
    },

    /**
     * 筛选模型
     */
    filterModels() {
      if (!Array.isArray(this.allModels) || this.allModels.length === 0) {
        this.filteredModels = [];
        this.totalPages = 1;
        return;
      }

      let filtered = [...this.allModels];

      // 1. 关键词搜索筛选
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase().trim();
        filtered = filtered.filter(model => 
          model.name.toLowerCase().includes(query) ||
          model.author.toLowerCase().includes(query) ||
          model.task.toLowerCase().includes(query) ||
          model.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }

      // 2. 任务类型筛选
      if (this.selectedTask !== 'all') {
        if (this.selectedTask === 'multimodal') {
          filtered = filtered.filter(model => model.isMultimodal);
        } else {
          filtered = filtered.filter(model => 
            model.task.toLowerCase() === this.selectedTask.toLowerCase()
          );
        }
      }

      // 3. 排序
      filtered = this.sortModels(filtered);

      // 更新筛选后的数据和分页
      this.filteredModels = filtered;
      this.totalPages = Math.max(1, Math.ceil(filtered.length / this.hfConfig.perPage));

      // 如果当前页超出总页数，重置到第一页
      if (this.currentPage > this.totalPages) {
        this.currentPage = 1;
      }
    },

    /**
     * 排序模型
     */
    sortModels(models) {
      return models.sort((a, b) => {
        switch (this.sortBy) {
          case 'downloads':
            return b.downloads - a.downloads;
          case 'likes':
            return (b.likes || 0) - (a.likes || 0);
          case 'created':
            return new Date(b.createdAt) - new Date(a.createdAt);
          case 'name':
            return a.name.localeCompare(b.name);
          default:
            return b.downloads - a.downloads;
        }
      });
    },

    /**
     * 计算统计信息
     */
    calculateStats() {
      this.stats = {
        totalModels: this.allModels.length,
        downloads: this.allModels.reduce((total, model) => total + (model.downloads || 0), 0),
        languages: this.countUniqueLanguages()
      };
    },

    /**
     * 统计唯一语言数量
     */
    countUniqueLanguages() {
      const languages = new Set();
      this.allModels.forEach(model => {
        model.tags.forEach(tag => {
          if (tag.startsWith('language:')) {
            languages.add(tag.split(':')[1]);
          }
        });
      });
      return languages.size;
    },

    /**
     * 分页切换
     */
    changePage(page) {
      if (page < 1 || page > this.totalPages) return;
      
      this.currentPage = page;
      
      // 滚动到顶部
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    /**
     * 任务类型改变时的处理
     */
    handleTaskChange() {
      this.currentPage = 1;
      this.fetchModels();
    },

    /**
     * 重置筛选条件
     */
    resetFilters() {
      this.searchQuery = '';
      this.selectedTask = 'multimodal';
      this.sortBy = 'downloads';
      this.currentPage = 1;
      this.filterModels();
    },

    /**
     * 复制模型ID
     */
    copyModelId(modelId) {
      if (!modelId) return;
      
      navigator.clipboard.writeText(modelId)
        .then(() => {
          this.copySuccess = true;
          
          // 清除之前的定时器
          if (this.copyTimer) clearTimeout(this.copyTimer);
          
          // 3秒后隐藏提示
          this.copyTimer = setTimeout(() => {
            this.copySuccess = false;
          }, 3000);
        })
        .catch(err => {
          console.error('复制失败:', err);
          // 降级处理
          const textArea = document.createElement('textarea');
          textArea.value = modelId;
          document.body.appendChild(textArea);
          textArea.select();
          try {
            document.execCommand('copy');
            this.copySuccess = true;
            setTimeout(() => {
              this.copySuccess = false;
            }, 3000);
          } catch (copyErr) {
            alert('复制失败，请手动复制: ' + modelId);
          }
          document.body.removeChild(textArea);
        });
    },

    /**
     * 格式化数字
     */
    formatNumber(num) {
      if (isNaN(num) || !num) return '0';
      
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
      } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
      }
      
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    /**
     * 格式化日期
     */
    formatDate(dateString) {
      if (!dateString) return '未知';
      
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      } catch (err) {
        return '未知';
      }
    },

    /**
     * 防抖函数
     */
    debounce(func, wait) {
      let timeout;
      return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
      };
    }
  }
};
</script>

<style scoped>
/* 基础样式 */
.hf-models-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #333;
}

/* 页面头部 */
.page-header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.page-header h1 {
  font-size: 1.8rem;
  margin-bottom: 8px;
  color: #2c3e50;
}

.page-header p {
  font-size: 1rem;
  color: #6c757d;
  margin-bottom: 15px;
}

.header-stats {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-top: 15px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 1.5rem;
  font-weight: 600;
  color: #667eea;
  margin-bottom: 3px;
}

.stat-label {
  font-size: 0.85rem;
  color: #6c757d;
}

/* 加载状态 */
.loading-overlay {
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 错误提示 */
.error-container {
  text-align: center;
  padding: 50px 20px;
  color: #dc3545;
}

.error-icon {
  font-size: 2.5rem;
  margin-bottom: 15px;
}

.error-container h3 {
  font-size: 1.3rem;
  margin-bottom: 8px;
}

.error-container p {
  color: #6c757d;
  margin-bottom: 15px;
  font-size: 0.95rem;
}

.retry-btn {
  padding: 8px 16px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background 0.2s;
}

.retry-btn:hover {
  background: #5a6fd8;
}

/* 筛选区域 */
.filters-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.search-box {
  flex: 1;
  min-width: 10px;
}

.search-box input {
  width: 100%;
  padding: 9px 4px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  outline: none;
  transition: border 0.2s;
}

.search-box input:focus {
  border-color: #667eea;
}

.filter-controls {
  display: flex;
  gap: 10px;
}

.filter-controls select {
  padding: 7px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.85rem;
  background: white;
  outline: none;
  min-width: 120px;
}

/* 模型网格 */
.models-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
  margin-bottom: 25px;
}

/* 模型卡片核心调整：固定高度 + 弹性布局 */
.model-card {
  background: white;
  border-radius: 6px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.08);
  padding: 10px;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid #f0f0f0;
  /* 固定卡片最小高度，确保对齐 */
  min-height: 320px;
}

.model-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  border-color: #e0e0e0;
}

/* 卡片内容容器：弹性布局，按钮固定在底部 */
.model-card-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* 模型头部 */
.model-header {
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid #f5f5f5;
}

.model-badges {
  display: flex;
  gap: 5px;
  margin-bottom: 5px;
  flex-wrap: wrap;
}

.badge {
  padding: 2px 5px;
  border-radius: 3px;
  font-size: 0.65rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.badge.popular {
  background: #ffeaa7;
  color: #e17055;
}

.badge.liked {
  background: #81ecec;
  color: #00cec9;
}

.badge.private {
  background: #fd79a8;
  color: white;
}

.badge.multimodal {
  background: #a29bfe;
  color: white;
}

.model-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 3px;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.model-author {
  color: #6c757d;
  font-size: 0.75rem;
  font-weight: 500;
}

/* 模型信息 */
.model-info {
  margin-bottom: 8px;
  font-size: 0.8rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 3px;
}

.label {
  color: #868e96;
  font-size: 0.75rem;
}

.value {
  color: #2c3e50;
  font-weight: 500;
}

/* 模型标签 */
.model-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 8px;
  /* 标签区域自动占满剩余空间，将按钮挤到底部 */
  flex: 1;
}

.tag {
  padding: 2px 6px;
  /* background: #f1f3f5; */
  /* color: #495057; */
  border-radius: 3px;
  font-size: 0.7rem;
}

/* 操作按钮：固定在卡片底部 */
.model-actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  /* 按钮区域固定在底部 */
  margin-top: auto;
}

.btn {
  padding: 5px 10px;
  border-radius: 3px;
  text-decoration: none;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: background 0.2s;
  flex: 1;
  text-align: center;
}

.hf-btn {
  background: #a855f7;
  color: white;
}

.hf-btn:hover {
  background: #7e22ce;
}

.copy-btn {
  background: #90a2f2;
  color: #212529;
}

.copy-btn:hover {
  background: #667eea;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 50px 20px;
  color: #6c757d;
  background: white;
  border-radius: 6px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.08);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 15px;
  color: #adb5bd;
}

.empty-state h3 {
  font-size: 1.2rem;
  margin-bottom: 8px;
  color: #495057;
}

.empty-state p {
  font-size: 0.9rem;
  margin-bottom: 15px;
}

.reset-btn {
  padding: 7px 14px;
  background: #a855f7;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
}

.reset-btn:hover {
  background: #7e22ce;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-bottom: 30px;
}

.page-btn {
  padding: 6px 12px;
  background: #a855f7;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 0.9rem;
}

.page-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.page-info {
  color: #6c757d;
  font-size: 0.9rem;
}

/* 复制提示 */
.copy-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #28a745;
  color: white;
  padding: 8px 15px;
  border-radius: 4px;
  box-shadow: 0 3px 10px rgba(0,0,0,0.15);
  z-index: 1000;
  animation: fadeIn 0.3s, fadeOut 0.3s 2.7s;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 6px;
}

.toast-icon {
  font-size: 1rem;
  font-weight: bold;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeOut {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(-10px); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-stats {
    flex-direction: column;
    gap: 15px;
  }
  
  .filters-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-controls {
    width: 100%;
    justify-content: space-between;
  }
  
  .models-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .model-card {
    padding: 8px;
    min-height: auto; /* 移动端取消固定高度 */
  }
}
</style>