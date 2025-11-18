<template>
  <div class="cooperation-page">
    <!-- 页面头部 -->
    <section class="page-header">
      <div class="container">
        <!-- <h1 class="page-title">真正合作</h1> -->
        <p class="page-subtitle">为企业提供专业的AI图像生成解决方案</p>
        <div class="header-actions">
          <button class="cta-button primary" @click="scrollToContact">立即咨询</button>
        </div>
      </div>
    </section>


    <!-- 合作流程 -->
    <section class="process-section">
      <div class="container">
        <h2 class="section-title">合作流程</h2>
        <div class="process-steps">
          <div 
            v-for="step in processSteps" 
            :key="step.id"
            class="process-step"
          >
            <div class="step-number">{{ step.number }}</div>
            <div class="step-content">
              <h3>{{ step.title }}</h3>
              <p>{{ step.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

  

    <!-- 联系表单 -->
    <section class="contact-section" id="contact">
      <div class="container">
        <div class="contact-content">
          <div class="contact-info">
            <h2>开始合作</h2>
            <p>我们的专业团队将为您提供定制化的AI图像生成解决方案</p>
            <div class="contact-methods">
              <div class="contact-method">
                <i class="fa fa-phone"></i>
                <div>
                  <h4>电话咨询</h4>
                  <p>400-123-4567</p>
                </div>
              </div>
              <div class="contact-method">
                <i class="fa fa-envelope"></i>
                <div>
                  <h4>邮箱联系</h4>
                  <p>business@deepradio.com</p>
                </div>
              </div>
              <div class="contact-method">
                <i class="fa fa-wechat"></i>
                <div>
                  <h4>微信咨询</h4>
                  <p>DeepRadio_Official</p>
                </div>
              </div>
            </div>
          </div>
          <div class="contact-form">
            <form @submit.prevent="submitForm">
              <div class="form-group">
                <label for="name">姓名</label>
                <input type="text" id="name" v-model="form.name" required />
              </div>
              <div class="form-group">
                <label for="company">公司名称</label>
                <input type="text" id="company" v-model="form.company" required />
              </div>
              <div class="form-group">
                <label for="phone">联系电话</label>
                <input type="tel" id="phone" v-model="form.phone" required />
              </div>
              <div class="form-group">
                <label for="email">邮箱地址</label>
                <input type="email" id="email" v-model="form.email" required />
              </div>
              <div class="form-group">
                <label for="demand">合作需求</label>
                <textarea id="demand" v-model="form.demand" rows="4" required></textarea>
              </div>
              <button type="submit" class="submit-btn">提交合作申请</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 合作流程
const processSteps = ref([
  {
    id: 1,
    number: '01',
    title: '需求沟通',
    description: '深入了解您的业务需求和技术要求'
  },
  {
    id: 2,
    number: '02',
    title: '方案制定',
    description: '为您量身定制最合适的解决方案'
  },
  {
    id: 3,
    number: '03',
    title: '合同签订',
    description: '明确合作条款和交付标准'
  },
  {
    id: 4,
    number: '04',
    title: '项目实施',
    description: '专业团队负责项目开发和实施'
  }
])

// 联系表单
const form = ref({
  name: '',
  company: '',
  phone: '',
  email: '',
  demand: ''
})

const submitForm = () => {
  console.log('Form submitted:', form.value)
  alert('合作申请已提交，我们将尽快与您联系！')
}

const scrollToContact = () => {
  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
}

const scrollToCases = () => {
  document.getElementById('cases')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<style scoped>
.cooperation-page {
  min-height: 100vh;
  background-color: #0f172a;
  color: white;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* 页面头部 */
.page-header {
  padding: 2rem 0 4rem;
  text-align: center;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
}

.page-title {
  font-size: 3.5rem;
  font-weight: bold;
  background: linear-gradient(135deg, #7e22ce, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
}

.page-subtitle {
  font-size: 1.5rem;
  color: #9ca3af;
  margin-bottom: 3rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.cta-button {
  padding: 1rem 2rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cta-button.primary {
  background: linear-gradient(135deg, #7e22ce, #a855f7);
  color: white;
}

.cta-button.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(126, 34, 206, 0.3);
}

.cta-button.secondary {
  background: transparent;
  border: 2px solid #7e22ce;
  color: #7e22ce;
}

.cta-button.secondary:hover {
  background: #7e22ce;
  color: white;
}


/* 合作流程 */
.process-section {
  padding: 4rem 0;
  background: #1e293b;
}

.process-steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.process-step {
  text-align: center;
  position: relative;
}

.step-number {
  width: 60px;
  height: 60px;
  margin: 0 auto 1.5rem;
  background: linear-gradient(135deg, #7e22ce, #a855f7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
}

.step-content h3 {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: white;
}

.step-content p {
  color: #9ca3af;
  line-height: 1.6;
}


/* 联系表单 */
.contact-section {
  padding: 4rem 0;
  background: #1e293b;
}

.contact-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
}

.contact-info h2 {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: white;
}

.contact-info > p {
  color: #9ca3af;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.contact-methods {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.contact-method {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.contact-method i {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #7e22ce, #a855f7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
}

.contact-method h4 {
  font-weight: bold;
  margin-bottom: 0.25rem;
  color: white;
}

.contact-method p {
  color: #9ca3af;
}

.contact-form {
  background: #0f172a;
  padding: 2rem;
  border-radius: 1rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: white;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #374151;
  border-radius: 0.5rem;
  background: #1e293b;
  color: white;
  font-size: 1rem;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #7e22ce;
}

.submit-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #7e22ce, #a855f7);
  border: none;
  border-radius: 0.5rem;
  color: white;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(126, 34, 206, 0.3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-title {
    font-size: 2.5rem;
  }
  
  .header-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .contact-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .solutions-grid {
    grid-template-columns: 1fr;
  }
}
</style>