<template>
  <section id="dataset-page" class="py-16 px-4 min-h-screen bg-slate-900 text-white">
    <div class="container mx-auto max-w-6xl">
      <!-- 页面标题 -->
      <h2 class="text-4xl font-bold text-center mb-8 text-purple-400">
        地理与信号数据集管理
      </h2>

      <!-- 操作栏 -->
      <div class="bg-slate-800 rounded-lg p-5 mb-6 flex flex-wrap gap-4 justify-between items-center">
        <div class="flex flex-wrap gap-4">
          <div>
            <label class="text-gray-300 mr-3">数据集类型：</label>
            <select v-model="selectedDatasetType" @change="loadDataset" class="bg-slate-700 text-white px-4 py-2 rounded border border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400">
              <option value="osm_geo">OSM地理数据集（道路+建筑）</option>
              <option value="signal_coverage">信号覆盖数据集</option>
              <option value="signal_strength">信号强度数据集</option>
              <option value="interference">干扰源分布数据集</option>
            </select>
          </div>
          <button @click="exportCurrentDataset" class="px-5 py-2 bg-indigo-700 hover:bg-indigo-600 rounded transition flex items-center gap-2">
            <i class="fa fa-download"></i> 导出数据集
          </button>
        </div>
        <div class="text-sm text-gray-400">
          最后更新：<span class="text-purple-300">{{ lastUpdateTime }}</span>
        </div>
      </div>

      <!-- 核心内容区：图表+详情 + 地图 -->
      <div class="flex flex-col gap-6 mb-8">
        <!-- 上半部分：图表+详情 -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- 左侧：双图表组合（占2/3） -->
          <div class="lg:col-span-2 bg-slate-800 rounded-lg p-5">
            <h3 class="text-xl font-semibold mb-4 flex items-center gap-2">
              <i class="fa fa-bar-chart text-purple-400"></i> 数据集可视化
            </h3>
            <!-- 图表容器：上下布局（添加固定宽高） -->
            <div class="grid grid-rows-2 gap-4" style="height: 600px;">
              <div ref="scatterChartContainer" class="w-full h-full rounded" style="width: 100%; height: 100%;"></div>
              <div ref="statsChartContainer" class="w-full h-full rounded" style="width: 100%; height: 100%;"></div>
            </div>
          </div>

          <!-- 右侧：数据详情 -->
          <div class="bg-slate-800 rounded-lg p-5">
            <h3 class="text-xl font-semibold mb-4 flex items-center gap-2">
              <i class="fa fa-info-circle text-purple-400"></i> 数据集详情
            </h3>
            <div class="space-y-4 text-gray-200">
              <div class="p-3 bg-slate-700 rounded">
                <p class="text-sm text-gray-400">数据集名称</p>
                <p class="text-lg font-medium">{{ datasetDetail.name }}</p>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div class="p-3 bg-slate-700 rounded text-center">
                  <p class="text-sm text-gray-400">数据点数</p>
                  <p class="text-xl font-bold text-purple-300">{{ datasetDetail.pointCount }}</p>
                </div>
                <div class="p-3 bg-slate-700 rounded text-center">
                  <p class="text-sm text-gray-400">数据量</p>
                  <p class="text-xl font-bold text-purple-300">{{ datasetDetail.size }}</p>
                </div>
              </div>
              <div class="p-3 bg-slate-700 rounded">
                <p class="text-sm text-gray-400">采集区域</p>
                <p class="font-medium">{{ datasetDetail.area }}</p>
              </div>
              <div class="p-3 bg-slate-700 rounded">
                <p class="text-sm text-gray-400">数据描述</p>
                <p class="text-gray-300 text-sm leading-relaxed">{{ datasetDetail.description }}</p>
              </div>
              <!-- 核心指标卡片 -->
              <div class="p-3 bg-purple-900/30 rounded border border-purple-500/30">
                <p class="text-sm text-gray-300">核心指标</p>
                <p class="text-2xl font-bold text-purple-300">{{ coreIndicator.value }}</p>
                <p class="text-xs text-purple-200">{{ coreIndicator.label }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 下半部分：地图展示（修复宽高问题） -->
        <div class="bg-slate-800 rounded-lg p-5">
          <h3 class="text-xl font-semibold mb-4 flex items-center gap-2">
            <i class="fa fa-map-marker text-purple-400"></i> 地理分布地图
          </h3>
          <!-- 地图容器：强制设置固定宽高，确保初始化时有尺寸 -->
          <div class="relative w-full rounded overflow-hidden border border-slate-700/30" style="height: 500px; width: 100%;">
            <div ref="mapContainer" style="width: 100%; height: 100%;"></div>
            <!-- 自定义版权声明 -->
            <div class="custom-osm-attribution">
              © OSM OpenStreetMap contributors
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted, watchEffect } from 'vue';
import * as echarts from 'echarts';
// 导入OpenLayers地图依赖
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Style, Fill, Stroke, Circle } from 'ol/style';
import { fromLonLat } from 'ol/proj';
import { defaults as defaultControls } from 'ol/control';

