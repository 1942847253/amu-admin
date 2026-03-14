<template>
  <div class="page-container examples-loading-button-view">
    <AmuRow :gutter="16">
      <AmuCol :xs="24" :xl="15">
        <AmuCard class="page-card">
          <template #title>按钮加载</template>

          <div class="loading-block">
            <div class="loading-block__label">提交类按钮</div>
            <AmuSpace wrap>
              <AmuButton type="primary" :loading="saveLoading" @click="startLoading('save')">保存配置</AmuButton>
              <AmuButton :loading="syncLoading" @click="startLoading('sync')">同步数据</AmuButton>
              <AmuButton type="text" :loading="refreshLoading" @click="startLoading('refresh')">刷新列表</AmuButton>
            </AmuSpace>
          </div>

          <div class="loading-block">
            <div class="loading-block__label">风险操作</div>
            <AmuSpace wrap>
              <AmuButton status="danger" :loading="dangerLoading" @click="startLoading('danger')">中止任务</AmuButton>
            </AmuSpace>
          </div>
        </AmuCard>
      </AmuCol>

      <AmuCol :xs="24" :xl="9">
        <AmuCard class="page-card">
          <template #title>使用建议</template>
          <AmuDescriptions :column="1" border>
            <AmuDescriptionsItem label="推荐场景">提交、同步、刷新等单按钮异步操作</AmuDescriptionsItem>
            <AmuDescriptionsItem label="交互建议">只给触发动作的按钮加 loading，避免整块区域同时失焦</AmuDescriptionsItem>
            <AmuDescriptionsItem label="时长提示">超过 3 秒建议配合文案或消息提示当前进度</AmuDescriptionsItem>
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

defineOptions({
  name: 'ExamplesLoadingButtonView'
})

const saveLoading = ref(false)
const syncLoading = ref(false)
const refreshLoading = ref(false)
const dangerLoading = ref(false)

const startLoading = (type: 'save' | 'sync' | 'refresh' | 'danger') => {
  const targetMap = {
    save: saveLoading,
    sync: syncLoading,
    refresh: refreshLoading,
    danger: dangerLoading
  }
  const target = targetMap[type]
  if (target.value) return
  target.value = true
  window.setTimeout(() => {
    target.value = false
  }, 900)
}
</script>

<style scoped>
.loading-block + .loading-block {
  margin-top: 24px;
}

.loading-block__label {
  margin-bottom: 12px;
  color: var(--amu-color-text-secondary);
  font-size: 14px;
}
</style>