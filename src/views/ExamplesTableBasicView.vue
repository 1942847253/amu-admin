<template>
  <div class="page-container examples-table-basic-view">
    <AmuRow :gutter="16">
      <AmuCol :xs="24" :xl="16">
        <AmuCard class="page-card page-card--plain">
          <template #title>基础表格</template>

          <AmuTable :data="serviceRows" border>
            <AmuTableColumn prop="name" label="服务名称" min-width="180" />
            <AmuTableColumn prop="owner" label="负责人" min-width="120" />
            <AmuTableColumn prop="region" label="部署区域" min-width="140" />
            <AmuTableColumn label="可用性" width="140">
              <template #default="{ row }">
                <AmuTag :type="row.sla >= 99.95 ? 'success' : 'warning'">{{ row.sla }}%</AmuTag>
              </template>
            </AmuTableColumn>
            <AmuTableColumn prop="updatedAt" label="最近变更" min-width="180" />
          </AmuTable>
        </AmuCard>
      </AmuCol>

      <AmuCol :xs="24" :xl="8">
        <AmuCard class="page-card">
          <template #title>说明</template>
          <AmuDescriptions :column="1" border>
            <AmuDescriptionsItem label="适用场景">静态台账、基础列表、无需复杂操作的后台页</AmuDescriptionsItem>
            <AmuDescriptionsItem label="示例重点">边框、最小列宽、状态标签插槽</AmuDescriptionsItem>
            <AmuDescriptionsItem label="数据量">{{ serviceRows.length }} 条</AmuDescriptionsItem>
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
  name: 'ExamplesTableBasicView'
})

const serviceRows = [
  { id: 'svc-1', name: '统一认证服务', owner: '林川', region: '华东 1', sla: 99.98, updatedAt: '2026-03-08 09:25' },
  { id: 'svc-2', name: '运营规则引擎', owner: '沈禾', region: '华北 1', sla: 99.91, updatedAt: '2026-03-08 09:10' },
  { id: 'svc-3', name: '租户配置中心', owner: '赵安', region: '华南 1', sla: 99.99, updatedAt: '2026-03-07 18:42' }
]
</script>

<style scoped>
.examples-table-basic-view :deep(.amu-descriptions) {
  width: 100%;
}
</style>