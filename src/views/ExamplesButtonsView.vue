<template>
  <div class="page-container examples-buttons-view">
    <AmuRow :gutter="16">
      <AmuCol :xs="24" :xl="16">
        <AmuCard class="page-card">
          <template #title>按钮组合</template>

          <div class="demo-section">
            <div class="demo-section__label">工具栏组</div>
            <div class="button-group">
              <AmuButton type="primary">保存草稿</AmuButton>
              <AmuButton type="primary">提交审核</AmuButton>
              <AmuButton type="primary">发布</AmuButton>
            </div>
          </div>

          <div class="demo-section">
            <div class="demo-section__label">筛选态组</div>
            <div class="button-group button-group--soft">
              <AmuButton :type="activeFilter === 'all' ? 'primary' : 'default'" @click="activeFilter = 'all'">全部</AmuButton>
              <AmuButton :type="activeFilter === 'running' ? 'primary' : 'default'" @click="activeFilter = 'running'">运行中</AmuButton>
              <AmuButton :type="activeFilter === 'done' ? 'primary' : 'default'" @click="activeFilter = 'done'">已完成</AmuButton>
            </div>
          </div>

          <div class="demo-section">
            <div class="demo-section__label">带 loading 的操作组</div>
            <AmuSpace wrap>
              <AmuButton type="primary" :loading="primaryLoading" @click="runPrimaryAction">主操作</AmuButton>
              <AmuButton :loading="secondaryLoading" @click="runSecondaryAction">次操作</AmuButton>
              <AmuButton status="danger">中止流程</AmuButton>
            </AmuSpace>
          </div>
        </AmuCard>
      </AmuCol>

      <AmuCol :xs="24" :xl="8">
        <AmuCard class="page-card">
          <template #title>使用建议</template>
          <AmuDescriptions :column="1" border>
            <AmuDescriptionsItem label="推荐场景">表格工具栏、筛选条、页头操作区</AmuDescriptionsItem>
            <AmuDescriptionsItem label="交互建议">主按钮不超过 1 个，危险操作单独拉开</AmuDescriptionsItem>
            <AmuDescriptionsItem label="当前筛选">
              <AmuTag type="primary">{{ filterLabel }}</AmuTag>
            </AmuDescriptionsItem>
          </AmuDescriptions>
        </AmuCard>
      </AmuCol>
    </AmuRow>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { AmuButton } from 'amu-ui/button'
import { AmuCard } from 'amu-ui/card'
import { AmuDescriptions, AmuDescriptionsItem } from 'amu-ui/descriptions'
import { AmuMessage } from 'amu-ui/message'
import { AmuRow } from 'amu-ui/row'
import { AmuCol } from 'amu-ui/col'
import { AmuSpace } from 'amu-ui/space'
import { AmuTag } from 'amu-ui/tag'

defineOptions({
  name: 'ExamplesButtonsView'
})

const activeFilter = ref<'all' | 'running' | 'done'>('all')
const primaryLoading = ref(false)
const secondaryLoading = ref(false)

const filterLabel = computed(() => {
  const map = {
    all: '全部任务',
    running: '运行中',
    done: '已完成'
  }
  return map[activeFilter.value]
})

const runPrimaryAction = () => {
  if (primaryLoading.value) return
  primaryLoading.value = true
  window.setTimeout(() => {
    primaryLoading.value = false
    AmuMessage.success({ message: '主操作示例已执行' })
  }, 800)
}

const runSecondaryAction = () => {
  if (secondaryLoading.value) return
  secondaryLoading.value = true
  window.setTimeout(() => {
    secondaryLoading.value = false
    AmuMessage.info({ message: '次操作示例已执行' })
  }, 600)
}
</script>

<style scoped>
.demo-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.demo-section + .demo-section {
  margin-top: 24px;
}

.demo-section__label {
  color: var(--amu-color-text-secondary);
  font-size: 14px;
}

.button-group {
  display: inline-flex;
  flex-wrap: wrap;
}

.button-group :deep(.amu-button) {
  border-radius: 0;
  margin-left: -1px;
}

.button-group :deep(.amu-button:first-child) {
  margin-left: 0;
  border-top-left-radius: var(--amu-radius);
  border-bottom-left-radius: var(--amu-radius);
}

.button-group :deep(.amu-button:last-child) {
  border-top-right-radius: var(--amu-radius);
  border-bottom-right-radius: var(--amu-radius);
}

.button-group--soft {
  background: var(--amu-color-bg-fill);
  padding: 4px;
  border-radius: calc(var(--amu-radius) + 4px);
}

.button-group--soft :deep(.amu-button) {
  margin-left: 0;
  border-radius: var(--amu-radius);
}
</style>