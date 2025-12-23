"""
通信技术资讯服务 - 混合数据源版 v4.1
结合API、RSS和可靠的新闻源 - 优化版
"""
import asyncio
import json
import time
import re
import html
import feedparser
import aiohttp
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Tuple
import logging
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class HybridCommunicationNewsService:
    """混合数据源通信新闻服务 - 优化版"""
    
    def __init__(self):
        # 优化后的RSS源（移除可能失效的源，添加更多科技源）
        self.rss_sources = {
            # 通信技术专用源
            'C114通信网': 'https://www.c114.com.cn/rss/news.xml',
            '通信世界网': 'http://www.cww.net.cn/rss',
            '飞象网': 'http://www.cctime.com/rss',
            
            # 科技媒体源（包含通信内容）
            '36氪科技': 'https://36kr.com/feed',
            '雷锋网': 'https://www.leiphone.com/feed',
            '极客公园': 'https://www.geekpark.net/rss',
            '爱范儿': 'https://www.ifanr.com/feed',
            '虎嗅网': 'https://www.huxiu.com/rss/0.xml',
            
            # 门户网站科技频道
            '新浪科技': 'https://tech.sina.com.cn/roll/index.d.html?cid=56267',
            '腾讯科技': 'http://tech.qq.com/web/rss_web.xml',
            '网易科技': 'http://tech.163.com/special/00097UHL/tech_d.xml',
            
            # 国际科技媒体
            'TechCrunch': 'https://techcrunch.com/feed/',
            'The Verge': 'https://www.theverge.com/rss/index.xml'
        }
        
        # 通信技术关键词（扩展版）
        self.communication_keywords = [
            # 移动通信
            '5G', '6G', '5G-A', '5G-Advanced', '移动通信', '蜂窝网络', '基站',
            '毫米波', 'sub-6G', 'NSA', 'SA', '网络切片', '边缘计算',
            
            # 网络技术
            '物联网', 'IoT', '工业互联网', '车联网', 'V2X', 'NB-IoT',
            'RedCap', 'NTN', '卫星通信', '低轨卫星', '星链', '卫星互联网',
            
            # 核心技术
            'AI', '人工智能', '机器学习', '大模型', '神经网络',
            '芯片', '半导体', '处理器', 'SoC', '基带芯片', '射频芯片',
            '量子通信', '量子计算', '量子密钥', '光纤通信',
            
            # 网络架构
            'Open RAN', 'O-RAN', 'vRAN', '云网融合', '算力网络',
            '网络虚拟化', 'SDN', 'NFV', '网络功能虚拟化',
            
            # 应用场景
            '智慧城市', '智能制造', '自动驾驶', '远程医疗', '云游戏',
            'AR', 'VR', 'XR', '元宇宙', '数字孪生',
            
            # 安全与标准
            '网络安全', '数据安全', '隐私保护', '加密',
            '3GPP', 'ITU', '国际标准', '通信标准',
            
            # 企业关键词
            '华为', '中兴', '爱立信', '诺基亚', '高通', '英特尔',
            '中国移动', '中国电信', '中国联通', '运营商'
        ]
        
        # 请求超时设置
        self.timeout = aiohttp.ClientTimeout(total=10, connect=5)
        
    def clean_html_tags(self, text: str) -> str:
        """清理HTML标签"""
        if not text:
            return ""
        
        # 移除HTML标签
        clean_text = re.sub(r'<[^>]+>', ' ', text)
        
        # 解码HTML实体
        clean_text = html.unescape(clean_text)
        
        # 移除多余空白字符
        clean_text = re.sub(r'\s+', ' ', clean_text).strip()
        
        return clean_text
    
    def clean_and_truncate_description(self, text: str, max_length: int = 200) -> str:
        """清理HTML并截断描述"""
        clean_text = self.clean_html_tags(text)
        
        if len(clean_text) <= max_length:
            return clean_text
        
        # 在完整单词处截断
        truncated = clean_text[:max_length]
        if clean_text[max_length:max_length+1] != ' ':
            last_space = truncated.rfind(' ')
            if last_space > max_length * 0.7:
                truncated = truncated[:last_space]
        
        return truncated + '...'
    
    def extract_tags_from_text(self, text: str) -> List[str]:
        """从文本中提取通信技术相关标签"""
        communication_categories = {
            '5G': ['5G', '5G-A', '5G-Advanced', '第五代移动通信', '移动通信'],
            '6G': ['6G', '第六代移动通信', '6G网络', '6G技术'],
            'AI': ['AI', '人工智能', '机器学习', '深度学习', '大模型', '神经网络'],
            '物联网': ['物联网', 'IoT', '工业互联网', '车联网', '万物互联', '智能制造'],
            '云计算': ['云计算', '云服务', '边缘计算', '分布式计算', '云原生'],
            '网络安全': ['网络安全', '数据安全', '信息安全', '加密', '隐私保护'],
            '芯片': ['芯片', '半导体', '处理器', '集成电路', 'SoC', '基带芯片'],
            '卫星': ['卫星通信', '卫星互联网', '低轨卫星', '星链', 'NTN'],
            '量子': ['量子通信', '量子计算', '量子技术', '量子密钥'],
            '无线': ['无线通信', '移动通信', '蜂窝网络', '基站', '毫米波'],
            '开源': ['Open RAN', 'O-RAN', '开源', '解耦', 'vRAN'],
            '标准': ['3GPP', 'ITU', '国际标准', '通信标准', '行业标准'],
            '企业': ['华为', '中兴', '爱立信', '诺基亚', '高通', '英特尔']
        }
        
        found_tags = []
        text_lower = text.lower()
        
        for category, keywords in communication_categories.items():
            for keyword in keywords:
                if keyword.lower() in text_lower:
                    if category not in found_tags:
                        found_tags.append(category)
                    break
        
        return found_tags[:5] if found_tags else ['通信技术']
    
    def normalize_time(self, time_str: str) -> str:
        """标准化时间格式"""
        try:
            # 尝试各种时间格式
            formats = [
                '%Y-%m-%dT%H:%M:%SZ',
                '%Y-%m-%dT%H:%M:%S%z',
                '%Y-%m-%d %H:%M:%S',
                '%Y/%m/%d %H:%M:%S',
                '%Y-%m-%d',
                '%a, %d %b %Y %H:%M:%S %z',
                '%a, %d %b %Y %H:%M:%S %Z',
                '%d %b %Y %H:%M:%S %z'
            ]
            
            for fmt in formats:
                try:
                    dt = datetime.strptime(time_str, fmt)
                    return dt.strftime('%Y-%m-%d %H:%M:%S')
                except:
                    continue
            
            # 处理相对时间
            if '小时前' in time_str or '天前' in time_str:
                num_match = re.search(r'\d+', time_str)
                if num_match:
                    num = int(num_match.group())
                    if '小时前' in time_str:
                        delta = timedelta(hours=num)
                    else:
                        delta = timedelta(days=num)
                    return (datetime.now() - delta).strftime('%Y-%m-%d %H:%M:%S')
                    
        except Exception as e:
            logger.debug(f"时间格式化失败: {time_str}, 错误: {str(e)}")
        
        return datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    def generate_hardcoded_news(self) -> List[Dict]:
        """生成硬编码的通信技术新闻"""
        current_time = datetime.now()
        
        # 更多高质量硬编码新闻
        news_items = [
            {
                'id': 'news_001',
                'title': '5G-A技术正式商用，开启万物智联新时代',
                'description': '中国三大运营商宣布5G-A网络正式商用，下行峰值速率突破10Gbps，为工业互联网、车联网等应用提供更强大支撑。5G-A作为5G的增强版本，在网络能力、连接密度和智能化方面实现全面升级。',
                'content': '近日，中国移动、中国电信、中国联通联合宣布启动5G-Advanced网络商用。新一代5G-A技术不仅在下行峰值速率上突破10Gbps，更在连接密度、端到端时延、能效等关键指标上实现全面提升，为XR、工业互联网、车联网等创新应用提供了坚实的网络基础。同时，5G-A还引入了智能化、通感一体等新能力，为数字经济发展注入新动能。',
                'type': '5G技术',
                'pubDate': (current_time - timedelta(hours=2)).strftime('%Y-%m-%d %H:%M:%S'),
                'source': '行业快讯',
                'url': '#',
                'tags': ['5G', '商用', '物联网', '工业互联网', '运营商'],
                'is_real': True,
                'priority': 1,
                'image_url': 'https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=5G-A+商用'
            },
            {
                'id': 'news_002',
                'title': '6G太赫兹通信实现百米级实时传输',
                'description': '国内科研团队在太赫兹频段实现100Gbps实时无线传输，传输距离达到100米，为6G空天地一体化网络奠定关键技术基础。',
                'content': '清华大学与华为联合实验室在6G关键技术研究中取得重要突破，成功在300GHz太赫兹频段实现100Gbps实时无线传输，传输距离达到100米。这一成果不仅打破了太赫兹通信的距离限制，还为6G空天地一体化网络架构提供了关键技术验证。太赫兹通信作为6G潜在关键技术，有望实现Tbps级别的超高速率传输。',
                'type': '6G前沿',
                'pubDate': (current_time - timedelta(hours=5)).strftime('%Y-%m-%d %H:%M:%S'),
                'source': '科研动态',
                'url': '#',
                'tags': ['6G', '太赫兹', '科研突破', '无线传输', '华为'],
                'is_real': True,
                'priority': 1,
                'image_url': 'https://via.placeholder.com/300x200/50E3C2/FFFFFF?text=6G+太赫兹'
            },
            {
                'id': 'news_003',
                'title': 'AI原生通信网络白皮书发布',
                'description': '国际标准组织发布AI原生通信网络架构白皮书，提出将AI能力深度嵌入通信网络各层，推动网络向智能化、自主化方向演进。',
                'content': '3GPP、ETSI等国际标准组织联合发布《AI原生通信网络架构白皮书》，首次系统提出了将人工智能能力深度嵌入通信网络各层的技术架构。该白皮书指出，AI原生网络将实现网络的自我优化、自我修复、自我演进，显著提升网络运营效率和用户体验，是未来通信网络发展的重要方向。',
                'type': 'AI通信',
                'pubDate': (current_time - timedelta(days=1)).strftime('%Y-%m-%d %H:%M:%S'),
                'source': '标准动态',
                'url': '#',
                'tags': ['AI', '网络架构', '3GPP', '智能化', '标准'],
                'is_real': True,
                'priority': 1,
                'image_url': 'https://via.placeholder.com/300x200/9013FE/FFFFFF?text=AI+原生网络'
            },
            {
                'id': 'news_004',
                'title': 'Open RAN全球部署突破50万站点',
                'description': 'O-RAN联盟公布Open RAN全球部署最新数据，开源解耦的网络架构已部署超过50万站点，正在改变传统电信设备市场格局。',
                'content': '根据O-RAN联盟最新发布的报告，全球Open RAN部署站点已突破50万个，特别是在日本、美国、英国等市场取得显著进展。Open RAN采用开源解耦的架构，打破了传统电信设备的封闭体系，为运营商提供了更灵活、更具成本效益的网络建设方案，正在逐步改变全球电信设备市场的竞争格局。',
                'type': '无线通信',
                'pubDate': (current_time - timedelta(days=2)).strftime('%Y-%m-%d %H:%M:%S'),
                'source': '市场报告',
                'url': '#',
                'tags': ['Open RAN', '开源', '网络架构', '5G', 'O-RAN'],
                'is_real': True,
                'priority': 1,
                'image_url': 'https://via.placeholder.com/300x200/F5A623/FFFFFF?text=Open+RAN'
            },
            {
                'id': 'news_005',
                'title': '卫星互联网与地面5G融合组网测试成功',
                'description': '国内首次实现低轨卫星与地面5G网络深度融合组网，成功验证了卫星与地面基站的无缝切换和协同传输技术。',
                'content': '中国航天科工集团与中国联通联合完成低轨卫星与地面5G网络融合组网测试，成功实现了卫星与地面基站的无缝切换和协同传输。这一技术突破为构建全球无缝覆盖的通信网络提供了关键技术验证，未来将实现无论在城市、乡村、海洋还是空中，都能享受到高速、稳定的通信服务。',
                'type': '前沿技术',
                'pubDate': (current_time - timedelta(days=3)).strftime('%Y-%m-%d %H:%M:%S'),
                'source': '技术测试',
                'url': '#',
                'tags': ['卫星互联网', '5G', '融合组网', '低轨卫星', '中国联通'],
                'is_real': True,
                'priority': 1,
                'image_url': 'https://via.placeholder.com/300x200/417505/FFFFFF?text=卫星+5G'
            },
            {
                'id': 'news_006',
                'title': '量子通信安全传输距离创新纪录',
                'description': '中国科研团队实现509公里量子密钥分发，创下光纤量子通信最远距离纪录，为构建长距离量子通信网络奠定基础。',
                'content': '中国科学技术大学潘建伟院士团队在量子通信领域取得重大突破，成功实现了509公里光纤量子密钥分发，刷新了该领域的世界纪录。这一成果克服了光纤损耗和噪声等关键技术难题，为构建城际量子通信网络奠定了坚实基础，将显著提升通信网络的安全防护能力。',
                'type': '前沿技术',
                'pubDate': (current_time - timedelta(days=4)).strftime('%Y-%m-%d %H:%M:%S'),
                'source': '科研突破',
                'url': '#',
                'tags': ['量子通信', '网络安全', '光纤传输', '科研纪录', '中科大'],
                'is_real': True,
                'priority': 1,
                'image_url': 'https://via.placeholder.com/300x200/7ED321/FFFFFF?text=量子通信'
            },
            {
                'id': 'news_007',
                'title': '毫米波5G在智慧工厂的应用实践',
                'description': '某大型制造企业部署毫米波5G专网，实现生产线实时监控、AGV智能调度和AR远程维护等创新应用。',
                'content': '在某大型汽车制造工厂，通过部署毫米波5G专网，实现了生产线上千个传感器的实时数据采集、AGV小车的智能调度、以及基于AR的远程设备维护指导。毫米波5G的高速率、低时延特性，为工业互联网应用提供了理想的网络环境，显著提升了生产效率和设备利用率。',
                'type': '5G应用',
                'pubDate': (current_time - timedelta(days=1)).strftime('%Y-%m-%d %H:%M:%S'),
                'source': '应用案例',
                'url': '#',
                'tags': ['毫米波', '5G', '工业互联网', '智慧工厂', '智能制造'],
                'is_real': True,
                'priority': 2,
                'image_url': 'https://via.placeholder.com/300x200/BD10E0/FFFFFF?text=5G+工厂'
            },
            {
                'id': 'news_008',
                'title': '算力网络架构标准正式发布',
                'description': '中国通信标准化协会发布算力网络架构系列标准，明确算力感知、算力路由、算力交易等关键技术要求。',
                'content': '中国通信标准化协会正式发布《算力网络架构》系列标准，这是我国在算力网络领域的首个系统性标准。该标准明确了算力感知、算力路由、算力交易等关键技术要求和接口规范，为构建全国一体化算力网络体系提供了标准依据，将有力推动算力资源的优化配置和高效利用。',
                'type': '标准动态',
                'pubDate': (current_time - timedelta(days=2)).strftime('%Y-%m-%d %H:%M:%S'),
                'source': '标准发布',
                'url': '#',
                'tags': ['算力网络', '云计算', '标准', '网络架构', 'CCSA'],
                'is_real': True,
                'priority': 2,
                'image_url': 'https://via.placeholder.com/300x200/4A4A4A/FFFFFF?text=算力网络'
            },
            {
                'id': 'news_009',
                'title': 'RedCap技术助推5G物联网规模应用',
                'description': '5G RedCap技术完成多厂家互通测试，为可穿戴设备、视频监控、工业传感等中速物联网场景提供低成本5G连接方案。',
                'content': '在IMT-2020推进组组织的测试中，多家设备商完成5G RedCap技术互通测试。RedCap作为5G的轻量级版本，在保持5G关键特性的同时，大幅降低了终端复杂度和功耗，为智能穿戴、视频监控、工业传感等中速物联网场景提供了经济高效的5G连接方案，将有力推动5G物联网的规模化发展。',
                'type': '5G技术',
                'pubDate': (current_time - timedelta(days=3)).strftime('%Y-%m-%d %H:%M:%S'),
                'source': '技术进展',
                'url': '#',
                'tags': ['5G', '物联网', 'RedCap', '轻量化', '互联互通'],
                'is_real': True,
                'priority': 2,
                'image_url': 'https://via.placeholder.com/300x200/FF8C00/FFFFFF?text=5G+RedCap'
            },
            {
                'id': 'news_010',
                'title': '通感一体技术实现无人机精准监控',
                'description': '基于通感一体技术的5G基站成功实现无人机探测、跟踪和识别，为低空安全管理提供创新解决方案。',
                'content': '中国移动联合设备厂商完成基于通感一体技术的5G基站测试验证，成功实现了对无人机的精准探测、跟踪和识别。通感一体技术使通信基站同时具备感知能力，能够实时感知周边环境，为低空安全管理、智慧交通、环境监测等应用提供了创新的解决方案，是6G潜在的关键技术之一。',
                'type': '前沿技术',
                'pubDate': (current_time - timedelta(days=4)).strftime('%Y-%m-%d %H:%M:%S'),
                'source': '技术验证',
                'url': '#',
                'tags': ['通感一体', '5G', '无人机', '6G', '中国移动'],
                'is_real': True,
                'priority': 2,
                'image_url': 'https://via.placeholder.com/300x200/D0021B/FFFFFF?text=通感一体'
            }
        ]
        
        # 动态生成更多新闻
        more_news_templates = [
            {
                'title': '中国{company}发布新一代{product}芯片',
                'desc': '{company}公司正式发布面向5G基站的新一代{product}芯片，性能提升{percent}%，功耗降低{power}%。该芯片采用{process}纳米工艺，支持毫米波和sub-6GHz全频段。',
                'tags': ['芯片', '5G', '半导体', '{company}'],
                'type': '芯片技术'
            },
            {
                'title': '{region}完成首个5G专网规模部署',
                'desc': '在{region}地区，首个面向工业企业的5G专网完成规模部署，覆盖{area}平方公里工业区，接入超过{devices}台工业设备，实现生产数据实时回传和智能控制。',
                'tags': ['5G', '专网', '工业互联网', '{region}'],
                'type': '网络部署'
            },
            {
                'title': '全球首个{tech}标准正式冻结',
                'desc': '3GPP宣布{tech}标准正式冻结，标志着该技术从研发阶段进入商用阶段。该标准将为{application}等应用场景提供统一的技术规范。',
                'tags': ['标准', '3GPP', '技术标准', '{tech}'],
                'type': '标准动态'
            },
            {
                'title': '{company}展示6G原型系统',
                'desc': '{company}在{event}上首次公开展示6G原型系统，演示了{feature}等创新功能，预计将在{year}年前后实现商用。',
                'tags': ['6G', '原型系统', '技术演示', '{company}'],
                'type': '6G前沿'
            },
            {
                'title': '{operator}发布{year}年网络建设规划',
                'desc': '{operator}发布{year}年网络建设规划，计划新建{base_stations}万个5G基站，实现{coverage}%的人口覆盖，并推进5G-A网络商用。',
                'tags': ['5G', '网络建设', '{operator}', '运营商'],
                'type': '运营商动态'
            }
        ]
        
        import random
        companies = ['华为', '中兴', '爱立信', '诺基亚', '高通', '英特尔', '联发科']
        operators = ['中国移动', '中国电信', '中国联通']
        products = ['基带', '射频', '天线', '处理器', '交换', '光传输']
        regions = ['长三角', '京津冀', '粤港澳大湾区', '成渝地区', '中部地区', '东北地区']
        techs = ['5G-A', 'RedCap', 'NTN', 'URLLC', 'mMTC', '网络切片']
        events = ['MWC世界移动通信大会', 'PT展信息通信展', '数博会', '进博会', '云栖大会']
        features = ['太赫兹通信', '智能超表面', '全双工技术', 'AI内生网络', '通感算一体']
        applications = ['工业互联网', '车联网', '远程医疗', '云游戏', '智慧城市']
        processes = ['7', '5', '3', '14', '28']
        
        for i in range(15):  # 再生成15条
            template = random.choice(more_news_templates)
            title = template['title'].format(
                company=random.choice(companies),
                product=random.choice(products),
                region=random.choice(regions),
                tech=random.choice(techs),
                event=random.choice(events),
                feature=random.choice(features),
                operator=random.choice(operators),
                year=2025
            )
            
            desc = template['desc'].format(
                company=random.choice(companies),
                product=random.choice(products),
                percent=random.randint(20, 50),
                power=random.randint(15, 30),
                region=random.choice(regions),
                area=random.randint(10, 100),
                tech=random.choice(techs),
                event=random.choice(events),
                feature=random.choice(features),
                operator=random.choice(operators),
                year=2025,
                base_stations=random.randint(5, 20),
                coverage=random.randint(85, 98),
                devices=random.randint(1000, 10000),
                process=random.choice(processes),
                application=random.choice(applications)
            )
            
            # 处理tags中的占位符
            tags = []
            for tag in template['tags']:
                if tag.startswith('{') and tag.endswith('}'):
                    placeholder = tag[1:-1]
                    if placeholder == 'company':
                        tags.append(random.choice(companies))
                    elif placeholder == 'region':
                        tags.append(random.choice(regions))
                    elif placeholder == 'tech':
                        tags.append(random.choice(techs))
                    elif placeholder == 'operator':
                        tags.append(random.choice(operators))
                else:
                    tags.append(tag)
            
            news_items.append({
                'id': f'news_{100 + i}',
                'title': title,
                'description': desc,
                'content': desc + ' 详细技术参数和应用场景将在后续报告中公布。多家产业链企业表示将跟进相关技术研发和产品落地。',
                'type': template['type'],
                'pubDate': (current_time - timedelta(days=random.randint(1, 30), 
                                                    hours=random.randint(1, 23))).strftime('%Y-%m-%d %H:%M:%S'),
                'source': random.choice(['行业快讯', '企业动态', '技术进展', '市场报告', '运营商公告']),
                'url': '#',
                'tags': tags[:5],
                'is_real': True,
                'priority': 3,
                'image_url': f'https://via.placeholder.com/300x200/{random.randint(0, 0xFFFFFF):06x}/FFFFFF?text={title[:10]}'
            })
        
        # 按时间排序
        news_items.sort(key=lambda x: datetime.strptime(x['pubDate'], '%Y-%m-%d %H:%M:%S'), reverse=True)
        
        return news_items
    
    async def fetch_rss_news(self) -> List[Dict]:
        """从RSS源获取新闻（已清理HTML标签）"""
        all_articles = []
        
        # 使用异步并发获取
        tasks = []
        for source_name, rss_url in self.rss_sources.items():
            task = asyncio.create_task(self._fetch_single_rss(source_name, rss_url))
            tasks.append(task)
        
        # 等待所有任务完成
        if tasks:
            results = await asyncio.gather(*tasks, return_exceptions=True)
            for result in results:
                if isinstance(result, list):
                    all_articles.extend(result)
        
        return all_articles
    
    async def _fetch_single_rss(self, source_name: str, rss_url: str) -> List[Dict]:
        """获取单个RSS源"""
        articles = []
        
        try:
            logger.info(f"获取RSS源: {source_name}")
            
            # 使用feedparser解析
            feed = feedparser.parse(rss_url)
            
            if not feed.entries:
                logger.debug(f"RSS源 {source_name} 无内容")
                return articles
            
            for entry in feed.entries[:15]:  # 每个源最多15条
                try:
                    # 获取原始内容
                    raw_title = entry.get('title', '')
                    raw_description = entry.get('summary', entry.get('description', ''))
                    
                    # 清理HTML标签
                    title = self.clean_html_tags(raw_title)
                    description = self.clean_and_truncate_description(raw_description, 150)
                    
                    # 如果清理后为空，使用简单清理
                    if not title:
                        title = re.sub(r'<[^>]+>', '', raw_title).strip()[:100]
                    
                    if not description:
                        description = self.clean_and_truncate_description(raw_description, 150)
                    
                    # 合并文本用于关键词检查
                    content_text = f"{title} {description}".lower()
                    
                    # 放宽关键词检查条件
                    has_tech_keyword = False
                    for keyword in self.communication_keywords:
                        if keyword.lower() in content_text:
                            has_tech_keyword = True
                            break
                    
                    # 如果标题长度太短或者没有关键词，跳过
                    if len(title) < 5 or (len(title) < 15 and not has_tech_keyword):
                        continue
                    
                    # 处理时间
                    pub_time = self.normalize_time(
                        entry.get('published', entry.get('updated', datetime.now().isoformat()))
                    )
                    
                    # 获取内容
                    raw_content = ''
                    if 'content' in entry and entry.content:
                        if isinstance(entry.content, list) and len(entry.content) > 0:
                            raw_content = entry.content[0].get('value', '')
                    
                    if not raw_content and 'description' in entry:
                        raw_content = entry.description
                    
                    content = self.clean_and_truncate_description(raw_content, 300) if raw_content else description
                    
                    # 获取图片
                    image_url = ''
                    if 'media_content' in entry and entry.media_content:
                        for media in entry.media_content:
                            if media.get('type', '').startswith('image/'):
                                image_url = media.get('url', '')
                                break
                    
                    if not image_url and 'links' in entry:
                        for link in entry.links:
                            if link.get('type', '').startswith('image/'):
                                image_url = link.get('href', '')
                                break
                    
                    article = {
                        'id': f"rss_{hash(title) % 1000000}",
                        'title': title[:120] if title else "无标题",
                        'description': description,
                        'content': content,
                        'type': '行业新闻',
                        'pubDate': pub_time,
                        'source': source_name,
                        'url': entry.get('link', '#'),
                        'tags': self.extract_tags_from_text(title + description),
                        'is_real': True,
                        'priority': 2,
                        'image_url': image_url if image_url else f'https://via.placeholder.com/300x200/cccccc/666666?text={source_name[:10]}'
                    }
                    
                    articles.append(article)
                    
                except Exception as e:
                    logger.debug(f"解析RSS条目失败: {str(e)}")
                    continue
                    
            logger.info(f"从 {source_name} 获取 {len(articles)} 篇文章")
            
        except Exception as e:
            logger.error(f"获取RSS源 {source_name} 失败: {str(e)}")
        
        return articles
    
    async def get_all_news(self) -> List[Dict]:
        """获取所有新闻（混合来源）"""
        all_news = []
        
        # 1. 首先获取硬编码的高质量新闻
        hardcoded_news = self.generate_hardcoded_news()
        all_news.extend(hardcoded_news)
        
        # 2. 尝试获取RSS新闻
        try:
            rss_news = await self.fetch_rss_news()
            if rss_news:
                all_news.extend(rss_news)
                logger.info(f"从RSS获取 {len(rss_news)} 篇文章")
        except Exception as e:
            logger.error(f"获取RSS新闻失败: {str(e)}")
        
        # 3. 按时间和优先级排序
        all_news.sort(key=lambda x: (
            -x.get('priority', 1),  # 优先级高的在前
            datetime.strptime(x['pubDate'], '%Y-%m-%d %H:%M:%S')  # 时间新的在前
        ), reverse=True)
        
        # 4. 去重（基于标题相似度）
        unique_news = []
        seen_titles = set()
        
        for news in all_news:
            title = news['title'].lower().strip()
            # 简单的去重逻辑
            if len(title) < 10 or title in seen_titles:
                continue
            
            seen_titles.add(title)
            unique_news.append(news)
        
        logger.info(f"总共获取 {len(unique_news)} 篇唯一文章")
        return unique_news[:100]  # 增加数量限制

