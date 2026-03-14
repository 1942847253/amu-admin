<template>
  <div class="page-container examples-table-pagination-view">
    <AmuCard class="page-card page-card--plain">
      <template #title>分页表格</template>

      <AmuTable
        :data="tableData"
        border
        :loading="loading"
        :pagination="pagination"
        @page-change="handlePageChange"
      >
        <AmuTableColumn prop="code" label="工单编号" min-width="160" />
        <AmuTableColumn prop="title" label="问题标题" min-width="220" />
        <AmuTableColumn prop="handler" label="当前处理人" min-width="120" />
        <AmuTableColumn prop="priority" label="优先级" width="120">
          <template #default="{ row }">
            <AmuTag :type="row.priority === 'P1' ? 'danger' : row.priority === 'P2' ? 'warning' : 'primary'">{{ row.priority }}</AmuTag>
          </template>
        </AmuTableColumn>
        <AmuTableColumn prop="createdAt" label="创建时间" min-width="180" />
      </AmuTable>
    </AmuCard>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { AmuCard } from 'amu-ui/card'
import { AmuTable, AmuTableColumn } from 'amu-ui/table'
import { AmuTag } from 'amu-ui/tag'

defineOptions({
  name: 'ExamplesTablePaginationView'
})

type TicketRow = {
  id: string
  code: string
  title: string
  handler: string
  priority: 'P1' | 'P2' | 'P3'
  createdAt: string
}

const loading = ref(false)
const tableData = ref<TicketRow[]>([])
const pagination = reactive({
  current: 1,
  pageSize: 6,
  total: 36,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: true
})

const createMockRows = (page: number, pageSize: number): TicketRow[] => {
  return Array.from({ length: pageSize }).map((_, index) => {
    const serial = (page - 1) * pageSize + index + 1
    const priority = serial % 5 === 0 ? 'P1' : serial % 2 === 0 ? 'P2' : 'P3'
    return {
      id: `ticket-${serial}`,
      code: `INC-2026-${String(serial).padStart(4, '0')}`,
      title: `权限链路巡检异常 ${serial}`,
      handler: ['林川', '沈禾', '赵安', '陈夏'][serial % 4],
      priority,
      createdAt: `2026-03-${String((serial % 9) + 1).padStart(2, '0')} 10:${String(serial % 60).padStart(2, '0')}`
    }
  })
}

const loadData = (page: number, pageSize: number) => {
  loading.value = true
  window.setTimeout(() => {
    tableData.value = createMockRows(page, pageSize)
    pagination.current = page
    pagination.pageSize = pageSize
    loading.value = false
  }, 400)
}

const handlePageChange = (page: number, pageSize: number) => {
  loadData(page, pageSize)
}

onMounted(() => {
  loadData(1, pagination.pageSize)
})
</script>