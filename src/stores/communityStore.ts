// stores/communityStore.ts
import { defineStore } from 'pinia';
import { ref, reactive } from 'vue';
import { openApis } from '@/services/openApis';

export interface CommunityWork {
  id: string;
  title: string;
  author: string;
  description: string;
  image: string;
  likes: number;
  comments: number;
  createdAt: string;
  tags: string[];
  views: number;
}

export interface AITool {
  name: string;
  category: string;
  users: number;
  rating: number;
}

export const useCommunityStore = defineStore('community', () => {
  // 状态
  const works = ref<CommunityWork[]>([]);
  const featuredWorks = ref<CommunityWork[]>([]);
  const aiTools = ref<AITool[]>([]);
  const isLoading = ref(false);
  const searchQuery = ref('');
  const selectedCategory = ref('all');

  // 分类选项
  const categories = reactive([
    { id: 'all', name: '全部作品', count: 0 },
    { id: 'ai_art', name: 'AI艺术', count: 0 },
    { id: 'concept_design', name: '概念设计', count: 0 },
    { id: 'digital_art', name: '数字艺术', count: 0 },
    { id: 'photography', name: 'AI摄影', count: 0 }
  ]);

  // Actions
  const loadCommunityWorks = async () => {
    try {
      isLoading.value = true;
      const data = await openApis.getCommunityWorks();
      works.value = data;
      featuredWorks.value = data.slice(0, 4); // 前4个作为精选作品
      updateCategoryCounts();
    } catch (error) {
      console.error('加载社区作品失败:', error);
    } finally {
      isLoading.value = false;
    }
  };

  const loadAITools = async () => {
    try {
      const data = await openApis.getAITools();
      aiTools.value = data;
    } catch (error) {
      console.error('加载AI工具失败:', error);
    }
  };

  const searchWorks = async (query: string) => {
    try {
      isLoading.value = true;
      if (query.trim()) {
        const results = await openApis.searchWorks(query);
        works.value = results;
      } else {
        await loadCommunityWorks();
      }
    } catch (error) {
      console.error('搜索失败:', error);
    } finally {
      isLoading.value = false;
    }
  };

  const likeWork = (workId: string) => {
    const work = works.value.find(w => w.id === workId);
    if (work) {
      work.likes += 1;
    }
  };

  const updateCategoryCounts = () => {
    // 这里可以根据实际数据更新分类计数
    categories.forEach(cat => {
      if (cat.id === 'all') {
        cat.count = works.value.length;
      } else {
        // 简化的分类计数逻辑
        cat.count = Math.floor(works.value.length / categories.length);
      }
    });
  };

  const filterByCategory = (categoryId: string) => {
    selectedCategory.value = categoryId;
    // 实际项目中这里会有更复杂的过滤逻辑
  };

  // 初始化
  const initialize = async () => {
    await Promise.all([
      loadCommunityWorks(),
      loadAITools()
    ]);
  };

  return {
    // 状态
    works,
    featuredWorks,
    aiTools,
    isLoading,
    searchQuery,
    selectedCategory,
    categories,

    // Actions
    loadCommunityWorks,
    loadAITools,
    searchWorks,
    likeWork,
    filterByCategory,
    initialize
  };
});