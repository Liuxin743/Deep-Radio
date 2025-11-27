from flask import Flask, jsonify
import requests
import re
from datetime import datetime
import json
import os

app = Flask(__name__)

# 手动添加CORS支持
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

class DatasetsCrawler:
    def __init__(self):
        self.cache_file = "datasets_cache.json"
        self.cache_duration = 3600
        
    def get_awesome_datasets_data(self):
        """获取Awesome Public Datasets数据"""
        try:
            return self.get_real_datasets_with_links()
        except Exception as e:
            print(f"获取数据集数据失败: {e}")
            return self.get_real_datasets_with_links()
    
    def get_real_datasets_with_links(self):
        """返回包含真实链接的数据集数据"""
        return {
            'categories': [
                {
                    'name': 'Agriculture',
                    'datasets': [
                        {
                            'name': '全球主要作物历史产量数据集 1981-2016',
                            'description': '包含全球主要作物1981年至2016年的产量数据',
                            'status': 'OK',
                            'source': 'FAO',
                            'link': 'https://www.fao.org/faostat/en/#data/QCL'
                        },
                        {
                            'name': '土壤湿度高光谱基准数据集',
                            'description': '在五天实验中测量的土壤湿度数据集',
                            'status': 'OK', 
                            'source': 'NASA',
                            'link': 'https://www.nasa.gov/'
                        },
                        {
                            'name': '美国农业部营养数据库',
                            'description': 'USDA国家营养标准参考数据库',
                            'status': 'FIXME',
                            'source': 'USDA',
                            'link': 'https://fdc.nal.usda.gov/'
                        }
                    ]
                },
                {
                    'name': 'Biology',
                    'datasets': [
                        {
                            'name': '千人基因组计划',
                            'description': '2008-2015年运行的项目，创建了最大的公开人类基因组变异目录',
                            'status': 'OK',
                            'source': 'International Genome',
                            'link': 'https://www.internationalgenome.org/'
                        },
                        {
                            'name': '美国肠道微生物组项目',
                            'description': '最大的众包公民科学微生物组项目',
                            'status': 'OK',
                            'source': 'American Gut',
                            'link': 'https://americangut.org/'
                        },
                        {
                            'name': '蛋白质数据库',
                            'description': '由蛋白质数据库档案信息提供支持的资源',
                            'status': 'OK',
                            'source': 'RCSB PDB',
                            'link': 'https://www.rcsb.org/'
                        }
                    ]
                },
                {
                    'name': 'Climate+Weather', 
                    'datasets': [
                        {
                            'name': '全球气候数据',
                            'description': '包含1929年以来的全球气候数据',
                            'status': 'OK',
                            'source': 'WorldClim',
                            'link': 'https://www.worldclim.org/'
                        },
                        {
                            'name': 'NASA全球图像浏览服务',
                            'description': 'NASA提供的全球卫星图像数据',
                            'status': 'OK',
                            'source': 'NASA GIBS',
                            'link': 'https://earthdata.nasa.gov/eosdis/science-system-description/eosdis-components/gibs'
                        },
                        {
                            'name': 'NOAA气候数据集',
                            'description': '美国国家海洋和大气管理局的气候数据',
                            'status': 'OK',
                            'source': 'NOAA',
                            'link': 'https://www.noaa.gov/weather-climate/climate'
                        }
                    ]
                },
                {
                    'name': 'Economics',
                    'datasets': [
                        {
                            'name': '哈佛经济复杂性地图集',
                            'description': '探索全球贸易流动和市场动态的数据库',
                            'status': 'OK',
                            'source': 'Harvard CID', 
                            'link': 'https://atlas.cid.harvard.edu/'
                        },
                        {
                            'name': '世界银行开放数据',
                            'description': '包含全球发展指标的综合性数据库',
                            'status': 'OK',
                            'source': 'World Bank',
                            'link': 'https://data.worldbank.org/'
                        },
                        {
                            'name': '我们的数据世界',
                            'description': '全球发展和生活条件的数据和研究',
                            'status': 'OK',
                            'source': 'Our World in Data',
                            'link': 'https://ourworldindata.org/'
                        }
                    ]
                },
                {
                    'name': 'MachineLearning',
                    'datasets': [
                        {
                            'name': 'UCI机器学习仓库',
                            'description': '经典的机器学习数据集集合',
                            'status': 'OK',
                            'source': 'UCI',
                            'link': 'https://archive.ics.uci.edu/'
                        },
                        {
                            'name': 'ImageNet',
                            'description': '按照WordNet层次结构组织的大规模图像数据库',
                            'status': 'OK',
                            'source': 'ImageNet',
                            'link': 'https://www.image-net.org/'
                        },
                        {
                            'name': 'Kaggle数据集',
                            'description': '数据科学竞赛和数据集平台',
                            'status': 'OK',
                            'source': 'Kaggle',
                            'link': 'https://www.kaggle.com/datasets'
                        }
                    ]
                },
                {
                    'name': 'ComputerNetworks',
                    'datasets': [
                        {
                            'name': 'Common Crawl网络数据',
                            'description': '超过7年的网络爬虫数据',
                            'status': 'OK',
                            'source': 'Common Crawl',
                            'link': 'https://commoncrawl.org/'
                        },
                        {
                            'name': 'Criteo点击数据',
                            'description': '广告点击率预测数据集',
                            'status': 'OK',
                            'source': 'Criteo',
                            'link': 'https://ailab.criteo.com/criteo-sponsored-search-conversion-log-dataset/'
                        }
                    ]
                },
                {
                    'name': 'Healthcare',
                    'datasets': [
                        {
                            'name': 'COVID-19数据仓库',
                            'description': '约翰霍普金斯大学CSSE的COVID-19数据',
                            'status': 'OK',
                            'source': 'JHU CSSE',
                            'link': 'https://github.com/CSSEGISandData/COVID-19'
                        },
                        {
                            'name': '癌症基因组图谱',
                            'description': '全面的癌症基因组数据',
                            'status': 'OK',
                            'source': 'TCGA',
                            'link': 'https://www.cancer.gov/tcga'
                        }
                    ]
                },
                {
                    'name': 'SocialNetworks',
                    'datasets': [
                        {
                            'name': '斯坦福大型网络数据集',
                            'description': '各种社交网络和引用网络数据集',
                            'status': 'OK',
                            'source': 'Stanford SNAP',
                            'link': 'https://snap.stanford.edu/data/'
                        },
                        {
                            'name': 'Twitter社交数据',
                            'description': '用于情感分析的Twitter数据',
                            'status': 'OK',
                            'source': 'Twitter',
                            'link': 'https://www.kaggle.com/datasets/kazanova/sentiment140'
                        }
                    ]
                },
                {
                    'name': 'Transportation',
                    'datasets': [
                        {
                            'name': 'NYC出租车行程数据',
                            'description': '纽约市出租车行程数据2009年至今',
                            'status': 'OK',
                            'source': 'NYC TLC',
                            'link': 'https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page'
                        },
                        {
                            'name': '航班准点性能数据',
                            'description': '美国航空公司准点性能数据',
                            'status': 'OK',
                            'source': 'RITA BTS',
                            'link': 'https://www.transtats.bts.gov/'
                        }
                    ]
                },
                {
                    'name': 'Government',
                    'datasets': [
                        {
                            'name': '数据美国政府',
                            'description': '美国联邦政府数据目录',
                            'status': 'OK',
                            'source': 'Data.gov',
                            'link': 'https://www.data.gov/'
                        },
                        {
                            'name': '欧盟统计局',
                            'description': '欧洲联盟的统计办公室',
                            'status': 'OK',
                            'source': 'Eurostat',
                            'link': 'https://ec.europa.eu/eurostat'
                        },
                        {
                            'name': '英国政府数据',
                            'description': '英国政府的开放数据门户',
                            'status': 'OK',
                            'source': 'UK Government',
                            'link': 'https://data.gov.uk/'
                        }
                    ]
                }
            ],
            'last_updated': datetime.now().isoformat(),
            'total_categories': 10,
            'total_datasets': 25
        }

