<template>
  <section id="guide" class="py-16 px-4">
    <div class="container mx-auto  max-w-[2000px]">
      <h2 class="text-3xl md:text-4xl font-bold text-center mb-12">使用步骤指南</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div 
          class="guide-card" 
          v-for="(step, index) in appStore.guideSteps" 
          :key="index"
        >
          <div class="step-number">
            {{ index + 1 }}
          </div>
          <div class="guide-content">
            <h3 class="text-xl font-bold mb-3">{{ step.title }}</h3>
            <p class="text-gray-400">{{ step.description }}</p>
          </div>
        </div>
      </div>
      
      <div class="mt-12 text-center">
        <div class="click-style">
            <router-link to="/generator" class="btn-primary inline-flex items-center">
          <i class="fa fa-arrow-right mr-2"></i> 开始使用
        </router-link>
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
#guide {
  padding: 1rem ;
    padding-bottom: 7rem;
    margin: 0 auto;
  background-color: #0f172a;
  color: white;
}
.click-style{
    margin-top: 2rem;
}

.guide-card {
  background-color: #1e293b;
  border: 1px solid #374151;
  border-radius: 0.75rem;
  padding: 1rem;
  margin: 0.7rem;
  display: flex;
  gap: 1.5rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.guide-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #a855f7, #7e22ce);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.guide-content {
  flex: 1;
}

.btn-primary {
  background-color: #7e22ce;
  color: white;
  border: none;
  border-radius: 0.375rem;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  text-decoration: none;
}

.btn-primary:hover {
  background-color: #a855f7;
}
</style>