// 状态管理
const selectedDatasetType = ref('osm_geo');
const lastUpdateTime = ref('2025-11-20 16:30:00');
const scatterChartContainer = ref<HTMLDivElement | null>(null);
const statsChartContainer = ref<HTMLDivElement | null>(null);
const mapContainer = ref<HTMLDivElement | null>(null); // 地图容器ref
let scatterChart: echarts.ECharts | null = null;
let statsChart: echarts.ECharts | null = null;
let map: Map | null = null; // 地图实例
let dataVectorLayer: VectorLayer<VectorSource<Feature>> | null = null; // 数据矢量层

// 数据集详情（不变）
const datasetDetail = ref({
  name: 'OSM地理数据集（道路+建筑）',
  pointCount: 8817,
  size: '5.88MB',
  area: '湖南岳阳核心区（经纬度：112.83-112.95, 28.16-28.26）',
  description: '包含区域内所有道路和建筑的地理坐标数据，道路3601条，建筑5216栋，数据来源于OSM OpenStreetMap开源项目。'
});

// 核心指标（不变）
const coreIndicator = ref({
  value: '52.16%',
  label: '道路占比（总地理要素）'
});

// 模拟数据集（不变）
const mockDatasets = {
  osm_geo: {
    detail: {
      name: 'OSM地理数据集（道路+建筑）',
      pointCount: 8817,
      size: '5.88MB',
      area: '湖南岳阳核心区（经纬度：112.83-112.95, 28.16-28.26）',
      description: '包含区域内所有道路和建筑的地理坐标数据，道路3601条，建筑5216栋，数据来源于OSM OpenStreetMap开源项目。'
    },
    data: Array.from({ length: 200 }, (_, i) => ({
      lon: 112.83 + Math.random() * 0.12,
      lat: 28.16 + Math.random() * 0.10,
      value: Math.floor(Math.random() * 2), // 0=建筑，1=道路
      type: Math.random() > 0.5 ? '道路' : '建筑'
    })),
    coreIndicator: { value: '52.16%', label: '道路占比（总地理要素）' }
  },
  signal_coverage: {
    detail: {
      name: '信号覆盖数据集',
      pointCount: 5280,
      size: '8.2MB',
      area: '湖南岳阳核心区（经纬度：112.83-112.95, 28.16-28.26）',
      description: '区域内无线信号覆盖度数据，覆盖度范围0-100，数值越高表示信号覆盖越好。'
    },
    data: Array.from({ length: 200 }, (_, i) => ({
      lon: 112.83 + Math.random() * 0.12,
      lat: 28.16 + Math.random() * 0.10,
      value: 60 + Math.random() * 40,
      type: '信号覆盖'
    })),
    coreIndicator: { value: '89.7', label: '平均覆盖度（0-100）' }
  },
  signal_strength: {
    detail: {
      name: '信号强度数据集',
      pointCount: 3620,
      size: '5.9MB',
      area: '湖南岳阳核心区（经纬度：112.83-112.95, 28.16-28.26）',
      description: '区域内无线信号强度数据，单位dBm，数值越接近0表示信号越强。'
    },
    data: Array.from({ length: 200 }, (_, i) => ({
      lon: 112.83 + Math.random() * 0.12,
      lat: 28.16 + Math.random() * 0.10,
      value: -70 + Math.random() * 30,
      type: '信号强度'
    })),
    coreIndicator: { value: '-52.3 dBm', label: '平均信号强度' }
  },
  interference: {
    detail: {
      name: '干扰源分布数据集',
      pointCount: 1250,
      size: '2.1MB',
      area: '湖南岳阳核心区（经纬度：112.83-112.95, 28.16-28.26）',
      description: '区域内无线信号干扰源分布数据，干扰强度等级10-50，数值越高表示干扰越严重。'
    },
    data: Array.from({ length: 200 }, (_, i) => ({
      lon: 112.83 + Math.random() * 0.12,
      lat: 28.16 + Math.random() * 0.10,
      value: 10 + Math.random() * 40,
      type: '干扰源'
    })),
    coreIndicator: { value: '27.8', label: '平均干扰强度（10-50）' }
  }
};

