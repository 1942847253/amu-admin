<template>
  <div class="dashboard">
    <AmuRow :gutter="16">
      <AmuCol :span="6" v-for="item in stats" :key="item.label">
        <AmuCard class="stat-card" :body-style="{ padding: '16px 20px' }">
          <div class="stat-card__header">
            <span class="stat-card__title">{{ item.label }}</span>
            <div class="stat-card__icon-wrapper" :style="{ color: item.color, backgroundColor: item.bgColor }">
              <AmuIcon><component :is="item.icon" /></AmuIcon>
            </div>
          </div>
          <div class="stat-card__value">{{ item.value }}</div>
          <div class="stat-card__divider"></div>
          <div class="stat-card__footer">
            <span class="stat-card__label">{{ item.sub }}</span>
            <span class="stat-card__total">{{ item.total }}</span>
          </div>
        </AmuCard>
      </AmuCol>
    </AmuRow>

    <AmuCard class="chart-card trend-card">
      <div class="trend-tabs">
        <div class="trend-tab active">流量趋势</div>
        <div class="trend-tab">月访问量</div>
      </div>
      <div ref="trendChartRef" style="height: 320px; width: 100%;"></div>
    </AmuCard>

    <AmuRow :gutter="16" class="bottom-row">
      <AmuCol :span="8">
        <AmuCard class="chart-card">
          <div class="chart-card__header">访问数量</div>
          <div ref="radarChartRef" style="height: 280px; width: 100%;"></div>
        </AmuCard>
      </AmuCol>
      <AmuCol :span="8">
        <AmuCard class="chart-card">
          <div class="chart-card__header">访问来源</div>
          <div ref="doughnutChartRef" style="height: 280px; width: 100%;"></div>
        </AmuCard>
      </AmuCol>
      <AmuCol :span="8">
        <AmuCard class="chart-card">
          <div class="chart-card__header">访问来源</div>
          <div ref="pieChartRef" style="height: 280px; width: 100%;"></div>
        </AmuCard>
      </AmuCol>
    </AmuRow>
  </div>
</template>

<script setup lang="ts">
import { AmuCard } from 'amu-ui/card'
import { AmuCol } from 'amu-ui/col'
import { AmuIcon } from 'amu-ui/icon'
import { AmuRow } from 'amu-ui/row'
import {
  IconClock,
  IconCreditCard,
  IconDownload,
  IconPieChart
} from '@amu-ui/icons'
import { LineChart, PieChart, RadarChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import { graphic, init, use, type ECharts } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { fetchDashboardOverview } from '../api/dashboard'
import { cancelRequest } from '../api/http'

use([LineChart, PieChart, RadarChart, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer])

defineOptions({
  name: 'Dashboard'
})

interface StatItem {
  label: string
  value: string | number
  sub: string
  total: string | number
  icon: any
  color: string
  bgColor: string
}

const stats = ref<StatItem[]>([
  {
    label: '用户量',
    value: '--',
    sub: '总用户量',
    total: '--',
    icon: IconCreditCard,
    color: '#1890ff',
    bgColor: '#e6f7ff'
  },
  {
    label: '访问量',
    value: '--',
    sub: '总访问量',
    total: '--',
    icon: IconPieChart,
    color: '#ff4d4f',
    bgColor: '#fff1f0'
  },
  {
    label: '下载量',
    value: '--',
    sub: '总下载量',
    total: '--',
    icon: IconDownload,
    color: '#faad14',
    bgColor: '#fffbe6'
  },
  {
    label: '使用量',
    value: '--',
    sub: '总使用量',
    total: '--',
    icon: IconClock,
    color: '#52c41a',
    bgColor: '#f6ffed'
  }
])

const loadOverview = async () => {
  try {
    const data = await fetchDashboardOverview(true)
    stats.value[0].value = data.newUsers.toLocaleString('zh-CN')
    stats.value[0].total = (data.newUsers * 24).toLocaleString('zh-CN')

    stats.value[1].value = data.visits.toLocaleString('zh-CN')
    stats.value[1].total = (data.visits * 25).toLocaleString('zh-CN')

    stats.value[2].value = data.pendingTickets.toLocaleString('zh-CN')
    stats.value[2].total = (data.pendingTickets * 40).toLocaleString('zh-CN')

    stats.value[3].value = (data.newUsers + data.pendingTickets).toLocaleString('zh-CN')
    stats.value[3].total = (data.visits + data.newUsers * 5).toLocaleString('zh-CN')
  } catch (error) {
    // 错误处理可静默忽略或展示通知
  }
}

// Chart Refs
const trendChartRef = ref<HTMLDivElement | null>(null)
const radarChartRef = ref<HTMLDivElement | null>(null)
const doughnutChartRef = ref<HTMLDivElement | null>(null)
const pieChartRef = ref<HTMLDivElement | null>(null)

// Chart Instances
const trendChart = shallowRef<ECharts | null>(null)
const radarChart = shallowRef<ECharts | null>(null)
const doughnutChart = shallowRef<ECharts | null>(null)
const pieChart = shallowRef<ECharts | null>(null)

const initTrendChart = () => {
  if (!trendChartRef.value) return
  const chart = init(trendChartRef.value)
  trendChart.value = chart

  chart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['6:00', '7:00', '8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'],
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel: { color: '#6b7280' }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { type: 'solid', color: '#e5e7eb' } },
      axisLabel: { color: '#6b7280' }
    },
    series: [
      {
        name: '访问',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: { color: '#2580ef' },
        areaStyle: {
          color: new graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(37, 128, 239, 0.4)' },
            { offset: 1, color: 'rgba(37, 128, 239, 0.05)' }
          ])
        },
        data: [0, 1500, 5000, 15000, 32000, 55000, 63000, 32000, 18000, 34000, 70000, 42000, 22000, 12000, 8000, 3000, 1000, 0]
      },
      {
        name: '趋势',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: { color: '#0fb388' },
        areaStyle: {
          color: new graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(15, 179, 136, 0.5)' },
            { offset: 1, color: 'rgba(15, 179, 136, 0.05)' }
          ])
        },
        data: [0, 800, 1200, 1000, 3000, 6000, 20000, 3000, 1000, 12000, 22000, 10000, 2000, 800, 300, 100, 50, 0]
      }
    ]
  })
}