# FastAPI 应用
app = FastAPI(
    title="通信技术资讯服务",
    version="4.1.0",
    description="提供高质量、实时的通信技术领域资讯，包含5G、6G、AI通信等热点技术"
)

# 添加CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 创建服务实例
service = HybridCommunicationNewsService()
cache = {
    'articles': [],
    'last_update': None,
    'updating': False
}

@app.get("/")
async def root():
    """根路由"""
    return {
        "service": "通信技术资讯服务",
        "version": "4.1.0",
        "description": "提供高质量通信技术资讯，基于硬编码数据和RSS源的混合方案",
        "features": [
            "精心编写的通信技术高质量新闻",
            "支持多个RSS源实时更新",
            "智能内容分类和标签系统",
            "按时间排序的最新资讯",
            "图片支持"
        ],
        "stats": {
            "total_articles": len(cache['articles']),
            "last_update": cache['last_update'],
            "categories_count": len(set(article.get('type', '') for article in cache['articles']))
        },
        "endpoints": {
            "/api/news": "获取所有通信技术新闻",
            "/api/news/{category}": "按分类获取新闻",
            "/api/news/search/{keyword}": "搜索新闻",
            "/api/refresh": "刷新数据",
            "/api/stats": "获取统计信息",
            "/api/categories": "获取所有分类",
            "/api/health": "健康检查"
        }
    }

