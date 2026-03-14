<template>
  <div class="page-container examples-display-stats-view">
    <AmuRow :gutter="16">
      <AmuCol :xs="24" :xl="8" v-for="item in metricCards" :key="item.label">
        <AmuCard class="metric-panel">
          <div class="metric-panel__label">{{ item.label }}</div>
          <div class="metric-panel__value">{{ item.value }}</div>
          <div class="metric-panel__trend" :class="`is-${item.trend}`">{{ item.note }}</div>
        </AmuCard>
      </AmuCol>
    </AmuRow>

    <AmuRow :gutter="16" class="examples-display-stats-view__section">
      <AmuCol :xs="24" :xl="14">
        <AmuCard class="page-card">
          <template #title>指标拆解</template>
          <AmuTable :data="metricRows" border>
            <AmuTableColumn prop="name" label="指标" min-width="180" />
            <AmuTableColumn prop="owner" label="归属团队" min-width="120" />
            <AmuTableColumn prop="target" label="目标值" min-width="120" />
            <AmuTableColumn prop="status" label="状态" min-width="120">
              <template #default="{ row }">
                <AmuTag :type="row.status === '达标' ? 'success' : row.status === '风险' ? 'danger' : 'warning'">{{ row.status }}</AmuTag>
              </template>
            </AmuTableColumn>
          </AmuTable>
        </AmuCard>
      </AmuCol>

      <AmuCol :xs="24" :xl="10">
        <AmuCard class="page-card">
          <template #title>展示建议</template>
          <AmuDescriptions :column="1" border>
            <AmuDescriptionsItem label="卡片层级">顶部只放最关键指标，避免堆太多同权重数字</AmuDescriptionsItem>
            <AmuDescriptionsItem label="趋势表达">优先给出环比、同比或风险说明，而不是孤立数值</AmuDescriptionsItem>
            <AmuDescriptionsItem label="组合方式">统计卡片适合和表格、详情区组合，形成完整概览页</AmuDescriptionsItem>
          </AmuDescriptions>
        </AmuCard>
      </AmuCol>
    </AmuRow>
  </div>
</template>

<script setup lang="ts">
import { AmuCard } from 'amu-ui/card'
import { AmuCol } from 'amu-ui/col'
import { AmuDescriptions, AmuDescriptionsItem } from 'amu-ui/descriptions'
import { AmuRow } from 'amu-ui/row'
import { AmuTable, AmuTableColumn } from 'amu-ui/table'
import { AmuTag } from 'amu-ui/tag'

defineOptions({
  name: 'ExamplesDisplayStatsView'
})

const metricCards = [
  { label: '在线租户数', value: '2,486', note: '较昨日 +8.2%', trend: 'success' },
  { label: '待处理告警', value: '17', note: '较昨日 -3 条', trend: 'warning' },
  { label: '发布成功率', value: '99.3%', note: '本周保持稳定', trend: 'success' }
]

const metricRows = [
  { name: '菜单命中率', owner: '前端平台', target: '99%', status: '达标' },
  { name: '权限回源耗时', owner: '服务端', target: '< 120ms', status: '关注' },
  { name: '发布回滚成功率', owner: '运维平台', target: '100%', status: '风险' }
]
</script>

<style scoped>
.metric-panel {
  min-height: 132px;
}

.metric-panel__label {
  color: var(--amu-color-text-secondary);
  font-size: 14px;
}

.metric-panel__value {
  margin-top: 12px;
  color: var(--amu-color-text-default);
  font-size: 32px;
  font-weight: 700;
  line-height: 1.1;
}

.metric-panel__trend {
  margin-top: 10px;
  font-size: 14px;
}

.metric-panel__trend.is-success {
  color: var(--amu-color-status-success);
}

.metric-panel__trend.is-warning {
  color: var(--amu-color-status-warning);
}

.metric-panel__trend.is-danger {
  color: var(--amu-color-status-danger);
}

.examples-display-stats-view__section {
  margin-top: 16px;
}
</style>