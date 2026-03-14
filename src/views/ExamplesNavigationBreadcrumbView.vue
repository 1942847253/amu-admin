<template>
  <div class="page-container examples-navigation-breadcrumb-view">
    <AmuRow :gutter="16">
      <AmuCol :xs="24" :xl="15">
        <AmuCard class="page-card">
          <template #title>面包屑</template>

          <div class="breadcrumb-section">
            <div class="breadcrumb-section__label">基础层级</div>
            <AmuBreadcrumb>
              <AmuBreadcrumbItem>首页</AmuBreadcrumbItem>
              <AmuBreadcrumbItem>示例中心</AmuBreadcrumbItem>
              <AmuBreadcrumbItem>导航示例</AmuBreadcrumbItem>
              <AmuBreadcrumbItem>面包屑</AmuBreadcrumbItem>
            </AmuBreadcrumb>
          </div>

          <div class="breadcrumb-section">
            <div class="breadcrumb-section__label">带点击跳转意图</div>
            <AmuBreadcrumb separator=">">
              <AmuBreadcrumbItem>
                <span class="breadcrumb-link" @click="handleNavigate('工作台')">工作台</span>
              </AmuBreadcrumbItem>
              <AmuBreadcrumbItem>
                <span class="breadcrumb-link" @click="handleNavigate('示例')">示例</span>
              </AmuBreadcrumbItem>
              <AmuBreadcrumbItem>
                <span class="breadcrumb-link" @click="handleNavigate('导航示例')">导航示例</span>
              </AmuBreadcrumbItem>
              <AmuBreadcrumbItem>当前页面</AmuBreadcrumbItem>
            </AmuBreadcrumb>
          </div>
        </AmuCard>
      </AmuCol>

      <AmuCol :xs="24" :xl="9">
        <AmuCard class="page-card">
          <template #title>说明</template>
          <AmuDescriptions :column="1" border>
            <AmuDescriptionsItem label="推荐用途">展示当前位置，帮助用户在深层后台结构中建立方向感</AmuDescriptionsItem>
            <AmuDescriptionsItem label="层级建议">通常控制在 3 到 4 层，过深时要结合侧边菜单和页面标题一起优化</AmuDescriptionsItem>
            <AmuDescriptionsItem label="最近点击">{{ lastTarget }}</AmuDescriptionsItem>
          </AmuDescriptions>
        </AmuCard>
      </AmuCol>
    </AmuRow>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { AmuBreadcrumb, AmuBreadcrumbItem } from 'amu-ui/breadcrumb'
import { AmuCard } from 'amu-ui/card'
import { AmuCol } from 'amu-ui/col'
import { AmuDescriptions, AmuDescriptionsItem } from 'amu-ui/descriptions'
import { AmuRow } from 'amu-ui/row'

defineOptions({
  name: 'ExamplesNavigationBreadcrumbView'
})

const lastTarget = ref('尚未触发点击')

const handleNavigate = (target: string) => {
  lastTarget.value = `模拟跳转到 ${target}`
}
</script>

<style scoped>
.breadcrumb-section + .breadcrumb-section {
  margin-top: 24px;
}

.breadcrumb-section__label {
  margin-bottom: 12px;
  color: var(--amu-color-text-secondary);
  font-size: 14px;
}

.breadcrumb-link {
  cursor: pointer;
  color: var(--amu-color-primary);
}
</style>