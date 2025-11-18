<template>
  <section id="home" class="section-padding">
    <div class="container mx-auto">
      <!-- 首页标题和描述 -->
      <div class="home-header">
        <h1 class="popule-title text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple to-purple-light">
          运用图像对图像AI改变您的照片
        </h1> 
        <!-- <p class="text-gray-400 text-center popule text-lg mb-10">
          轻松地使用我们的图像对图像AI生成器转换您的图像。上传照片，从多种艺术风格中选择，或创建您自己的自定义外观，让AI将您的想法变为现实。简单、快速且富有创意。现在就试试，开启无限可能！
        </p> -->
        <div class="flex justify-center guide">
          <div class="btn-style">
            <router-link to="/guide" class="btn-primary hover:underline  inline-block">
            <i class="fa fa-arrow-right mr-2"></i>使用步骤
          </router-link>
          </div>
        </div>
      </div>

      <!-- 生成器面板  -->
      <div class="generator-section mt-12" id="generator">
        <GeneratorPanel />
      </div>

      <!-- 生成结果区域 -->
      <div class="results-section mt-12">
        <h2 class="text-3xl font-bold mb-6 ">最近任务</h2>
        <div class="card">
          <div v-if="imageStore.isGenerating" class="text-center py-8">
            <i class="fa fa-spinner fa-spin text-purple-light text-5xl mb-4"></i>
            <p class="text-gray-400">AI正在生成图像，请稍候...</p>
          </div>
          
          <div v-else-if="imageStore.generatedImages.length > 0" class="generated-images-grid">
            <div 
              class="generated-image-item" 
              v-for="image in imageStore.generatedImages" 
              :key="image.id"
            >
              <img :src="image.url" alt="AI生成图像" loading="lazy">
              <div class="image-actions">
                <button 
                  class="image-action-btn" 
                  title="下载" 
                  @click="imageStore.downloadImage(image.url)"
                >
                  <i class="fa fa-download"></i>
                </button>
                <button 
                  class="image-action-btn" 
                  title="重新生成" 
                  @click="imageStore.generateImage"
                >
                  <i class="fa fa-refresh"></i>
                </button>
                <button 
                  class="image-action-btn" 
                  title="删除" 
                  @click="imageStore.deleteImage(image.id)"
                >
                  <i class="fa fa-trash"></i>
                </button>
              </div>
            </div>
          </div>

          <div v-else class="no-tasks">
            <i class="fa fa-image text-gray-500 text-5xl mb-4"></i>
            <p class="text-gray-400">暂无生成记录</p>
            <p class="text-gray-500 text-sm mt-2">使用上方的生成器创建您的第一张AI图像</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import GeneratorPanel from '@/components/GeneratorPanel.vue'
import { useImageStore } from '@/stores/imageStore'

const imageStore = useImageStore()

const scrollToGenerator = () => {
  const generatorSection = document.getElementById('generator')
  if (generatorSection) {
    generatorSection.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<style scoped>
.section-padding {
  padding: 1rem 0;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
}

.home-header h1{
  font-size: 3rem;
  /* margin-bottom: 4rem; */
}

.popule-title {
  font-size: 1rem;
  color: #7e22ce;
  margin-bottom: 2rem;
}

@media (min-width: 768px) {
  .popule-title {
    font-size: 5rem;
  }
}

.popule {
  max-width: 800px;
  margin: 0 auto 2rem;
}
.guide{
  margin: -2.5rem;
}
.btn-primary {
  background-color: #7e22ce;
  color: white;
  border: none;
  border-radius: 0.375rem;
  padding: 0.75rem 2rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary:hover {
  background-color: #a855f7;
}

.btn-style {
  margin: 2rem 0;
}

.generator-section {
  margin-top: 3rem;
}

.results-section {
  margin-top: 4rem;
}

.card {
  background-color: #1e293b;
  border: 1px solid #374151;
  border-radius: 0.75rem;
  overflow: hidden;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.generated-images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
  width: 100%;
}

.generated-image-item {
  border-radius: 0.75rem;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  transition: transform 0.3s ease;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.generated-image-item img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

.generated-image-item:hover {
  transform: translateY(-4px);
}

.image-actions {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.8));
  padding: 0.75rem;
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.generated-image-item:hover .image-actions {
  opacity: 1;
}

.image-action-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: rgba(255,255,255,0.2);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(8px);
}

.image-action-btn:hover {
  background-color: rgba(255,255,255,0.3);
  transform: scale(1.1);
}

.no-tasks {
  padding: 3rem;
  text-align: center;
}

.text-center {
  text-align: center;
}

.text-3xl {
  font-size: 1.875rem;
  line-height: 2.25rem;
}

.text-lg {
  font-size: 1.125rem;
  line-height: 1.75rem;
}

.text-gray-400 {
  color: #9ca3af;
}

.text-gray-500 {
  color: #6b7280;
}

.text-purple-light {
  color: #a855f7;
}

.mb-6 {
  margin-bottom: 1.5rem;
}

.mb-10 {
  margin-bottom: 2.5rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.py-8 {
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.px-8 {
  padding-left: 2rem;
  padding-right: 2rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

.mt-12 {
  margin-top: 3rem;
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.bg-clip-text {
  -webkit-background-clip: text;
  background-clip: text;
}

.text-transparent {
  color: transparent;
}

.bg-gradient-to-r {
  background-image: linear-gradient(to right, var(--tw-gradient-stops));
}

.from-purple {
  --tw-gradient-from: #7e22ce;
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(126, 34, 206, 0));
}

.to-purple-light {
  --tw-gradient-to: #a855f7;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .popule-title {
    font-size: 2.5rem;
  }
  
  .generated-images-grid {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
  
  .generated-image-item img {
    height: 180px;
  }
}
</style>