# backend/app.py
from flask import Flask, jsonify
from flask_cors import CORS
import requests
import re
from datetime import datetime
import json
import os
import sys

# 添加当前目录到Python路径
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

app = Flask(__name__)
CORS(app)  # 允许跨域请求

class LLMAgentsCrawler:
    def __init__(self):
        self.repo_owner = "WooooDyy"
        self.repo_name = "LLM-Agent-Paper-List"
        self.base_url = f"https://api.github.com/repos/{self.repo_owner}/{self.repo_name}"
        self.cache_file = os.path.join(current_dir, "llm_agents_cache.json")
        self.cache_duration = 3600
        
    def get_readme_content(self):
        """获取README内容"""
        try:
            print("正在从GitHub获取数据...")
            url = f"{self.base_url}/readme"
            headers = {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'LLM-Agent-News-Crawler'
            }
            
            response = requests.get(url, headers=headers, timeout=10)
            if response.status_code == 200:
                content = response.json()['content']
                import base64
                return base64.b64decode(content).decode('utf-8')
            else:
                print(f"GitHub API响应状态码: {response.status_code}")
                return None
        except Exception as e:
            print(f"获取README失败: {e}")
            return None
    
    def parse_news_section(self, readme_content):
        """解析新闻公告部分"""
        try:
            print("正在解析新闻部分...")
            news_section = re.search(r'## 🔔 News\s*\n(.*?)(?=\n## \w|$)', readme_content, re.DOTALL)
            if not news_section:
                print("未找到新闻部分")
                return []
                
            news_text = news_section.group(1)
            news_items = []
            lines = news_text.split('\n')
            current_news = ""
            
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                    
                if re.match(r'^[🎉🍺🚀👀☄️💫🥳💥✨]', line):
                    if current_news:
                        parsed_news = self.parse_single_news(current_news)
                        if parsed_news:
                            news_items.append(parsed_news)
                    current_news = line
                elif current_news:
                    current_news += " " + line
            
            if current_news:
                parsed_news = self.parse_single_news(current_news)
                if parsed_news:
                    news_items.append(parsed_news)
                    
            print(f"解析到 {len(news_items)} 条新闻")
            return news_items
        except Exception as e:
            print(f"解析新闻失败: {e}")
            return []
    
    def parse_single_news(self, news_text):
        """解析单条新闻"""
        try:
            date_match = re.search(r'\[(\d{4}/\d{2}/\d{2})\]', news_text)
            date = date_match.group(1).replace('/', '-') if date_match else None
            
            emoji_match = re.match(r'([🎉🍺🚀👀☄️💫🥳💥✨])\s*(.*)', news_text)
            emoji = emoji_match.group(1) if emoji_match else "📢"
            content = emoji_match.group(2) if emoji_match else news_text
            
            content = re.sub(r'\[.*?\]\(.*?\)', '', content).strip()
            
            paper_links = re.findall(r'\[paper\]\((.*?)\)', news_text)
            code_links = re.findall(r'\[code\]\((.*?)\)', news_text)
            project_links = re.findall(r'\[project page\]\((.*?)\)', news_text)
            
            return {
                'date': date,
                'emoji': emoji,
                'content': content,
                'links': {
                    'paper': paper_links[0] if paper_links else None,
                    'code': code_links[0] if code_links else None,
                    'project': project_links[0] if project_links else None
                },
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            print(f"解析单条新闻失败: {e}")
            return None
    
    def get_recent_papers(self, readme_content, limit=10):
        """获取最新论文"""
        try:
            print("正在解析论文部分...")
            papers = []
            paper_pattern = r'\[(\d{4}/\d{2}/\d{2})\]\s*(.*?)\s*\.\s*([^\.\n]+?)(?:\.\s*)?(\[paper\]\(.*?\))(?:\s*\[code\]\((.*?)\))?(?:\s*\[project page\]\((.*?)\))?'
            matches = re.findall(paper_pattern, readme_content)
            
            for match in matches:
                paper = {
                    'date': match[0].replace('/', '-'),
                    'title': match[1].strip(),
                    'authors': match[2].strip(),
                    'paper_link': re.search(r'\((.*?)\)', match[3]).group(1) if match[3] else None,
                    'code_link': re.search(r'\((.*?)\)', match[4]).group(1) if match[4] else None,
                    'project_link': re.search(r'\((.*?)\)', match[5]).group(1) if match[5] else None
                }
                papers.append(paper)
                
            print(f"解析到 {len(papers)} 篇论文")
            return sorted(papers, key=lambda x: x['date'], reverse=True)[:limit]
        except Exception as e:
            print(f"解析论文失败: {e}")
            return []
    
    def is_cache_valid(self):
        """检查缓存是否有效"""
        if not os.path.exists(self.cache_file):
            return False
        file_time = os.path.getmtime(self.cache_file)
        return (datetime.now().timestamp() - file_time) < self.cache_duration
    
    def load_cache(self):
        """加载缓存"""
        try:
            with open(self.cache_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            return None
    
    def save_cache(self, data):
        """保存缓存"""
        try:
            with open(self.cache_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"保存缓存失败: {e}")
    
    def crawl_all_data(self):
        """爬取所有数据"""
        if self.is_cache_valid():
            cached_data = self.load_cache()
            if cached_data:
                print("使用缓存数据")
                return cached_data
        
        print("开始爬取新数据...")
        readme_content = self.get_readme_content()
        if not readme_content:
            print("无法获取README内容")
            return None
            
        data = {
            'news': self.parse_news_section(readme_content),
            'papers': self.get_recent_papers(readme_content),
            'last_updated': datetime.now().isoformat(),
            'source': 'https://github.com/WooooDyy/LLM-Agent-Paper-List'
        }
        
        self.save_cache(data)
        print("数据爬取完成!")
        return data

# 创建爬虫实例
crawler = LLMAgentsCrawler()

@app.route('/')
def home():
    return '''
    <h1>LLM Agents 前沿动态 API</h1>
    <p>服务正在运行！</p>
    <p>可用接口：</p>
    <ul>
        <li><a href="/api/data">/api/data</a> - 获取数据</li>
        <li><a href="/api/refresh">/api/refresh</a> - 刷新数据</li>
    </ul>
    '''

@app.route('/api/data')
def get_data():
    """获取LLM Agents数据API"""
    try:
        print("接收到数据请求...")
        data = crawler.crawl_all_data()
        if data:
            return jsonify({
                'success': True,
                'data': data
            })
        else:
            return jsonify({
                'success': False,
                'error': '无法获取数据'
            })
    except Exception as e:
        print(f"API错误: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        })

@app.route('/api/refresh')
def refresh_data():
    """强制刷新数据"""
    try:
        print("接收到刷新请求...")
        if os.path.exists(crawler.cache_file):
            os.remove(crawler.cache_file)
            print("缓存文件已删除")
        
        data = crawler.crawl_all_data()
        if data:
            return jsonify({
                'success': True,
                'message': '数据刷新成功',
                'data': data
            })
        else:
            return jsonify({
                'success': False,
                'error': '刷新数据失败'
            })
    except Exception as e:
        print(f"刷新错误: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        })

if __name__ == '__main__':
    print("正在启动LLM Agents API服务...")
    print("服务将在 http://127.0.0.1:5001 启动")
    print("按 Ctrl+C 停止服务")
    app.run(
        debug=True, 
        host='127.0.0.1', 
        port=5001,
        threaded=True
    )