<template>
  <div class="page-container">
    <AmuCard class="page-card">
      <template #title>审计日志</template>

      <AmuTable :data="rows" border stripe>
        <AmuTableColumn prop="createdAt" label="时间" min-width="180" />
        <AmuTableColumn prop="operator" label="操作人" min-width="120" />
        <AmuTableColumn prop="action" label="动作" min-width="220" />
        <AmuTableColumn prop="resource" label="资源" min-width="220" />
        <AmuTableColumn prop="result" label="结果" min-width="100">
          <template #default="{ row }">
            <AmuTag :type="row.result === 'SUCCESS' ? 'success' : 'danger'">{{ row.result }}</AmuTag>
          </template>
        </AmuTableColumn>
      </AmuTable>
    </AmuCard>
  </div>
</template>

<script setup lang="ts">
import { AmuCard } from 'amu-ui/card'
import { AmuMessage } from 'amu-ui/message'
import { AmuTable, AmuTableColumn } from 'amu-ui/table'
import { AmuTag } from 'amu-ui/tag'
import { onMounted, ref } from 'vue'
import { fetchAuditLogs, type AuditLogRow } from '../api/access-control'

defineOptions({
  name: 'SecurityAuditLogs'
})

const rows = ref<AuditLogRow[]>([])

const loadAuditLogs = async () => {
  try {
    rows.value = await fetchAuditLogs()
  } catch (error) {
    const message = error instanceof Error ? error.message : '加载审计日志失败'
    AmuMessage.error({ message })
  }
}

onMounted(() => {
  void loadAuditLogs()
})
</script>