// 计算数值分布区间（不变）
const getValueRanges = (data: any[], type: string) => {
  const values = data.map(item => item.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const step = type === 'signal_strength' ? 10 : 20;
  const ranges: string[] = [];
  const counts: number[] = [];

  for (let i = Math.floor(min / step) * step; i <= Math.ceil(max / step) * step; i += step) {
    const end = i + step;
    ranges.push(type === 'signal_strength' ? `${i}~${end} dBm` : `${i}~${end}`);
    counts.push(data.filter(item => item.value >= i && item.value < end).length);
  }

  return { ranges, counts };
};

// 安全初始化ECharts（不变）
const safeInitChart = (container: HTMLDivElement | null, initFn: (dom: HTMLDivElement) => echarts.ECharts | null) => {
  if (!container) return null;
  if (container.clientWidth === 0 || container.clientHeight === 0) {
    return new Promise<echarts.ECharts | null>((resolve) => {
      setTimeout(() => resolve(safeInitChart(container, initFn)), 100);
    });
  }
  return Promise.resolve(initFn(container));
};

// 初始化地理散点图（不变）
const initScatterChart = (data: any[]) => {
  const initFn = (dom: HTMLDivElement) => {
    if (scatterChart) scatterChart.dispose();
    const chart = echarts.init(dom);
    const lons = data.map(item => item.lon);
    const lats = data.map(item => item.lat);
    const [minLon, maxLon] = [Math.min(...lons), Math.max(...lons)];
    const [minLat, maxLat] = [Math.min(...lats), Math.max(...lats)];

    const option: echarts.EChartsOption = {
      backgroundColor: '#1e293b',
      title: { text: '地理空间分布', left: 'center', textStyle: { color: '#e2e8f0', fontSize: 14 } },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => `
          经度：${params.data.lon.toFixed(6)}<br/>
          纬度：${params.data.lat.toFixed(6)}<br/>
          类型：${params.data.type}<br/>
          数值：${params.data.value}
        `,
        backgroundColor: '#1a2435', borderColor: '#374151', textStyle: { color: '#e2e8f0' }
      },
      xAxis: {
        type: 'value', name: '经度', nameTextStyle: { color: '#e2e8f0' },
        axisLine: { lineStyle: { color: '#374151' } }, axisLabel: { color: '#e2e8f0' },
        splitLine: { lineStyle: { color: '#2d3748' } }, min: minLon - 0.01, max: maxLon + 0.01
      },
      yAxis: {
        type: 'value', name: '纬度', nameTextStyle: { color: '#e2e8f0' },
        axisLine: { lineStyle: { color: '#374151' } }, axisLabel: { color: '#e2e8f0' },
        splitLine: { lineStyle: { color: '#2d3748' } }, min: minLat - 0.01, max: maxLat + 0.01
      },
      visualMap: {
        min: Math.min(...data.map(item => item.value)), max: Math.max(...data.map(item => item.value)),
        left: 'left', top: 'bottom', text: ['高', '低'], textStyle: { color: '#e2e8f0' },
        calculable: true, inRange: { color: ['#4361ee', '#7209b7', '#f72585'] }
      },
      series: [{
        name: '数据分布', type: 'scatter', data: data, symbolSize: 12,
        emphasis: { itemStyle: { shadowBlur: 15, shadowColor: 'rgba(168, 85, 247, 0.6)' } }
      }]
    };

    chart.setOption(option);
    return chart;
  };

  safeInitChart(scatterChartContainer.value, initFn).then(chart => {
    scatterChart = chart;
  });
};

