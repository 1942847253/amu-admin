<template>
  <div class="page-container">
    <AmuCard class="page-card">
      <template #title>策略矩阵</template>

      <AmuTable :data="rows" border stripe>
        <AmuTableColumn prop="roleName" label="角色" min-width="140" />
        <AmuTableColumn prop="roleCode" label="角色编码" min-width="160">
          <template #default="{ row }">
            <AmuTag type="primary">{{ row.roleCode }}</AmuTag>
          </template>
        </AmuTableColumn>
        <AmuTableColumn prop="dataScope" label="数据范围" min-width="180" />
        <AmuTableColumn prop="permissions" label="核心权限" min-width="360">
          <template #default="{ row }">
            <AmuSpace wrap>
              <AmuTag v-for="permission in row.permissions.slice(0, 4)" :key="permission.code">
                {{ permission.code }}
              </AmuTag>
              <AmuTag v-if="row.permissions.length > 4" type="warning">+{{ row.permissions.length - 4 }}</AmuTag>
            </AmuSpace>
          </template>
        </AmuTableColumn>
      </AmuTable>
    </AmuCard>
  </div>
</template>

<script setup lang="ts">
import { AmuCard } from 'amu-ui/card'
import { AmuMessage } from 'amu-ui/message'
import { AmuSpace } from 'amu-ui/space'
import { AmuTable, AmuTableColumn } from 'amu-ui/table'
import { AmuTag } from 'amu-ui/tag'
import { onMounted, ref } from 'vue'
import { fetchPolicyMatrix, type PolicyMatrixRow } from '../api/access-control'

defineOptions({
  name: 'SecurityPolicyMatrix'
})

const rows = ref<PolicyMatrixRow[]>([])

const loadPolicyMatrix = async () => {
  try {
    rows.value = await fetchPolicyMatrix()
  } catch (error) {
    const message = error instanceof Error ? error.message : '加载策略矩阵失败'
    AmuMessage.error({ message })
  }
}

onMounted(() => {
  void loadPolicyMatrix()
})
</script>
