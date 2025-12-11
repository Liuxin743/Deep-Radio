<template>
  <div class="frontier-card">
    <!-- 顶部标签 -->
    <div class="card-badges">
      <span class="badge venue">{{ paper.venue }}</span>
      <span class="badge citation">引用: {{ paper.citationCount || 0 }}</span>
      <span class="badge category">{{ paper.category }}</span>
    </div>

    <!-- 论文标题 -->
    <h3 class="card-title">
      <a :href="paper.pdfUrl" target="_blank" rel="noopener noreferrer">
        {{ paper.title }}
      </a>
    </h3>

    <!-- 作者 -->
    <p class="card-authors">
      {{ paper.authors }}
    </p>

    <!-- 摘要（折叠/展开） -->
    <div class="card-abstract">
      <p :class="{ 'collapsed': !isAbstractExpanded }">
        {{ paper.abstract }}
      </p>
      <button @click="isAbstractExpanded = !isAbstractExpanded" class="toggle-abstract">
        {{ isAbstractExpanded ? '收起摘要' : '查看更多' }}
      </button>
    </div>

    <!-- 底部信息 -->
    <div class="card-footer">
      <span class="update-time">更新于: {{ paper.updated }}</span>
      <div class="card-actions">
        <a :href="`https://arxiv.org/abs/${paper.arxivId}`" target="_blank" class="btn arxiv-btn">
          arXiv 链接
        </a>
        <a :href="`https://www.semanticscholar.org/paper/arXiv:${paper.arxivId}`" target="_blank" class="btn ss-btn">
          语义学术
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const props = defineProps({
  paper: {
    type: Object,
    required: true
  }
});

// 摘要折叠状态
const isAbstractExpanded = ref(false);
</script>

<style scoped>
.frontier-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  padding: 16px;
  margin-bottom: 16px;
  transition: transform 0.2s;
}

.frontier-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
}

.card-badges {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.badge {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.badge.venue {
  background: #e8f4f8;
  color: #4299e1;
}

.badge.citation {
  background: #f0f8fb;
  color: #38b2ac;
}

.badge.category {
  background: #fdf2f8;
  color: #9f7aea;
}

.card-title {
  font-size: 1.1rem;
  margin: 8px 0;
  line-height: 1.4;
}

.card-title a {
  color: #2d3748;
  text-decoration: none;
  transition: color 0.2s;
}

.card-title a:hover {
  color: #4299e1;
  text-decoration: underline;
}

.card-authors {
  color: #4a5568;
  font-size: 0.9rem;
  margin: 8px 0;
  line-height: 1.3;
}

.card-abstract {
  margin: 12px 0;
  font-size: 0.85rem;
  color: #718096;
  line-height: 1.5;
  position: relative;
}

.card-abstract .collapsed {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.toggle-abstract {
  background: transparent;
  border: none;
  color: #4299e1;
  font-size: 0.8rem;
  cursor: pointer;
  padding: 0;
  margin-top: 4px;
}

.toggle-abstract:hover {
  text-decoration: underline;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f5f5f5;
  font-size: 0.8rem;
  color: #718096;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  text-decoration: none;
  transition: background 0.2s;
}

.arxiv-btn {
  background: #fafafa;
  color: #2d3748;
  border: 1px solid #e5e5e5;
}

.arxiv-btn:hover {
  background: #f5f5f5;
}

.ss-btn {
  background: #faf0f5;
  color: #9f7aea;
  border: 1px solid #f0e6f2;
}

.ss-btn:hover {
  background: #f5e6f7;
}
</style>

