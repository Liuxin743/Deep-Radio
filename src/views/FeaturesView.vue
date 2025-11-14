<template>
  <section id="features" class="py-16 px-4">
    <div class="container mx-auto max-w-5xl">
      <h2 class="text-3xl md:text-4xl font-bold text-center mb-4">产品优势</h2>
      <p class="text-gray-400 text-center max-w-2xl mx-auto mb-12">
        我们的AI图像生成工具提供强大而直观的功能，帮助您轻松将创意转化为令人惊艳的视觉内容
      </p>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="feature-card" v-for="(feature, index) in appStore.features" :key="index">
          <div class="feature-icon">
            <i :class="['fa', feature.icon, 'text-2xl']"></i>
          </div>
          <div class="feature-content">
            <h3 class="text-xl font-bold mb-3">{{ feature.title }}</h3>
            <p class="text-gray-400">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useAppStore } from '@/stores/appStore';

const appStore = useAppStore();
</script>

<style scoped>
#features {
    padding: 1rem;
  background-color: #0f172a;
  color: white;
}

.feature-card {
  background-color: #1e293b;
  border: 1px solid #374151;
  border-radius: 0.75rem;
  padding: 1rem;
  margin: 0.7rem;
  display: flex;
  gap: 1.5rem;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
  border-color: #7e22ce;
}

.feature-icon {
  width: 60px;
  height: 60px;
  border-radius: 0.5rem;
  background-color: rgba(126, 34, 206, 0.1);
  color: #a855f7;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.feature-content {
  flex: 1;
}
</style>