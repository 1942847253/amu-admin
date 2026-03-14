<template>
  <div class="page-container examples-table-empty-view">
    <AmuRow :gutter="16">
      <AmuCol :xs="24" :xl="16">
        <AmuCard class="page-card page-card--plain">
          <template #title>空态与加载</template>

          <div class="examples-table-empty-view__toolbar">
            <AmuSpace wrap>
              <AmuButton type="primary" @click="loadRows">加载数据</AmuButton>
              <AmuButton @click="clearRows">清空数据</AmuButton>
            </AmuSpace>
          </div>

          <AmuTable :data="rows" border :loading="loading" loading-text="正在加载表格数据...">
            <AmuTableColumn prop="name" label="作业名称" min-width="220" />
            <AmuTableColumn prop="window" label="执行窗口" min-width="160" />
            <AmuTableColumn prop="result" label="执行结果" min-width="140" />

            <template #empty>
              <div class="examples-table-empty-view__empty">
                <div class="examples-table-empty-view__empty-title">当前没有可展示的数据</div>
                <div class="examples-table-empty-view__empty-desc">适合用在首次接入、筛选无结果、任务暂未下发等场景。</div>
              </div>
            </template>
          </AmuTable>
        </AmuCard>
      </AmuCol>

      <AmuCol :xs="24" :xl="8">
        <AmuCard class="page-card">
          <template #title>交互建议</template>
          <AmuDescriptions :column="1" border>
            <AmuDescriptionsItem label="空态文案">尽量说明为什么没有数据，而不是只显示“暂无数据”</AmuDescriptionsItem>
            <AmuDescriptionsItem label="加载时机">首次进入页、切分页、切筛选条件时都应给用户明确反馈</AmuDescriptionsItem>
            <AmuDescriptionsItem label="当前状态">{{ loading ? '加载中' : rows.length > 0 ? '已加载' : '空数据' }}</AmuDescriptionsItem>
          </AmuDescriptions>
        </AmuCard>
      </AmuCol>
    </AmuRow>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { AmuButton } from 'amu-ui/button'
import { AmuCard } from 'amu-ui/card'
import { AmuCol } from 'amu-ui/col'
import { AmuDescriptions, AmuDescriptionsItem } from 'amu-ui/descriptions'
import { AmuRow } from 'amu-ui/row'
import { AmuSpace } from 'amu-ui/space'
import { AmuTable, AmuTableColumn } from 'amu-ui/table'

defineOptions({
  name: 'ExamplesTableEmptyView'
})

type JobRow = {
  id: string
  name: string
  window: string
  result: string
}

const loading = ref(false)
const rows = ref<JobRow[]>([])

const loadRows = () => {
  if (loading.value) return
  loading.value = true
  window.setTimeout(() => {
    rows.value = [
      { id: 'job-1', name: '租户账单归档', window: '02:00 - 02:30', result: '成功' },
      { id: 'job-2', name: '审计日志脱敏', window: '03:00 - 03:20', result: '成功' },
      { id: 'job-3', name: '菜单缓存预热', window: '04:00 - 04:10', result: '成功' }
    ]
    loading.value = false
  }, 500)
}

const clearRows = () => {
  if (loading.value) return
  rows.value = []
}
</script>

<style scoped>
.examples-table-empty-view__toolbar {
  margin-bottom: 12px;
}

.examples-table-empty-view__empty {
  padding: 24px 0;
  text-align: center;
}

.examples-table-empty-view__empty-title {
  color: var(--amu-color-text);
  font-weight: 600;
}

.examples-table-empty-view__empty-desc {
  margin-top: 8px;
  color: var(--amu-color-text-secondary);
}
</style>