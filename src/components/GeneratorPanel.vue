<template>
  <div class="generator-panel">
    <h2 class="text-3xl font-bold mb-6">图生图生成器</h2>

    <!-- 模型选择（单选下拉框） -->
    <div class="mb-6">
      <label class="block text-sm text-gray-400 mb-2 model">选择模型</label>
      <div class="relative">
        <select
          class="w-full bg-navDark border border-navBorder rounded p-3 text-white focus:outline-none focus:ring-1 focus:ring-purple appearance-none"
          v-model="selectedModel"
        >
          <option :value="model.id" v-for="model in models" :key="model.id">
            {{ model.name }}
            <span class="model-status-indicator inline-block" :class="model.status"></span>
          </option>
        </select>
      </div>

      <!-- 模型状态信息 -->
      <!-- <div class="mt-2 bg-navDark/70 border border-navBorder rounded p-2 flex items-center justify-between text-sm">
        <span class="flex items-center">
          <i class="fa fa-circle text-green-500 mr-2 text-xs" v-if="currentModel.status === 'connected'"></i>
          <i class="fa fa-spinner fa-spin mr-2 text-xs" v-if="currentModel.status === 'testing'"></i>
          <i class="fa fa-circle text-red-500 mr-2 text-xs" v-if="currentModel.status === 'error'"></i>
          {{ getStatusText(currentModel.status) }}
        </span>
        <button 
          class="text-purple-light hover:text-purple" 
          @click="testSelectedModelConnection"
        >
          测试连接
        </button>
      </div> -->
    </div>

    <!-- 图片上传 -->
    <!-- <label class="block text-sm text-gray-400 mb-2">上传参考图片</label> -->
    <div class="upload-container border-2 border-navBorder rounded-lg p-4 bg-navDark/50 mb-6">
      <div class="upload-area">
        <input
          type="file"
          accept="image/*"
          class="hidden"
          id="imageUpload"
          @change="handleFileChange"
        />
        <label
          for="imageUpload"
          class="flex flex-col items-center justify-center w-full h-full cursor-pointer"
        >
          <i class="fa fa-upload text-purple-light text-3xl mb-2"></i>
          <h3 class="text-lg font-medium mb-1">点击上传图片</h3>
          <p class="text-sm text-gray-400">Upload an image to transform</p>
        </label>
      </div>
    </div>

    <!-- 提示词 -->
    <!-- <div class="mb-6 prompt">
      <label class="block text-sm text-gray-400 mb-2 prompt-size">提示词 </label>
      <textarea
        class="w-full bg-navDark border border-navBorder rounded p-3 text-white focus:outline-none focus:ring-1 focus:ring-purple prompt-item"
        rows="2"
        v-model="imageStore.promptText"
      ></textarea>
    </div> -->

    <!-- 输出数量 -->
    <div class="mb-6 quantity">
      <label class="block text-sm text-gray-400 mb-2">输出图像数量</label>
      <select
        class="w-full bg-navDark border border-navBorder rounded p-3 text-white focus:outline-none focus:ring-1 focus:ring-purple quantity-item"
        v-model="imageStore.imageCount"
      >
        <option value="1">1张图像</option>
        <option value="2">2张图像</option>
        <option value="4">4张图像</option>
      </select>
    </div>

    <!-- 生成按钮 -->
    <button
      class="btn-primary w-full flex items-center justify-center"
      @click="imageStore.generateImage"
      :disabled="imageStore.isGenerating || !selectedModel"
    >
      <i class="fa fa-spinner fa-spin mr-2" v-if="imageStore.isGenerating"></i>
      <i class="fa fa-magic mr-2" v-else></i>

      <span v-if="imageStore.isGenerating">生成中...</span>
      <span v-else>生成</span>
    </button>
    <p class="text-xs text-gray-500 text-center mt-2 consume">每次生成消耗3积分</p>

    <!-- 最近任务区域 -->
    <div class="recent-tasks mt-8">
      <h3 class="text-xl font-semibold mb-4">最近生成的图片</h3>
      <div v-if="imageStore.generatedImages.length === 0" class="no-tasks">
        <p class="text-gray-400 text-center py-6">暂无生成记录</p>
      </div>
      <div class="recent-images-grid" v-else>
        <div class="recent-image-item" v-for="image in imageStore.generatedImages" :key="image.id">
          <img
            :src="image.url"
            :alt="`Generated image ${image.id}`"
            class="w-full h-32 object-cover rounded"
          />
          <div class="image-info">
            <span class="text-xs text-gray-400">
              {{ new Date(image.timestamp).toLocaleString() }}
            </span>
            <div class="image-actions">
              <button class="text-xs text-purple-light" @click="downloadImage(image.url)">
                <i class="fa fa-download mr-1"></i>保存
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useImageStore } from '@/stores/imageStore'
import { ref, computed } from 'vue'

