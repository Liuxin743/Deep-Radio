<template>
  <section id="generator" class="section-padding">
    <div class="container mx-auto max-w-5xl">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- 生成器面板 -->
        <GeneratorPanel />
        
        <!-- 右侧结果区域 -->
        <div class="right-column">
          <h2 class="text-3xl font-bold mb-6">最近任务</h2>
          <div class="card h-full">
            <div v-if="imageStore.isGenerating" class="text-center py-8">
              <i class="fa fa-spinner fa-spin text-purple-light text-5xl mb-4"></i>
              <p class="text-gray-400">AI正在生成图像，请稍候...</p>
            </div>
            
            <div v-else-if="imageStore.generatedImages.length > 0" id="generatedImages">
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
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import GeneratorPanel from '@/components/GeneratorPanel.vue';
import { useImageStore } from '@/stores/imageStore';

const imageStore = useImageStore();
</script>

<style scoped>
#generator {
  padding: 2rem 0;
}
.right-column{

    

}

.card {
  width: 90%;
  background-color: #1e293b;
  border: 1px solid #374151;
  border-radius: 0.75rem;
  overflow: hidden;
}

#generatedImages {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  padding: 1rem;
}

.generated-image-item {
  border-radius: 0.5rem;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.generated-image-item img {
  width: 100%;
  height: 160px;
  object-fit: cover;
  display: block;
}

.generated-image-item:hover {
  transform: scale(1.03);
}

.image-actions {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.7));
  padding: 0.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.generated-image-item:hover .image-actions {
  opacity: 1;
}

.image-action-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: rgba(255,255,255,0.2);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.image-action-btn:hover {
  background-color: rgba(255,255,255,0.4);
}
</style>