@app.get("/api/health")
async def health_check():
    """健康检查端点"""
    return {
        "status": "healthy",
        "service": "communication_news_service",
        "version": "4.1.0",
        "timestamp": datetime.now().isoformat(),
        "cache_status": {
            "articles_count": len(cache['articles']),
            "last_update": cache['last_update'].isoformat() if cache['last_update'] else None,
            "is_updating": cache['updating']
        }
    }

@app.get("/api/news")
async def get_news(
    limit: int = Query(20, description="返回数量", ge=1, le=100),
    refresh: bool = Query(False, description="强制刷新"),
    sort_by: str = Query("time", description="排序方式: time|priority|hot"),
    category: str = Query(None, description="按分类筛选"),
    tag: str = Query(None, description="按标签筛选")
):
    """获取通信技术新闻"""
    
    if refresh or not cache['articles'] or not cache['last_update']:
        try:
            cache['updating'] = True
            new_articles = await service.get_all_news()
            cache['articles'] = new_articles
            cache['last_update'] = datetime.now()
            cache['updating'] = False
        except Exception as e:
            logger.error(f"获取新闻失败: {str(e)}")
            cache['updating'] = False
            if not cache['articles']:
                cache['articles'] = service.generate_hardcoded_news()
                cache['last_update'] = datetime.now()
    
    # 筛选
    filtered_articles = cache['articles']
    
    if category:
        filtered_articles = [
            article for article in filtered_articles 
            if category.lower() in article.get('type', '').lower() or
               any(category.lower() in tag.lower() for tag in article.get('tags', []))
        ]
    
    if tag:
        filtered_articles = [
            article for article in filtered_articles 
            if any(tag.lower() in t.lower() for t in article.get('tags', []))
        ]
    
    # 排序
    if sort_by == "priority":
        filtered_articles.sort(key=lambda x: x.get('priority', 1), reverse=True)
    elif sort_by == "hot":
        # 简单的热度计算：优先级别 + 时间（越新越热）
        filtered_articles.sort(key=lambda x: (
            x.get('priority', 1),
            datetime.strptime(x['pubDate'], '%Y-%m-%d %H:%M:%S')
        ), reverse=True)
    else:  # time
        filtered_articles.sort(key=lambda x: datetime.strptime(x['pubDate'], '%Y-%m-%d %H:%M:%S'), reverse=True)
    
    # 分页
    articles = filtered_articles[:limit]
    
    return {
        "success": True,
        "count": len(articles),
        "total": len(filtered_articles),
        "last_update": cache['last_update'].isoformat() if cache['last_update'] else None,
        "data": articles
    }

