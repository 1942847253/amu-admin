<template>
  <div class="page-container examples-table-view">
    <AmuCard class="page-card page-card--plain">
      <template #title>状态表格</template>

      <AmuTabs v-model="activeTab" class="examples-table-view__tabs">
        <AmuTabPane name="all" title="全部任务" />
        <AmuTabPane name="running" title="进行中" />
        <AmuTabPane name="risk" title="风险中" />
      </AmuTabs>

      <AmuTable :data="filteredRows" border stripe>
        <AmuTableColumn prop="name" label="任务名称" min-width="220" />
        <AmuTableColumn prop="owner" label="负责人" min-width="120" />
        <AmuTableColumn prop="env" label="环境" width="120">
          <template #default="{ row }">
            <AmuTag :type="row.env === '生产' ? 'danger' : 'primary'">{{ row.env }}</AmuTag>
          </template>
        </AmuTableColumn>
        <AmuTableColumn prop="status" label="状态" width="140">
          <template #default="{ row }">
            <AmuTag :type="resolveStatusType(row.status)">{{ row.status }}</AmuTag>
          </template>
        </AmuTableColumn>
        <AmuTableColumn label="进度" min-width="220">
          <template #default="{ row }">
            <div class="examples-table-view__progress-cell">
              <AmuProgress :percentage="row.progress" :stroke-width="8" :status="resolveProgressStatus(row.status)" />
            </div>
          </template>
        </AmuTableColumn>
        <AmuTableColumn prop="updatedAt" label="最近更新时间" min-width="180" />
        <AmuTableColumn label="操作" width="220" align="right">
          <template #default="{ row }">
            <AmuSpace :size="4">
              <AmuButton type="text" size="small" @click="inspectRow(row)">查看</AmuButton>
              <AmuButton type="text" size="small" @click="copyLink(row)">复制链接</AmuButton>
            </AmuSpace>
          </template>
        </AmuTableColumn>
      </AmuTable>
    </AmuCard>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { AmuButton } from 'amu-ui/button'
import { AmuCard } from 'amu-ui/card'
import { AmuMessage } from 'amu-ui/message'
import { AmuProgress } from 'amu-ui/progress'
import { AmuSpace } from 'amu-ui/space'
import { AmuTable, AmuTableColumn } from 'amu-ui/table'
import { AmuTabs, AmuTabPane } from 'amu-ui/tabs'
import { AmuTag } from 'amu-ui/tag'

defineOptions({
  name: 'ExamplesTableView'
})

type TaskStatus = '待开始' | '进行中' | '风险中' | '已完成'

const activeTab = ref<'all' | 'running' | 'risk'>('all')

const rows = [
  { id: 'release-1', name: '统一发布台灰度链路', owner: '林川', env: '预发', status: '进行中' as TaskStatus, progress: 72, updatedAt: '2026-03-08 09:20' },
  { id: 'release-2', name: '审计日志字段补齐', owner: '沈禾', env: '生产', status: '风险中' as TaskStatus, progress: 43, updatedAt: '2026-03-08 08:55' },
  { id: 'release-3', name: '菜单权限清理', owner: '赵安', env: '预发', status: '已完成' as TaskStatus, progress: 100, updatedAt: '2026-03-07 19:40' },
  { id: 'release-4', name: '登录页品牌配置抽离', owner: '陈夏', env: '测试', status: '待开始' as TaskStatus, progress: 15, updatedAt: '2026-03-07 17:12' }
]

const filteredRows = computed(() => {
  if (activeTab.value === 'running') {
    return rows.filter((row) => row.status === '进行中')
  }
  if (activeTab.value === 'risk') {
    return rows.filter((row) => row.status === '风险中')
  }
  return rows
})

const resolveStatusType = (status: TaskStatus) => {
  if (status === '已完成') return 'success'
  if (status === '风险中') return 'danger'
  if (status === '进行中') return 'warning'
  return 'primary'
}

const resolveProgressStatus = (status: TaskStatus) => {
  if (status === '已完成') return 'success'
  if (status === '风险中') return 'exception'
  if (status === '进行中') return 'warning'
  return 'normal'
}

const inspectRow = (row: (typeof rows)[number]) => {
  AmuMessage.info({ message: `已打开 ${row.name} 的查看动作示例` })
}

const copyLink = async (row: (typeof rows)[number]) => {
  await navigator.clipboard.writeText(`https://admin.example.local/tasks/${row.id}`)
  AmuMessage.success({ message: `已复制 ${row.name} 的访问链接` })
}
</script>

<style scoped>
.examples-table-view__tabs {
  margin-bottom: 12px;
}

.examples-table-view__progress-cell {
  min-width: 180px;
}
</style>