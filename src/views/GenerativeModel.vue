<template>
  <div class="generative-model">
    <!-- 页面头部 -->
    <!-- <header class="model-header">
      <div class="container">
        <div class="header-content">
          <div class="logo">
            <div class="logo-icon">🎨</div>
            <h1>AI生成模型</h1>
          </div>
          <div class="header-actions">
            <button class="btn-secondary" @click="showHistory = !showHistory">
              📚 生成历史
            </button>
            <button class="btn-primary" @click="exportProject">
              💾 导出项目
            </button>
          </div>
        </div>
      </div>
    </header> -->

    <div class="container">
      <div class="model-content">
        <!-- 左侧配置面板 -->
        <aside class="config-panel">
          <!-- 模型选择 -->
          <div class="config-section">
            <h3>模型选择</h3>
            <div class="model-grid">
              <div 
                v-for="model in aiModels" 
                :key="model.id"
                class="model-card"
                :class="{ active: selectedModel.id === model.id }"
                @click="selectModel(model)"
              >
                <div class="model-icon">{{ model.icon }}</div>
                <div class="model-info">
                  <h4>{{ model.name }}</h4>
                  <p>{{ model.description }}</p>
                </div>
                <div class="model-badge" :class="model.type">
                  {{ model.type === 'free' ? '免费' : '高级' }}
                </div>
              </div>
            </div>
          </div>

          <!-- 参数配置 -->
          <div class="config-section">
            <h3>生成参数</h3>
            <div class="param-group">
              <label>生成强度</label>
              <div class="slider-container">
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  v-model="generationParams.strength"
                  class="param-slider"
                >
                <span class="slider-value">{{ generationParams.strength }}%</span>
              </div>
            </div>

            <div class="param-group">
              <label>创意度</label>
              <div class="slider-container">
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  v-model="generationParams.creativity"
                  class="param-slider"
                >
                <span class="slider-value">{{ generationParams.creativity }}%</span>
              </div>
            </div>

            <div class="param-group">
              <label>输出数量</label>
              <select v-model="generationParams.outputCount" class="param-select">
                <option value="1">1个结果</option>
                <option value="4">4个结果</option>
                <option value="9">9个结果</option>
              </select>
            </div>

            <div class="param-group" v-if="selectedModel.supportsStyle">
              <label>风格预设</label>
              <div class="style-grid">
                <div 
                  v-for="style in stylePresets" 
                  :key="style.id"
                  class="style-item"
                  :class="{ active: generationParams.style === style.id }"
                  @click="generationParams.style = style.id"
                >
                  <div class="style-preview" :style="{ background: style.color }"></div>
                  <span>{{ style.name }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 高级设置 -->
          <div class="config-section">
            <h3>高级设置</h3>
            <div class="param-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="generationParams.enhanceQuality">
                高清增强
              </label>
            </div>
            <div class="param-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="generationParams.removeWatermark">
                去除水印
              </label>
            </div>
          </div>
        </aside>

        <!-- 中间预览区域 -->
        <main class="preview-area">
          <!-- 输入区域 -->
          <div class="input-section">
            <h3>输入内容</h3>
            <div class="input-tabs">
              <button 
                v-for="tab in inputTabs" 
                :key="tab.id"
                :class="{ active: activeInputTab === tab.id }"
                @click="activeInputTab = tab.id"
                class="tab-btn"
              >
                {{ tab.label }}
              </button>
            </div>

            <!-- 文本输入 -->
            <div v-if="activeInputTab === 'text'" class="text-input-container">
              <textarea 
                v-model="inputText" 
                placeholder="描述您想要生成的内容..."
                class="text-input"
                rows="6"
              ></textarea>
              <div class="input-actions">
                <button class="btn-sm" @click="clearInput">
                  🗑️ 清空
                </button>
                <button class="btn-sm" @click="suggestPrompt">
                  💡 智能建议
                </button>
              </div>
            </div>

            <!-- 图片上传 -->
            <div v-else-if="activeInputTab === 'image'" class="image-input-container">
              <div 
                class="upload-area"
                @drop="handleImageDrop"
                @dragover.prevent
                @dragenter.prevent
              >
                <div v-if="!uploadedImage" class="upload-placeholder">
                  <div class="upload-icon">📁</div>
                  <p>拖拽图片到这里或点击上传</p>
                  <input 
                    type="file" 
                    accept="image/*" 
                    @change="handleImageUpload"
                    class="file-input"
                  >
                </div>
                <div v-else class="image-preview">
                  <img :src="uploadedImage" alt="上传的图片">
                  <button class="remove-image" @click="uploadedImage = null">×</button>
                </div>
              </div>
            </div>
          </div>

          <!-- 生成按钮 -->
          <div class="generate-section">
            <button 
              class="generate-btn"
              :class="{ loading: isGenerating }"
              :disabled="!canGenerate || isGenerating"
              @click="generateContent"
            >
              <span v-if="isGenerating">🔄 生成中...</span>
              <span v-else>🎨 开始生成</span>
            </button>
            <div class="generate-info">
              <span>预计耗时: {{ estimatedTime }}秒</span>
              <span>消耗积分: {{ costPoints }}点</span>
            </div>
          </div>

          <!-- 结果展示 -->
          <div class="results-section">
            <h3>生成结果</h3>
            <div v-if="generatedResults.length === 0" class="empty-results">
              <div class="empty-icon">🎨</div>
              <p>暂无生成结果</p>
              <p class="empty-tip">配置参数后点击"开始生成"</p>
            </div>
            <div v-else class="results-grid">
              <div 
                v-for="(result, index) in generatedResults" 
                :key="result.id"
                class="result-card"
              >
                <div class="result-image">
                  <img :src="result.imageUrl" :alt="`生成结果 ${index + 1}`">
                  <div class="result-actions">
                    <button @click="downloadResult(result)" class="action-btn">⬇️</button>
                    <button @click="shareResult(result)" class="action-btn">🔗</button>
                    <button @click="deleteResult(result.id)" class="action-btn">🗑️</button>
                  </div>
                </div>
                <div class="result-info">
                  <p class="result-prompt">{{ result.prompt }}</p>
                  <span class="result-time">{{ result.timestamp }}</span>
                </div>
              </div>
            </div>
          </div>
        </main>

        <!-- 右侧历史记录 -->
        <aside class="history-panel" v-if="showHistory">
          <div class="history-header">
            <h3>生成历史</h3>
            <button @click="showHistory = false" class="close-btn">×</button>
          </div>
          <div class="history-list">
            <div 
              v-for="item in generationHistory" 
              :key="item.id"
              class="history-item"
              @click="loadHistoryItem(item)"
            >
              <div class="history-thumbnail">
                <img :src="item.thumbnail" alt="历史记录">
              </div>
              <div class="history-details">
                <p class="history-prompt">{{ item.prompt }}</p>
                <span class="history-time">{{ item.timestamp }}</span>
                <span class="history-model">{{ item.model }}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// 模型数据
interface AIModel {
  id: string
  name: string
  icon: string
  description: string
  type: 'free' | 'premium'
  supportsStyle: boolean
}

interface GenerationParams {
  strength: number
  creativity: number
  outputCount: number
  style: string
  enhanceQuality: boolean
  removeWatermark: boolean
}

interface GenerationResult {
  id: string
  imageUrl: string
  prompt: string
  timestamp: string
  model: string
}

// 响应式数据
const aiModels = ref<AIModel[]>([
  {
    id: 'stable-diffusion',
    name: 'Stable Diffusion',
    icon: '🎨',
    description: '文本到图像生成模型',
    type: 'free',
    supportsStyle: true
  },
  {
    id: 'dalle',
    name: 'DALL-E 3',
    icon: '🤖',
    description: 'OpenAI图像生成',
    type: 'premium',
    supportsStyle: true
  },
  {
    id: 'midjourney',
    name: 'Midjourney',
    icon: '✨',
    description: '艺术风格生成',
    type: 'premium',
    supportsStyle: true
  },
  {
    id: 'stylegan',
    name: 'StyleGAN',
    icon: '🖼️',
    description: '人像和风格迁移',
    type: 'free',
    supportsStyle: false
  }
])

const selectedModel = ref<AIModel>(aiModels.value[0])
const generationParams = ref<GenerationParams>({
  strength: 75,
  creativity: 60,
  outputCount: 4,
  style: 'realistic',
  enhanceQuality: false,
  removeWatermark: false
})

const inputText = ref('')
const uploadedImage = ref<string | null>(null)
const activeInputTab = ref('text')
const isGenerating = ref(false)
const showHistory = ref(false)
const generatedResults = ref<GenerationResult[]>([])
const generationHistory = ref<GenerationResult[]>([])

// 预设数据
const stylePresets = ref([
  { id: 'realistic', name: '写实', color: '#4ade80' },
  { id: 'anime', name: '动漫', color: '#f87171' },
  { id: 'oil-painting', name: '油画', color: '#fbbf24' },
  { id: 'watercolor', name: '水彩', color: '#60a5fa' },
  { id: 'cyberpunk', name: '赛博朋克', color: '#c084fc' },
  { id: 'minimalist', name: '极简', color: '#64748b' }
])

const inputTabs = ref([
  { id: 'text', label: '文本描述' },
  { id: 'image', label: '图片输入' }
])

// 计算属性
const canGenerate = computed(() => {
  return inputText.value.trim().length > 0 || uploadedImage.value !== null
})

const estimatedTime = computed(() => {
  const baseTime = 30
  const qualityMultiplier = generationParams.value.enhanceQuality ? 1.5 : 1
  const countMultiplier = generationParams.value.outputCount
  return Math.round(baseTime * qualityMultiplier * countMultiplier)
})

const costPoints = computed(() => {
  const baseCost = selectedModel.value.type === 'premium' ? 10 : 5
  const qualityCost = generationParams.value.enhanceQuality ? 5 : 0
  const watermarkCost = generationParams.value.removeWatermark ? 3 : 0
  return baseCost + qualityCost + watermarkCost
})

// 方法
const selectModel = (model: AIModel) => {
  selectedModel.value = model
}

const handleImageUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      uploadedImage.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const handleImageDrop = (event: DragEvent) => {
  event.preventDefault()
  const files = event.dataTransfer?.files
  if (files && files[0].type.startsWith('image/')) {
    const reader = new FileReader()
    reader.onload = (e) => {
      uploadedImage.value = e.target?.result as string
    }
    reader.readAsDataURL(files[0])
  }
}

const clearInput = () => {
  inputText.value = ''
  uploadedImage.value = null
}

const suggestPrompt = () => {
  const prompts = [
    '一只在星空下看书的猫咪，梦幻风格',
    '未来城市中的空中花园，赛博朋克风格',
    '森林中的水晶宫殿，阳光透过树叶',
    '海底的机械城堡，周围游动着发光的鱼'
  ]
  inputText.value = prompts[Math.floor(Math.random() * prompts.length)]
}

const generateContent = async () => {
  if (!canGenerate.value || isGenerating.value) return
  
  isGenerating.value = true
  
  try {
    // 模拟生成过程
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    const newResult: GenerationResult = {
      id: Date.now().toString(),
      imageUrl: `https://picsum.photos/400/400?random=${Date.now()}`,
      prompt: inputText.value || '基于图片生成',
      timestamp: new Date().toLocaleString(),
      model: selectedModel.value.name
    }
    
    generatedResults.value.unshift(newResult)
    generationHistory.value.unshift({
      ...newResult,
      thumbnail: newResult.imageUrl // 添加缩略图字段
    })
    
  } catch (error) {
    console.error('生成失败:', error)
  } finally {
    isGenerating.value = false
  }
}

const downloadResult = (result: GenerationResult) => {
  // 模拟下载功能
  const link = document.createElement('a')
  link.href = result.imageUrl
  link.download = `ai-generated-${result.id}.jpg`
  link.click()
}

const shareResult = (result: GenerationResult) => {
  // 模拟分享功能
  if (navigator.share) {
    navigator.share({
      title: 'AI生成作品',
      text: result.prompt,
      url: result.imageUrl
    })
  } else {
    // 备用方案
    navigator.clipboard.writeText(result.imageUrl)
    alert('图片链接已复制到剪贴板')
  }
}

const deleteResult = (id: string) => {
  generatedResults.value = generatedResults.value.filter(result => result.id !== id)
}

const loadHistoryItem = (item: GenerationResult) => {
  inputText.value = item.prompt
  generatedResults.value = [item]
  showHistory.value = false
}

const exportProject = () => {
  // 导出项目功能
  const projectData = {
    model: selectedModel.value,
    params: generationParams.value,
    input: inputText.value,
    results: generatedResults.value
  }
  console.log('导出项目:', projectData)
  alert('项目导出功能开发中...')
}

onMounted(() => {
  // 初始化一些示例数据
  generationHistory.value = [
    {
      id: '1',
      imageUrl: 'https://picsum.photos/200/200?random=1',
      thumbnail: 'https://picsum.photos/200/200?random=1',
      prompt: '星空下的魔法森林',
      timestamp: '2024-01-15 14:30',
      model: 'Stable Diffusion'
    },
    {
      id: '2',
      imageUrl: 'https://picsum.photos/200/200?random=2',
      thumbnail: 'https://picsum.photos/200/200?random=2',
      prompt: '未来城市夜景',
      timestamp: '2024-01-14 10:15',
      model: 'DALL-E 3'
    }
  ]
})
</script>

<style scoped>
.generative-model {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1f35 0%, #2d3748 100%);
  color: #e2e8f0;
}

.model-header {
  background: rgba(26, 32, 44, 0.95);
  backdrop-filter: blur(10px);
  padding: 1rem 0;
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
  gap: 0.5rem;
}

.logo-icon {
  font-size: 2rem;
}

.logo h1 {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #a855f7 0%, #7e22ce 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.model-content {
  display: grid;
  grid-template-columns: 320px 1fr auto;
  gap: 1.5rem;
  padding: 1.5rem 0;
  min-height: calc(100vh - 80px);
}

/* 配置面板样式 */
.config-panel {
  background: rgba(26, 32, 44, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  padding: 1.5rem;
  height: fit-content;
  border: 1px solid #4a5568;
}

.config-section {
  margin-bottom: 2rem;
}

.config-section h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #a855f7;
}

.model-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.model-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border: 2px solid #4a5568;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  background: rgba(45, 55, 72, 0.6);
}