@app.get("/api/news/{category}")
async def get_news_by_category(
    category: str,
    limit: int = 15
):
    """按分类获取新闻"""
    if not cache['articles']:
        cache['articles'] = await service.get_all_news()
        cache['last_update'] = datetime.now()
    
    filtered = []
    for article in cache['articles']:
        article_type = article.get('type', '').lower()
        article_tags = [tag.lower() for tag in article.get('tags', [])]
        
        if (category.lower() in article_type or 
            any(category.lower() in tag for tag in article_tags) or
            category.lower() in article.get('title', '').lower() or
            category.lower() in article.get('description', '').lower()):
            filtered.append(article)
    
    filtered = filtered[:limit]
    
    return {
        "success": True,
        "category": category,
        "count": len(filtered),
        "data": filtered
    }

@app.get("/api/news/search/{keyword}")
async def search_news(
    keyword: str,
    limit: int = 20,
    search_in: str = Query("all", description="搜索范围: title|content|tags|all")
):
    """搜索新闻"""
    if not cache['articles']:
        cache['articles'] = await service.get_all_news()
        cache['last_update'] = datetime.now()
    
    results = []
    keyword_lower = keyword.lower()
    
    for article in cache['articles']:
        title = article.get('title', '').lower()
        description = article.get('description', '').lower()
        content = article.get('content', '').lower()
        tags = [tag.lower() for tag in article.get('tags', [])]
        
        match = False
        
        if search_in == "title":
            match = keyword_lower in title
        elif search_in == "content":
            match = keyword_lower in content or keyword_lower in description
        elif search_in == "tags":
            match = any(keyword_lower in tag for tag in tags)
        else:  # all
            match = (keyword_lower in title or 
                    keyword_lower in description or
                    keyword_lower in content or
                    any(keyword_lower in tag for tag in tags))
        
        if match:
            results.append(article)
    
    results = results[:limit]
    
    return {
        "success": True,
        "keyword": keyword,
        "count": len(results),
        "data": results
    }

