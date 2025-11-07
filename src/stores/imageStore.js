import { defineStore } from 'pinia';
import { ref } from 'vue';
export const useImageStore = defineStore('image', () => {
    // 状态
    const selectedImage = ref(null);
    const promptText = ref('');
    const imageCount = ref('1');
    const selectedStyle = ref('无风格');
    const isGenerating = ref(false);
    const generatedImages = ref([]);
    const apiStatus = ref('connected');
    const apiStatusText = ref('GPT-image-1');
    // 风格选项
    const styles = [
        { name: '无风格', imageUrl: '../assets/None.png' },
        { name: '吉卜力', imageUrl: '../assets/ghibli.png' },
        { name: '拍立得', imageUrl: '../assets/polaraid.png' },
        { name: '3D手办', imageUrl: '../assets/dFigure.png' },
        { name: '乐高', imageUrl: '../assets/lego.png' },
        { name: '皮克斯', imageUrl: '../assets/pixar.png' }
    ];
    // 方法
    const testApiConnection = async () => {
        try {
            apiStatus.value = 'testing';
            apiStatusText.value = '正在测试连接...';
            // 实际项目中替换为真实API
            const response = await fetch('https://api.your-model-provider.com/test-connection', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer YOUR_API_KEY',
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                apiStatus.value = 'connected';
                apiStatusText.value = 'GPT-image-1';
            }
            else {
                throw new Error('连接失败');
            }
        }
        catch (error) {
            apiStatus.value = 'error';
            apiStatusText.value = '模型API连接失败';
            console.error('API连接错误:', error);
        }
    };
    const handleImageUpload = (file) => {
        selectedImage.value = file;
    };
    const selectStyle = (styleName) => {
        selectedStyle.value = styleName;
    };
    const generateImage = async () => {
        if (!selectedImage.value) {
            alert('请先上传参考图片');
            return;
        }
        try {
            isGenerating.value = true;
            // 准备表单数据
            const formData = new FormData();
            formData.append('image', selectedImage.value);
            formData.append('prompt', promptText.value);
            formData.append('aspect_ratio', '1:1');
            formData.append('style', selectedStyle.value);
            formData.append('count', imageCount.value);
            // 模拟API调用
            const mockImages = [
                'https://p3-flow-imagex-download-sign.byteimg.com/tos-cn-i-a9rns2rl98/820f36d576b84801a17b6290e887e51e.png',
                'https://p26-flow-imagex-download-sign.byteimg.com/tos-cn-i-a9rns2rl98/7d1166aeb01440f09865868cf099a4ca.png',
                'https://p11-flow-imagex-download-sign.byteimg.com/tos-cn-i-a9rns2rl98/22ed3ce29e0b4a83ba50d56fdc2b48a1.png',
                'https://p26-flow-imagex-download-sign.byteimg.com/tos-cn-i-a9rns2rl98/3db7957636b340c0beb65f660a69d223.png'
            ];
            // 模拟网络延迟
            await new Promise(resolve => setTimeout(resolve, 2000));
            // 添加新生成的图片
            const newImages = mockImages.slice(0, parseInt(imageCount.value)).map(url => ({
                id: Date.now() + Math.random().toString(36).substring(2, 9),
                url,
                timestamp: Date.now()
            }));
            generatedImages.value = [...newImages, ...generatedImages.value];
        }
        catch (error) {
            console.error('生成错误:', error);
            alert('生成失败，请稍后重试');
        }
        finally {
            isGenerating.value = false;
        }
    };
    const downloadImage = (imageUrl) => {
        const a = document.createElement('a');
        a.href = imageUrl;
        a.download = `ai-generated-${Date.now()}.png`;
        a.click();
    };
    const deleteImage = (id) => {
        generatedImages.value = generatedImages.value.filter(img => img.id !== id);
    };
    return {
        selectedImage,
        promptText,
        imageCount,
        selectedStyle,
        isGenerating,
        generatedImages,
        apiStatus,
        apiStatusText,
        styles,
        testApiConnection,
        handleImageUpload,
        selectStyle,
        generateImage,
        downloadImage,
        deleteImage
    };
});
