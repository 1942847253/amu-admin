<template>
  <div class="page-container examples-loading-view">
    <AmuRow :gutter="16">
      <AmuCol :xs="24" :xl="14">
        <AmuCard class="page-card">
          <template #title>区域加载</template>

          <div class="loading-section">
            <div class="loading-section__label">局部遮罩</div>
            <AmuButton @click="togglePanelLoading">切换局部 Loading</AmuButton>
            <div
              v-loading="panelLoading"
              class="loading-panel"
              amu-loading-text="正在同步菜单与权限..."
              amu-loading-background="rgba(255,255,255,0.72)"
            >
              <div class="loading-panel__content">
                <div class="loading-panel__title">示例中心初始化任务</div>
                <div class="loading-panel__desc">适合表格容器、卡片区域、局部数据块刷新场景。</div>
              </div>
            </div>
          </div>

        </AmuCard>
      </AmuCol>

      <AmuCol :xs="24" :xl="10">
        <AmuCard class="page-card">
          <template #title>实践建议</template>
          <AmuDescriptions :column="1" border>
            <AmuDescriptionsItem label="按钮级">适合提交、保存、同步这类单动作反馈</AmuDescriptionsItem>
            <AmuDescriptionsItem label="区域级">适合列表刷新、详情块重载，不阻断整页操作</AmuDescriptionsItem>
            <AmuDescriptionsItem label="全屏级">只用于首屏初始化或关键长任务，避免滥用</AmuDescriptionsItem>
          </AmuDescriptions>
        </AmuCard>
      </AmuCol>
    </AmuRow>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { AmuCard } from 'amu-ui/card'
import { AmuDescriptions, AmuDescriptionsItem } from 'amu-ui/descriptions'
import { AmuButton } from 'amu-ui/button'
import { AmuLoadingDirective as vLoading } from 'amu-ui/loading'
import { AmuRow } from 'amu-ui/row'
import { AmuCol } from 'amu-ui/col'

defineOptions({
  name: 'ExamplesLoadingView'
})

const panelLoading = ref(true)

const togglePanelLoading = () => {
  panelLoading.value = !panelLoading.value
}
</script>

<style scoped>
.loading-section + .loading-section {
  margin-top: 24px;
}

.loading-section__label {
  margin-bottom: 12px;
  color: var(--amu-color-text-secondary);
  font-size: 14px;
}

.loading-panel {
  position: relative;
  min-height: 180px;
  margin-top: 12px;
  border: 1px solid var(--amu-color-border);
  border-radius: var(--amu-radius);
  background: var(--amu-color-bg-fill);
  overflow: hidden;
}

.loading-panel__content {
  padding: 24px;
}

.loading-panel__title {
  color: var(--amu-color-text-default);
  font-weight: 600;
  margin-bottom: 8px;
}

.loading-panel__desc {
  color: var(--amu-color-text-secondary);
  line-height: 1.7;
}
</style>