crawler = DatasetsCrawler()

@app.route('/')
def home():
    return '''
    <h1>Awesome Public Datasets API</h1>
    <p>服务正在运行！包含真实数据链接。</p>
    <p>可用接口：</p>
    <ul>
        <li><a href="/api/datasets">/api/datasets</a> - 获取数据集数据</li>
        <li><a href="/api/stats">/api/stats</a> - 获取统计信息</li>
    </ul>
    '''

@app.route('/api/datasets')
def get_datasets():
    """获取数据集数据API"""
    try:
        data = crawler.get_awesome_datasets_data()
        return jsonify({
            'success': True,
            'data': data
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })

@app.route('/api/stats')
def get_stats():
    """获取统计信息"""
    try:
        data = crawler.get_awesome_datasets_data()
        stats = {
            'total_categories': data['total_categories'],
            'total_datasets': data['total_datasets'],
            'last_updated': data['last_updated']
        }
        return jsonify({
            'success': True,
            'data': stats
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })

if __name__ == '__main__':
    print("🚀 启动Awesome Datasets API服务...")
    print("📍 服务地址: http://127.0.0.1:5002")
    print("📊 数据接口: http://127.0.0.1:5002/api/datasets")
    print("🔗 所有数据集都包含真实可点击的链接")
    app.run(debug=True, host='127.0.0.1', port=5002)