const initRadarChart = () => {
  if (!radarChartRef.value) return
  const chart = init(radarChartRef.value)
  radarChart.value = chart

  chart.setOption({
    tooltip: {},
    legend: {
      bottom: 0,
      icon: 'roundRect',
      data: ['访问', '趋势']
    },
    radar: {
      radius: '65%',
      indicator: [
        { name: '网页', max: 65000 },
        { name: '其它', max: 60000 },
        { name: '第三方', max: 60000 },
        { name: '客户端', max: 60000 },
        { name: 'Ipad', max: 60000 },
        { name: '移动端', max: 60000 }
      ],
      axisName: { color: '#6b7280' }
    },
    series: [
      {
        name: '访问数量',
        type: 'radar',
        data: [
          {
            value: [42000, 30000, 20000, 35000, 50000, 18000],
            name: '访问',
            itemStyle: { color: '#975fe4' },
            areaStyle: { color: 'rgba(151, 95, 228, 0.4)' }
          },
          {
            value: [50000, 14000, 28000, 26000, 42000, 21000],
            name: '趋势',
            itemStyle: { color: '#4096ff' },
            areaStyle: { color: 'rgba(64, 150, 255, 0.4)' }
          }
        ]
      }
    ]
  })
}

const initDoughnutChart = () => {
  if (!doughnutChartRef.value) return
  const chart = init(doughnutChartRef.value)
  doughnutChart.value = chart

  chart.setOption({
    tooltip: { trigger: 'item' },
    legend: {
      bottom: 0,
      icon: 'roundRect',
      data: ['搜索引擎', '直接访问', '邮件营销', '联盟广告']
    },
    series: [
      {
        name: '访问来源',
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 2,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: { show: false },
        data: [
          { value: 1048, name: '搜索引擎', itemStyle: { color: '#4096ff' } },
          { value: 735, name: '直接访问', itemStyle: { color: '#b37feb' } },
          { value: 580, name: '邮件营销', itemStyle: { color: '#36cfc9' } },
          { value: 484, name: '联盟广告', itemStyle: { color: '#73d13d' } }
        ]
      }
    ]
  })
}

const initPieChart = () => {
  if (!pieChartRef.value) return
  const chart = init(pieChartRef.value)
  pieChart.value = chart

  chart.setOption({
    tooltip: { trigger: 'item' },
    series: [
      {
        name: '访问来源',
        type: 'pie',
        radius: '70%',
        data: [
          { value: 335, name: '技术支持', itemStyle: { color: '#69c0ff' } },
          { value: 310, name: '定制', itemStyle: { color: '#b37feb' } },
          { value: 234, name: '远程', itemStyle: { color: '#5cdbd3' } },
          { value: 135, name: '外包', itemStyle: { color: '#13c2c2' } }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  })
}

const handleResize = () => {
  trendChart.value?.resize()
  radarChart.value?.resize()
  doughnutChart.value?.resize()
  pieChart.value?.resize()
}

onMounted(() => {
  void loadOverview()
  initTrendChart()
  initRadarChart()
  initDoughnutChart()
  initPieChart()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  cancelRequest('dashboard-overview')
  window.removeEventListener('resize', handleResize)
  trendChart.value?.dispose()
  radarChart.value?.dispose()
  doughnutChart.value?.dispose()
  pieChart.value?.dispose()
})
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Stat Cards */
.stat-card {
  transition: transform 0.2s, box-shadow 0.2s;
  height: 100%;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.stat-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.stat-card__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--amu-color-text-default);
}

.stat-card__icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  font-size: 16px;
}

.stat-card__value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--amu-color-text-default);
  margin-bottom: 16px;
}

.stat-card__divider {
  height: 1px;
  background-color: var(--amu-color-border-light, #f0f0f0);
  margin: 12px 0;
}

.stat-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  color: var(--amu-color-text-secondary);
}

.stat-card__total {
  color: var(--amu-color-text-default);
}

/* Charts */
.chart-card {
  height: 100%;
}

.chart-card__header {
  font-size: 16px;
  font-weight: 600;
  color: var(--amu-color-text-default);
  margin-bottom: 16px;
}

.trend-card {
  position: relative;
}

.trend-tabs {
  display: inline-flex;
  align-items: center;
  background-color: var(--amu-color-bg-fill);
  border-radius: var(--amu-radius, 4px);
  padding: 2px;
  margin-bottom: 20px;
}

.trend-tab {
  padding: 4px 16px;
  font-size: 14px;
  color: var(--amu-color-text-secondary);
  border-radius: var(--amu-radius, 4px);
  cursor: pointer;
  transition: all 0.3s;
}

.trend-tab:hover {
  color: var(--amu-color-primary);
}

.trend-tab.active {
  background-color: var(--amu-color-bg-elevated, #fff);
  color: var(--amu-color-text-default);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.bottom-row {
  margin-bottom: 16px;
}
</style>