// 初始化统计图表（不变）
const initStatsChart = (data: any[], type: string) => {
  const initFn = (dom: HTMLDivElement) => {
    if (statsChart) statsChart.dispose();
    const chart = echarts.init(dom);
    let option: echarts.EChartsOption = {};

    if (type === 'osm_geo') {
      const roadCount = data.filter(item => item.type === '道路').length;
      const buildingCount = data.filter(item => item.type === '建筑').length;
      option = {
        backgroundColor: '#1e293b', title: { text: '道路/建筑占比', left: 'center', textStyle: { color: '#e2e8f0', fontSize: 14 } },
        tooltip: { trigger: 'item', backgroundColor: '#1a2435', borderColor: '#374151', textStyle: { color: '#e2e8f0' } },
        series: [{
          name: '要素类型', type: 'pie', radius: ['40%', '70%'], center: ['50%', '50%'],
          data: [
            { value: roadCount, name: '道路', itemStyle: { color: '#4361ee' } },
            { value: buildingCount, name: '建筑', itemStyle: { color: '#f72585' } }
          ],
          label: { color: '#e2e8f0', formatter: '{b}: {d}%' },
          itemStyle: { borderColor: '#1e293b', borderWidth: 2 },
          labelLine: { lineStyle: { color: '#94a3b8' } }
        }]
      };
    } else {
      const { ranges, counts } = getValueRanges(data, type);
      option = {
        backgroundColor: '#1e293b', title: { text: `${datasetDetail.value.name} 数值分布`, left: 'center', textStyle: { color: '#e2e8f0', fontSize: 14 } },
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, backgroundColor: '#1a2435', borderColor: '#374151', textStyle: { color: '#e2e8f0' } },
        xAxis: {
          type: 'category', data: ranges, axisLine: { lineStyle: { color: '#374151' } },
          axisLabel: { color: '#e2e8f0', rotate: 30 }
        },
        yAxis: {
          type: 'value', name: '数据点数', nameTextStyle: { color: '#e2e8f0' },
          axisLine: { lineStyle: { color: '#374151' } }, axisLabel: { color: '#e2e8f0' },
          splitLine: { lineStyle: { color: '#2d3748' } }
        },
        series: [{
          name: '数据分布', type: 'bar', data: counts, itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#7209b7' }, { offset: 1, color: '#f72585' }
            ])
          },
          barWidth: '60%',
          emphasis: { itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#4361ee' }, { offset: 1, color: '#7209b7' }
            ])
          } }
        }]
      };
    }

    chart.setOption(option);
    return chart;
  };

  safeInitChart(statsChartContainer.value, initFn).then(chart => {
    statsChart = chart;
  });
};

// 修复：初始化地图（确保容器有宽高后再创建）
const initMap = (data: any[]) => {
  // 使用watchEffect监听容器，确保有宽高后再初始化
  watchEffect(() => {
    if (!mapContainer.value) return;

    // 强制获取容器宽高，触发渲染
    const container = mapContainer.value;
    const width = container.offsetWidth;
    const height = container.offsetHeight;

    // 只有宽高都大于0时才初始化地图
    if (width > 0 && height > 0) {
      // 销毁已有地图实例
      if (map) map.dispose();

      // 创建地图（禁用默认版权控件）
      map = new Map({
        target: container,
        controls: defaultControls({ attribution: false }),
        layers: [new TileLayer({ source: new OSM() })],
        view: new View({
          center: fromLonLat([112.89, 28.21]), // 岳阳核心区
          zoom: 14
        })
      });

      // 创建数据矢量层
      const vectorSource = new VectorSource();
      dataVectorLayer = new VectorLayer({ source: vectorSource });
      map.addLayer(dataVectorLayer);

      // 添加数据点
      updateMapData(data);

      // 初始化完成后停止监听
      watchEffect.onInvalidate(() => {});
    }
  });
};

// 更新地图数据（不变）
const updateMapData = (data: any[]) => {
  if (!dataVectorLayer) return;
  const source = dataVectorLayer.getSource();
  if (!source) return;

  source.clear();
  data.forEach(item => {
    const coordinates = fromLonLat([item.lon, item.lat]);
    const feature = new Feature({ geometry: new Point(coordinates) });
    let style: Style;

    if (selectedDatasetType.value === 'osm_geo') {
      const color = item.type === '道路' ? '#4361ee' : '#f72585';
      style = new Style({
        image: new Circle({ radius: 6, fill: new Fill({ color }), stroke: new Stroke({ color: '#fff', width: 1 }) })
      });
    } else {
      const color = item.value > 80 ? '#f72585' : item.value > 50 ? '#7209b7' : '#4361ee';
      style = new Style({
        image: new Circle({ radius: 8, fill: new Fill({ color }), stroke: new Stroke({ color: '#fff', width: 1 }) })
      });
    }

    feature.setStyle(style);
    source.addFeature(feature);
  });
};

