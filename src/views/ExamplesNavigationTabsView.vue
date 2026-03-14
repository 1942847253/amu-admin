<template>
  <div class="page-container examples-navigation-tabs-view">
    <AmuRow :gutter="16">
      <AmuCol :xs="24" :xl="15">
        <AmuCard class="page-card">
          <template #title>标签页</template>

          <AmuTabs v-model="activeTab" type="card">
            <AmuTabPane name="overview" title="概览">
              <div class="tab-panel">适合放页面总览、摘要信息和全局状态。</div>
            </AmuTabPane>
            <AmuTabPane name="config" title="配置项">
              <div class="tab-panel">适合承载多块配置表单，避免单页过长。</div>
            </AmuTabPane>
            <AmuTabPane name="history" title="变更记录">
              <div class="tab-panel">适合查看日志、时间线、审计记录等信息。</div>
            </AmuTabPane>
          </AmuTabs>

          <div class="tabs-footer">
            当前激活标签：{{ activeLabel }}
          </div>
        </AmuCard>
      </AmuCol>

      <AmuCol :xs="24" :xl="9">
        <AmuCard class="page-card">
          <template #title>使用建议</template>
          <AmuDescriptions :column="1" border>
            <AmuDescriptionsItem label="推荐场景">同一对象的多个维度信息，比如概览、配置、日志、权限</AmuDescriptionsItem>
            <AmuDescriptionsItem label="体验重点">页签标题要简短明确，避免和左侧导航职责重叠</AmuDescriptionsItem>
            <AmuDescriptionsItem label="当前页签">{{ activeLabel }}</AmuDescriptionsItem>
          </AmuDescriptions>
        </AmuCard>
      </AmuCol>
    </AmuRow>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { AmuCard } from 'amu-ui/card'
import { AmuCol } from 'amu-ui/col'
import { AmuDescriptions, AmuDescriptionsItem } from 'amu-ui/descriptions'
import { AmuRow } from 'amu-ui/row'
import { AmuTabs, AmuTabPane } from 'amu-ui/tabs'

defineOptions({
  name: 'ExamplesNavigationTabsView'
})

const activeTab = ref('overview')

const activeLabel = computed(() => {
  const map = {
    overview: '概览',
    config: '配置项',
    history: '变更记录'
  }
  return map[activeTab.value as keyof typeof map]
})
</script>

<style scoped>
.tab-panel {
  padding: 16px 0;
  color: var(--amu-color-text-secondary);
  line-height: 1.7;
}

.tabs-footer {
  margin-top: 12px;
  color: var(--amu-color-text-default);
  font-weight: 600;
}
</style>