.model-card:hover {
  border-color: #a855f7;
  transform: translateY(-2px);
}

.model-card.active {
  border-color: #7e22ce;
  background: rgba(126, 34, 206, 0.1);
}

.model-icon {
  font-size: 1.5rem;
}

.model-info h4 {
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #d8b4fe;
}

.model-info p {
  font-size: 0.875rem;
  color: #a0aec0;
}

.model-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.model-badge.free {
  background: rgba(72, 187, 120, 0.2);
  color: #48bb78;
  border: 1px solid #48bb78;
}

.model-badge.premium {
  background: rgba(246, 173, 85, 0.2);
  color: #f6ad55;
  border: 1px solid #f6ad55;
}

/* 参数控件样式 */
.param-group {
  margin-bottom: 1.25rem;
}

.param-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #d8b4fe;
}

.slider-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.param-slider {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: #4a5568;
  outline: none;
  -webkit-appearance: none;
}

.param-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #7e22ce;
  cursor: pointer;
  border: 2px solid #2d3748;
}

.slider-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #a855f7;
  min-width: 3rem;
}

.param-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #4a5568;
  border-radius: 0.5rem;
  background: #2d3748;
  font-size: 0.875rem;
  color: #e2e8f0;
}

.style-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.style-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 2px solid #4a5568;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(45, 55, 72, 0.6);
}

