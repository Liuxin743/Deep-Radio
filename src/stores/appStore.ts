import { defineStore } from 'pinia';
import { ref ,reactive } from 'vue';
import { GuideStep, Feature, FaqItem } from '../types';



export const useAppStore = defineStore('app', () => {
  // 状态
  const selectedLanguage = ref('zh');

  // 导航步骤数据
  const guideSteps: GuideStep[] = [
    {
      title: '上传您的城市地图',
      description: '选择并上传您想要转换的源图片。我们的AI支持PNG，文件格式为256x256。'
    },
    {
      title: '生成您的转化',
      description: '点击生成按钮，观看我们的大模型分析您的图片并应用您请求的更改。'
    },
    {
      title: '下载并分享',
      description: '预览您的变换图像，必要时进行调整，然后高分辨率下载。与朋友分享您创作的AI生成艺术作品。'
    }
  ];

  // 产品优势数据
  const features: Feature[] = [
    {
      icon: 'fa-paint-brush',
      title: '多样化风格转变',
      description: '利用我们先进的AI技术，将任何图片转换为不同的艺术风格。从现实主义肖像到奇幻插图，应有尽有。'
    },
    {
      icon: 'fa-sliders',
      title: '精确控制结果',
      description: '使用可调参数微调您的转变，让您完全掌控创意。修改转变的强度，保留更多原始图像特征。'
    },
    {
      icon: 'fa-star',
      title: '专业品质输出',
      description: '生成高分辨率、专业级别的图像，适合各种应用。AI在应用转变时，能保留源材料的重要细节。'
    },
    {
      icon: 'fa-lightbulb-o',
      title: '直观用户体验',
      description: '简单的四步过程使图像转变对每个人都易于实现，无论技术水平如何。界面引导您完成每一步。'
    }
  ];

  // FAQ数据
  const faqItems:FaqItem[]= [
    {
      question: '什么是图像到图像的人工智能技术？',
      answer: '图像到图像的人工智能技术是一种先进的AI系统，它能够根据输入的原始图像和文本提示，生成具有相似内容但风格、细节或构图不同的新图像。',
      active: false
    },
    {
      question: '图像到图像的人工智能转换器是如何工作的？',
      answer: '该转换器结合了计算机视觉和自然语言处理技术。首先分析输入图像提取特征，再根据文本提示生成新图像。',
      active: false
    },
    {
      question: '我可以用此工具转换哪种类型的图像？',
      answer: '您可以转换几乎任何类型的图像，包括照片、插图、艺术作品、产品图片、肖像等。建议使用清晰、光线充足的图片。',
      active: false
    },
    {
      question: '如何优化提示词让生成效果更精准？',
      answer: '优化提示词可遵循三个原则：补充细节维度、明确风格属性、限定调整范围。',
      active: false
    },
    {
      question: '生成的图像可以用于商业用途吗？',
      answer: '取决于您的使用场景和订阅方案：免费用户仅可用于个人非商业用途；高级订阅用户可用于自媒体配图等商业场景。',
      active: false
    }
  ];

  // 方法
  const toggleFaq = (index: number) => {
  faqItems[index].active = !faqItems[index].active;
};
  const changeLanguage = (lang: string) => {
    selectedLanguage.value = lang;
  };

  return {
    selectedLanguage,
    guideSteps,
    features,
    faqItems,
    toggleFaq,
    changeLanguage
  };
});