// 加载选中的数据集（修改：确保地图数据更新）
const loadDataset = () => {
  const dataset = mockDatasets[selectedDatasetType.value as keyof typeof mockDatasets];
  datasetDetail.value = dataset.detail;
  coreIndicator.value = dataset.coreIndicator;
  
  nextTick(() => {
    initScatterChart(dataset.data);
    initStatsChart(dataset.data, selectedDatasetType.value);
    // 延迟更新地图，确保DOM稳定
    setTimeout(() => {
      if (dataVectorLayer) {
        updateMapData(dataset.data);
      } else {
        initMap(dataset.data); // 若地图未初始化，重新初始化
      }
    }, 300);
  });
};

// 导出当前数据集（不变）
const exportCurrentDataset = () => {
  const dataset = mockDatasets[selectedDatasetType.value as keyof typeof mockDatasets];
  const blob = new Blob([JSON.stringify(dataset, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${dataset.detail.name}_${new Date().getTime()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

// 窗口resize适配（修改：增强地图自适应）
const handleResize = () => {
  setTimeout(() => {
    scatterChart?.resize();
    statsChart?.resize();
    // 地图自适应时强制刷新尺寸
    if (map && mapContainer.value) {
      const container = mapContainer.value;
      map.setSize([container.offsetWidth, container.offsetHeight]);
      map.updateSize();
    }
  }, 100);
};

// 生命周期（修改：确保地图初始化时机正确）
onMounted(() => {
  const defaultDataset = mockDatasets[selectedDatasetType.value as keyof typeof mockDatasets];
  datasetDetail.value = defaultDataset.detail;
  coreIndicator.value = defaultDataset.coreIndicator;
  
  // 双重保障：nextTick + 延迟，确保DOM完全渲染
  nextTick(() => {
    setTimeout(() => {
      initScatterChart(defaultDataset.data);
      initStatsChart(defaultDataset.data, selectedDatasetType.value);
      // 初始化地图（此时容器已渲染完成，有宽高）
      initMap(defaultDataset.data);
    }, 300); // 延长延迟，确保容器渲染
  });

  window.addEventListener('resize', handleResize);
});

// 组件卸载时清理（不变）
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  scatterChart?.dispose();
  statsChart?.dispose();
  map?.dispose();
});
</script>

<style scoped>
#dataset-page {
  background-color: #0f172a;
  overflow-x: hidden;
}

/* 确保父容器有高度，子容器继承 */
.grid-rows-2 {
  display: grid;
  grid-template-rows: 1fr 1fr;
  height: 100%;
}

/* 地图版权声明样式 */
.custom-osm-attribution {
  position: absolute !important;
  bottom: 10px !important;
  right: 10px !important;
  background: rgba(15, 23, 42, 0.9) !important;
  color: #e2e8f0 !important;
  padding: 4px 10px !important;
  border-radius: 6px !important;
  font-size: 11px !important;
  line-height: 1.4 !important;
  border: 1px solid rgba(168, 85, 247, 0.4) !important;
  z-index: 100 !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
}

/* 地图基础样式（不变） */
:deep(.ol-map) {
  width: 100% !important;
  height: 100% !important;
}

:deep(.ol-control) {
  filter: invert(1) brightness(0.8);
  border-radius: 6px !important;
  margin: 8px !important;
}

:deep(.ol-zoom) {
  background: rgba(15, 23, 42, 0.8) !important;
  border: 1px solid rgba(168, 85, 247, 0.3) !important;
}

/* 响应式适配（不变） */
@media (max-width: 1024px) {
  .grid-cols-3 {
    grid-template-columns: 1fr !important;
  }
  .grid-rows-2 {
    height: 800px !important;
  }
  .custom-osm-attribution {
    font-size: 10px !important;
    padding: 3px 8px !important;
  }
}

@media (max-width: 768px) {
  .grid-rows-2 {
    height: 600px !important;
  }
  h2 {
    font-size: 2.5rem !important;
  }
  .custom-osm-attribution {
    font-size: 9px !important;
    padding: 2px 6px !important;
  }
}

/* 按钮hover效果优化 */
button:hover {
  transform: translateY(-2px);
  transition: all 0.2s;
}

/* ECharts容器样式 */
:deep(.echarts-container) {
  border-radius: 0.5rem;
  overflow: hidden;
}

/* 确保容器不会被压缩（增强） */
div[ref="scatterChartContainer"],
div[ref="statsChartContainer"],
div[ref="mapContainer"] {
  min-width: 300px !important;
  min-height: 200px !important;
  width: 100% !important;
  height: 100% !important;
}
</style>