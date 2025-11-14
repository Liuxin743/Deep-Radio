<template>
  <section id="faq" class="py-16 px-4">
    <div class="container mx-auto max-w-3xl">
      <h2 class="text-3xl md:text-4xl font-bold text-center mb-12">常见问题</h2>
      
      <div class="space-y-4">
        <div 
          class="faq-item border border-navBorder rounded-lg overflow-hidden"
          v-for="(item, index) in appStore.faqItems" 
          :key="index"
        >
          <button 
            class="faq-question w-full flex justify-between items-center p-4 text-left bg-navDark focus:outline-none"
            @click="appStore.toggleFaq(index)"
          >
            <span class="font-medium">{{ item.question }}</span>
            <i class="fa" :class="item.active ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
          </button>
          
          <div 
            class="faq-answer px-4 pb-4"
            v-if="item.active"
          >
            <p class="text-gray-400">{{ item.answer }}</p>
          </div>
        </div>
      </div>
      
      <div class="mt-12 text-center">
        <p class="text-gray-400 mb-4">还有其他问题？</p>
        <a href="mailto:support@viggleai.com" class="text-purple-light hover:underline">
          <i class="fa fa-envelope mr-2"></i> 联系客服
        </a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useAppStore } from '@/stores/appStore';

const appStore = useAppStore();
</script>

<style scoped>
#faq {
  background-color: #0f172a;
  color: white;
}
.container{
  padding: 1rem;
  
}

.faq-item {
  margin: 1rem 0;
  transition: all 0.3s ease;
}

.faq-item:hover {
  border-color: #7e22ce;
}

.faq-question {
  color: white;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.faq-question:hover {
  background-color: rgba(126, 34, 206, 0.05);
}

.faq-answer {
  background-color: #1e293b;
}

.bg-navDark {
  background-color: #1e293b;
}

.border-navBorder {
  border-color: #374151;
}

.text-purple-light {
  color: #a855f7;
}
</style>