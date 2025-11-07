<template>
  <section id="community" class="py-16 px-4">
    <div class="container mx-auto max-w-5xl">
      <!-- 页面标题区域 - 精确控制间距 -->
      <div class="text-center mb-10">
        <h2 class="text-[clamp(2rem,5vw,2.5rem)] font-bold mb-3">Deep Radio社区</h2>
        <p class="text-gray-400 text-base max-w-2xl mx-auto leading-relaxed">
          在这里与其他创作者分享您的AI生成作品，交流提示词技巧，发现更多创意灵感
        </p>
      </div>
      
      <!-- 浏览更多按钮 - 居中对齐 -->
      <div class="text-center mt-8">
        <button class="btn-primary px-6 py-2.5">
          <i class="fa fa-image mr-2"></i> 浏览更多作品
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// 可在此处添加社区作品数据加载逻辑
</script>

<style scoped>
#community {
  background-color: #0f172a;
  color: white;
  padding: 1rem;
}

/* 卡片整体样式 */
.community-card {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

/* 图片容器 - 无额外样式 */
.image-container {
  line-height: 0; /* 消除图片底部间隙 */
}

/* 按钮样式调整 */
.btn-primary {
  background-color: #7e22ce;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 0.9rem;
}

.btn-primary:hover {
  background-color: #8b5cf6;
}

/* 文本排版细节 */
.leading-snug {
  line-height: 1.3; /* 紧凑行高，匹配设计图提示词密度 */
}

.leading-relaxed {
  line-height: 1.5; /* 标题下方描述文字行高 */
}

/* 响应式调整 */
@media (max-width: 768px) {
  .grid {
    gap: 6px;
  }
  
  .p-4 {
    padding: 0.75rem;
  }
}
</style>