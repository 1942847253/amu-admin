<template>
  <div class="page-container examples-buttons-state-view">
    <AmuRow :gutter="16">
      <AmuCol :xs="24" :xl="15">
        <AmuCard class="page-card">
          <template #title>按钮状态</template>

          <div class="state-section">
            <div class="state-section__label">加载状态</div>
            <AmuSpace wrap>
              <AmuButton type="primary" :loading="primaryLoading" @click="startPrimaryLoading">提交审批</AmuButton>
              <AmuButton :loading="secondaryLoading" @click="startSecondaryLoading">同步缓存</AmuButton>
              <AmuButton type="text" :loading="textLoading" @click="startTextLoading">刷新列表</AmuButton>
            </AmuSpace>
          </div>

          <div class="state-section">
            <div class="state-section__label">禁用状态</div>
            <AmuSpace wrap>
              <AmuButton type="primary" disabled>主操作禁用</AmuButton>
              <AmuButton disabled>默认按钮禁用</AmuButton>
              <AmuButton type="outline" status="success" disabled>成功态禁用</AmuButton>
              <AmuButton type="text" status="danger" disabled>危险文字禁用</AmuButton>
            </AmuSpace>
          </div>

          <div class="state-section">
            <div class="state-section__label">状态联动示例</div>
            <div class="state-panel">
              <div class="state-panel__summary">当前发布流状态：{{ publishStateLabel }}</div>
              <AmuSpace wrap>
                <AmuButton :type="publishState === 'draft' ? 'primary' : 'default'" @click="publishState = 'draft'">草稿</AmuButton>
                <AmuButton :type="publishState === 'review' ? 'primary' : 'default'" @click="publishState = 'review'">待审核</AmuButton>
                <AmuButton :type="publishState === 'online' ? 'primary' : 'default'" status="success" @click="publishState = 'online'">已上线</AmuButton>
                <AmuButton :type="publishState === 'blocked' ? 'primary' : 'default'" status="danger" @click="publishState = 'blocked'">已阻断</AmuButton>
              </AmuSpace>
            </div>
          </div>
        </AmuCard>
      </AmuCol>

      <AmuCol :xs="24" :xl="9">
        <AmuCard class="page-card">
          <template #title>实践建议</template>
          <AmuDescriptions :column="1" border>
            <AmuDescriptionsItem label="Loading">只给正在执行的按钮加 loading，不要整排一起转</AmuDescriptionsItem>
            <AmuDescriptionsItem label="禁用态">如果禁用有前置条件，最好搭配旁路说明或表单错误提示</AmuDescriptionsItem>
            <AmuDescriptionsItem label="状态色">危险和成功色都应有明确业务语义，不要只为装饰使用</AmuDescriptionsItem>
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
import { AmuCol } from 'amu-ui/col'
import { AmuDescriptions, AmuDescriptionsItem } from 'amu-ui/descriptions'
import { AmuRow } from 'amu-ui/row'
import { AmuSpace } from 'amu-ui/space'

defineOptions({
  name: 'ExamplesButtonsStateView'
})

const primaryLoading = ref(false)
const secondaryLoading = ref(false)
const textLoading = ref(false)
const publishState = ref<'draft' | 'review' | 'online' | 'blocked'>('review')

const publishStateLabel = computed(() => {
  const map = {
    draft: '草稿待完善',
    review: '待审核',
    online: '已上线',
    blocked: '已阻断'
  }
  return map[publishState.value]
})

const startPrimaryLoading = () => {
  if (primaryLoading.value) return
  primaryLoading.value = true
  window.setTimeout(() => {
    primaryLoading.value = false
  }, 900)
}

const startSecondaryLoading = () => {
  if (secondaryLoading.value) return
  secondaryLoading.value = true
  window.setTimeout(() => {
    secondaryLoading.value = false
  }, 700)
}

const startTextLoading = () => {
  if (textLoading.value) return
  textLoading.value = true
  window.setTimeout(() => {
    textLoading.value = false
  }, 500)
}
</script>

<style scoped>
.state-section + .state-section {
  margin-top: 24px;
}

.state-section__label {
  margin-bottom: 12px;
  color: var(--amu-color-text-secondary);
  font-size: 14px;
}

.state-panel {
  padding: 16px;
  border: 1px solid var(--amu-color-border);
  border-radius: var(--amu-radius);
  background: var(--amu-color-bg-fill);
}

.state-panel__summary {
  margin-bottom: 12px;
  color: var(--amu-color-text-default);
  font-weight: 600;
}
</style>