.style-item.active {
  border-color: #7e22ce;
  background: rgba(126, 34, 206, 0.1);
}

.style-preview {
  width: 100%;
  height: 40px;
  border-radius: 0.25rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: #cbd5e0;
}

.checkbox-label input {
  width: 1rem;
  height: 1rem;
}

/* 预览区域样式 */
.preview-area {
  background: rgba(26, 32, 44, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid #4a5568;
}

.input-section {
  margin-bottom: 1.5rem;
}

.input-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tab-btn {
  padding: 0.75rem 1.5rem;
  border: 1px solid #4a5568;
  border-radius: 0.5rem;
  background: #2d3748;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #a0aec0;
}

.tab-btn.active {
  background: #7e22ce;
  color: white;
  border-color: #7e22ce;
}

.text-input {
  width: 100%;
  padding: 1rem;
  border: 1px solid #4a5568;
  border-radius: 0.5rem;
  resize: vertical;
  font-family: inherit;
  background: #2d3748;
  color: #e2e8f0;
}

.input-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.upload-area {
  border: 2px dashed #4a5568;
  border-radius: 0.5rem;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(45, 55, 72, 0.6);
}

.upload-area:hover {
  border-color: #a855f7;
}

.upload-placeholder {
  color: #a0aec0;
}

.upload-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.file-input {
  display: none;
}

.image-preview {
  position: relative;
  display: inline-block;
}

.image-preview img {
  max-width: 300px;
  max-height: 300px;
  border-radius: 0.5rem;
}

.remove-image {
  position: absolute;
  top: -10px;
  right: -10px;
  background: #e53e3e;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
}

/* 生成按钮区域 */
.generate-section {
  text-align: center;
  margin: 2rem 0;
}

.generate-btn {
  background: linear-gradient(135deg, #7e22ce 0%, #6b21a8 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 0.75rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 200px;
}

.generate-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(126, 34, 206, 0.4);
}

.generate-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.generate-btn.loading {
  background: #4a5568;
}

.generate-info {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 1rem;
  color: #a0aec0;
  font-size: 0.875rem;
}

/* 结果展示区域 */
.results-section h3 {
  margin-bottom: 1rem;
  color: #a855f7;
}

.empty-results {
  text-align: center;
  padding: 3rem;
  color: #a0aec0;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-tip {
  font-size: 0.875rem;
  margin-top: 0.5rem;
  color: #718096;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.result-card {
  background: rgba(45, 55, 72, 0.8);
  border-radius: 0.75rem;
  overflow: hidden;
  border: 1px solid #4a5568;
  transition: all 0.3s ease;
}

.result-card:hover {
  transform: translateY(-4px);
  border-color: #a855f7;
}

.result-image {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
}

.result-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.result-actions {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.result-card:hover .result-actions {
  opacity: 1;
}

.action-btn {
  background: rgba(26, 32, 44, 0.9);
  border: 1px solid #4a5568;
  border-radius: 0.25rem;
  width: 32px;
  height: 32px;
  cursor: pointer;
  backdrop-filter: blur(10px);
  color: #a0aec0;
}

.action-btn:hover {
  background: #7e22ce;
  color: white;
}

.result-info {
  padding: 1rem;
}

.result-prompt {
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: #cbd5e0;
}

.result-time {
  font-size: 0.75rem;
  color: #718096;
}

/* 历史记录面板 */
.history-panel {
  background: rgba(26, 32, 44, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  padding: 1.5rem;
  width: 300px;
  height: fit-content;
  border: 1px solid #4a5568;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.history-header h3 {
  color: #a855f7;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #a0aec0;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 600px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(45, 55, 72, 0.6);
  border: 1px solid #4a5568;
}

.history-item:hover {
  border-color: #a855f7;
}

.history-thumbnail {
  width: 60px;
  height: 60px;
  border-radius: 0.5rem;
  overflow: hidden;
  flex-shrink: 0;
}

.history-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.history-details {
  flex: 1;
  min-width: 0;
}

.history-prompt {
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: #cbd5e0;
}

.history-time,
.history-model {
  font-size: 0.75rem;
  color: #718096;
}

.history-model {
  display: block;
  margin-top: 0.125rem;
}

/* 通用按钮样式 */
.btn-primary {
  background: linear-gradient(135deg, #7e22ce, #6b21a8);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(126, 34, 206, 0.3);
}

.btn-secondary {
  background: rgba(45, 55, 72, 0.8);
  color: #d8b4fe;
  border: 1px solid #4a5568;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  border-color: #a855f7;
  color: #a855f7;
}

.btn-sm {
  background: rgba(45, 55, 72, 0.8);
  color: #a0aec0;
  border: 1px solid #4a5568;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.btn-sm:hover {
  background: #4a5568;
  color: #e2e8f0;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .model-content {
    grid-template-columns: 1fr;
  }
  
  .history-panel {
    position: fixed;
    top: 0;
    right: 0;
    height: 100vh;
    z-index: 1000;
    transform: translateX(100%);
    transition: transform 0.3s ease;
  }
  
  .history-panel.show {
    transform: translateX(0);
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
  }
  
  .header-actions {
    width: 100%;
    justify-content: center;
  }
  
  .results-grid {
    grid-template-columns: 1fr;
  }
  
  .style-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>