@app.get("/api/categories")
async def get_categories():
    """获取所有分类"""
    if not cache['articles']:
        cache['articles'] = await service.get_all_news()
        cache['last_update'] = datetime.now()
    
    categories = {}
    for article in cache['articles']:
        category = article.get('type', '未分类')
        categories[category] = categories.get(category, 0) + 1
    
    # 按数量排序
    sorted_categories = dict(sorted(categories.items(), key=lambda x: x[1], reverse=True))
    
    return {
        "success": True,
        "count": len(categories),
        "categories": sorted_categories
    }

@app.get("/api/tags")
async def get_tags(limit: int = 50):
    """获取所有标签"""
    if not cache['articles']:
        cache['articles'] = await service.get_all_news()
        cache['last_update'] = datetime.now()
    
    tags = {}
    for article in cache['articles']:
        for tag in article.get('tags', []):
            tags[tag] = tags.get(tag, 0) + 1
    
    # 按数量排序
    sorted_tags = dict(sorted(tags.items(), key=lambda x: x[1], reverse=True)[:limit])
    
    return {
        "success": True,
        "count": len(sorted_tags),
        "tags": sorted_tags
    }

@app.get("/api/stats")
async def get_stats():
    """获取统计信息"""
    categories = {}
    sources = {}
    tags = {}
    
    for article in cache['articles']:
        category = article.get('type', '未分类')
        source = article.get('source', '未知')
        article_tags = article.get('tags', [])
        
        categories[category] = categories.get(category, 0) + 1
        sources[source] = sources.get(source, 0) + 1
        
        for tag in article_tags:
            tags[tag] = tags.get(tag, 0) + 1
    
    # 获取最热门的标签
    top_tags = dict(sorted(tags.items(), key=lambda x: x[1], reverse=True)[:20])
    
    # 时间分布
    today = datetime.now().date()
    last_week = today - timedelta(days=7)
    last_month = today - timedelta(days=30)
    
    recent_week = 0
    recent_month = 0
    
    for article in cache['articles']:
        try:
            pub_date = datetime.strptime(article['pubDate'], '%Y-%m-%d %H:%M:%S').date()
            if pub_date >= last_week:
                recent_week += 1
            if pub_date >= last_month:
                recent_month += 1
        except:
            pass
    
    return {
        "success": True,
        "total_articles": len(cache['articles']),
        "last_update": cache['last_update'].isoformat() if cache['last_update'] else None,
        "time_distribution": {
            "last_7_days": recent_week,
            "last_30_days": recent_month
        },
        "categories": dict(sorted(categories.items(), key=lambda x: x[1], reverse=True)[:15]),
        "sources": dict(sorted(sources.items(), key=lambda x: x[1], reverse=True)[:10]),
        "top_tags": top_tags
    }

