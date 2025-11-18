<template>
  <section id="data-center" class="py-16 px-4">
    <div class="container mx-auto max-w-4xl">
      <h2 class="text-3xl md:text-4xl font-bold text-center mb-6">数据中心</h2>
      <p class="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
        查看您的生成历史、存储的图片和使用统计数据，管理您的创作资产
      </p>
      
      <div class="bg-navDark border border-navBorder rounded-lg p-6 mb-8">
        <h3 class="text-xl font-bold mb-4">使用统计</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="stat-card">
            <div class="stat-value">{{ totalGenerations }}</div>
            <div class="stat-label">总生成次数</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ storedImages }}</div>
            <div class="stat-label">存储图片</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ remainingCredits }}</div>
            <div class="stat-label">剩余积分</div>
          </div>
        </div>
      </div>
      
      <div class="bg-navDark border border-navBorder rounded-lg overflow-hidden">
        <div class="p-4 border-b border-navBorder font-medium">生成历史</div>
        <div v-if="history.length === 0" class="p-8 text-center text-gray-400">
          <i class="fa fa-history text-4xl mb-4"></i>
          <p>暂无生成记录</p>
          <router-link to="/" class="text-purple-light hover:underline mt-2 inline-block">
            去生成第一张图片
          </router-link>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// 模拟数据
const totalGenerations = 0;
const storedImages = 0;
const remainingCredits = 100;
const history: any[] = [];
</script>

<style scoped>
#data-center {
  background-color: #0f172a;
  color: white;
  padding: 1rem;
}

.bg-navDark {
  background-color: #1e293b;
}

.border-navBorder {
  border-color: #374151;
}

.stat-card {
  background-color: rgba(126, 34, 206, 0.05);
  border-radius: 0.5rem;
  padding: 1.5rem;
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #a855f7;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #94a3b8;
  font-size: 0.9rem;
}

.text-purple-light {
  color: #a855f7;
}
</style>