const imageStore = useImageStore()

// 模型列表数据
const models = [
  { id: 'sd', name: 'Stable Diffusion', status: 'connected' },
  { id: 'midjourney', name: 'MidJourney', status: 'connected' },
  { id: 'dall-e', name: 'DALL·E 3', status: 'testing' },
  { id: 'kandinsky', name: 'Kandinsky', status: 'error' },
  { id: 'anything', name: 'Anything V3', status: 'connected' },
]

// 选中的模型（默认选中第一个）
const selectedModel = ref<string>(models[0].id)

// 获取当前选中的模型信息
const currentModel = computed(() => {
  return models.find((model) => model.id === selectedModel.value) || models[0]
})

// // 模型状态文本映射
// const getStatusText = (status: string) => {
//   const statusMap: Record<string, string> = {
//     connected: '已连接',
//     testing: '测试中',
//     error: '连接错误',
//   }
//   return statusMap[status] || '未知状态'
// }

// 测试选中模型的连接状态
const testSelectedModelConnection = () => {
  // 调用测试连接API，传入当前选中的模型ID
  imageStore.testApiConnection([selectedModel.value])
}

// 处理文件上传
const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    imageStore.handleImageUpload(target.files[0])
  }
}

// 下载图片
const downloadImage = (url: string) => {
  const link = document.createElement('a')
  link.href = url
  link.download = `generated-${Date.now()}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<style scoped>
/* 生成器面板样式 */
.generator-panel {
  padding: 1rem;
  margin-top: -3rem;
}

/* 模型选择样式 */
.model-status-indicator {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  margin-left: 0.5rem;
}

.model-status-indicator.connected {
  background-color: #22c55e;
}

.model-status-indicator.testing {
  background-color: #f59e0b;
  animation: pulse 1.5s infinite;
}

.model-status-indicator.error {
  background-color: #ef4444;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* 上传区域样式 */
.upload-area {
  margin: 1rem;
  border: 2px dashed #a855f7;
  border-radius: 0.5rem;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-area:hover {
  background-color: rgba(126, 34, 206, 0.1);
}
/* 选择模型 */
.relative {
  margin: 0 0 1rem 0;
}
/* 提示词 输出数量 */
.prompt {
  margin: 2rem 0;
  position: relative;
}
.prompt-item {
  margin: 0.5rem;
  position: absolute;
}
/* .prompt-size{
    position: relative;
} */
/* 输出数量 */
.quantity-item {
  margin-left: 0.5rem;
}
.quantity {
  margin: 1rem 0;
}

/* 按钮样式 */
/* 生成 */

.btn-primary {
  background-color: #7e22ce;
  color: white;
  border: none;
  border-radius: 0.375rem;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-primary:hover {
  background-color: #a855f7;
}

.btn-primary:disabled {
  background-color: #581c87;
  cursor: not-allowed;
}
.consume {
  width: 160px;
  border: 1px dashed #a855f7;
  border-radius: 0.3rem;
  text-align: center;
  padding: 0.5rem 0;

}

/* 最近任务样式 */
.recent-tasks {
  margin-top: 2rem;
}

.recent-images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
}

.recent-image-item {
  border: 1px solid #374151;
  border-radius: 0.5rem;
  overflow: hidden;
}

.image-info {
  padding: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #1e293b;
}

.image-actions button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.no-tasks {
  border: 1px dashed #374151;
  border-radius: 0.5rem;
}
</style>