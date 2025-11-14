<template>
  <footer>
    <div class="container">
      <!-- 核心信息区 -->
      <div class="main-content">
        <div class="brand">
          <span class="text-lg font-bold">Deep Radio</span>
        </div>

        <div class="links">
          <router-link to="/generator" class="link-item">图生图</router-link>
          <router-link to="/guide" class="link-item">使用教程</router-link>
          <router-link to="/faq" class="link-item">常见问题</router-link>
          <a href="#" class="link-item">关于我们</a>
          <a href="#" class="link-item">隐私政策</a>
        </div>
      </div>

      <!-- 版权信息 -->
      <div class="copyright">
        © 2025 Deep Radio. 保留所有权利
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
// 保持原样
</script>

<style scoped>
footer {
  background-color: #0f172a;
  padding: 1.2rem 0; 
  color: #94a3b8;
  font-size: 0.85rem;
  width: 98.9%; /* 占满屏幕宽度 */
}

.container {
  max-width: 1400px; 
  /* padding: 0 1.5rem;  */
  margin: 0 auto; 
  height: 70px;
  width: 100%; 
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  /* padding: 0 1.5rem; */
}

.main-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem; 
}

.brand {
  color: white;
  font-size: 1rem; 
}

.links {
  display: flex;
  gap: 1.8rem; /* 间距与宽度匹配，避免过密 */
}

.link-item {
  color: #94a3b8;
  text-decoration: none;
  transition: color 0.2s;
  font-size: 0.85rem;
}

.link-item:hover {
  color: white;
}

.copyright {
  text-align: left;
  padding-top: 0.8rem;
  border-top: 1px solid #1e293b; /* 增加细分割线，与宽度比例协调 */
  font-size: 0.75rem;
}

/* 响应式同步目标宽度的断点逻辑 */
@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }
  .links {
    gap: 1.2rem;
  }
  .main-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.8rem;
  }
}
</style>