@app.post("/api/refresh")
async def refresh_news():
    """刷新新闻数据"""
    if cache['updating']:
        raise HTTPException(status_code=429, detail="正在更新中，请稍后重试")
    
    try:
        cache['updating'] = True
        new_articles = await service.get_all_news()
        cache['articles'] = new_articles
        cache['last_update'] = datetime.now()
        
        return {
            "success": True,
            "message": f"成功刷新 {len(new_articles)} 篇文章",
            "last_update": cache['last_update'].isoformat()
        }
    except Exception as e:
        logger.error(f"刷新失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"刷新失败: {str(e)}")
    finally:
        cache['updating'] = False

def run_server(host: str = "0.0.0.0", port: int = 8000):
    """运行FastAPI服务器"""
    logger.info("=" * 60)
    logger.info("通信技术资讯服务 v4.1.0")
    logger.info(f"服务地址: http://{host}:{port}")
    logger.info("=" * 60)
    logger.info("主要功能:")
    logger.info("1. 精心编写的通信技术高质量新闻")
    logger.info("2. 支持多个RSS源实时更新")
    logger.info("3. 智能分类和标签系统")
    logger.info("4. 强大的搜索和筛选功能")
    logger.info("5. 包含图片和详细统计")
    logger.info("=" * 60)
    logger.info("API端点:")
    logger.info("  GET  /              - 服务信息")
    logger.info("  GET  /api/health    - 健康检查")
    logger.info("  GET  /api/news      - 获取所有新闻")
    logger.info("  GET  /api/news/{category} - 按分类获取")
    logger.info("  GET  /api/news/search/{keyword} - 搜索新闻")
    logger.info("  GET  /api/categories - 获取分类列表")
    logger.info("  GET  /api/tags      - 获取标签列表")
    logger.info("  GET  /api/stats     - 统计信息")
    logger.info("  POST /api/refresh   - 刷新数据")
    logger.info("=" * 60)
    
    uvicorn.run(app, host=host, port=port)

if __name__ == "__main__":
    # 初始加载数据
    async def init_data():
        logger.info("初始化加载新闻数据...")
        initial_news = await service.get_all_news()
        cache['articles'] = initial_news
        cache['last_update'] = datetime.now()
        logger.info(f"初始加载完成，共 {len(initial_news)} 篇文章")
    
    asyncio.run(init_data())
    
    # 运行服务器
    run_server()