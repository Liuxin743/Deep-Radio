<template>
  <section id="home" class="pt-12 pb-12 px-4">
    <div class="container mx-auto">
      <h1
        class="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple to-purple-light popule-title"
      >
        运用图像对图像AI改变您的照片
      </h1> 
      <p class="text-gray-400 text-center max-w-3xl mx-auto text-lg mb-10 popule">
        轻松地使用我们的图像对图像AI生成器转换您的图像。上传照片，从多种艺术风格中选择，或创建您自己的自定义外观，让AI将您的想法变为现实。简单、快速且富有创意。现在就试试，开启无限可能！
      </p>
      <div class="flex justify-center">
        <div class="btn-style">
           <router-link to="/generator" class="btn-primary px-8 flex items-center">
           开始创作
        </router-link>
        </div>
       
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// 首页逻辑
</script>

<style scoped>
#home {
  margin: 0 auto;
  background-color: #0f172a;
  color: white;
  /* min-height: calc(100vh - 120px); */
  display: flex;
  align-items: center;
}
/* 图标 */
.logo{
  width: 1.5rem;
  position: absolute;
  left: 0;
}

.container {
  max-width: 1400px;
  text-align: center;
}
.popule-title{
  font-size: 5rem;
  color: #7e22ce;
  margin-bottom: -5rem 0 ;
}
.popule{
  max-width: 800px;
  margin: auto;
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
  position: relative;
}
.btn-style{
    margin: 2rem;
}

.btn-primary:hover {
  background-color: #a855f7;
}

.from-purple {
  --tw-gradient-from: #7e22ce;
}

.to-purple-light {
  --tw-gradient-to: #a855f7;
}
</style>