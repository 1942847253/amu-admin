<template>
  <div class="page-container examples-loading-fullscreen-view">
    <AmuRow :gutter="16">
      <AmuCol :xs="24" :xl="14">
        <AmuCard class="page-card">
          <template #title>全屏加载</template>

          <AmuSpace wrap>
            <AmuButton type="primary" @click="openFullscreenLoading">打开全屏 Loading 2 秒</AmuButton>
            <AmuButton @click="openLockedLoading">打开锁屏 Loading 3 秒</AmuButton>
          </AmuSpace>

          <div class="fullscreen-note">
            <div class="fullscreen-note__title">适用场景</div>
            <div class="fullscreen-note__desc">首屏初始化、大型导入导出、必须阻断交互的关键流程。</div>
          </div>
        </AmuCard>
      </AmuCol>

      <AmuCol :xs="24" :xl="10">
        <AmuCard class="page-card">
          <template #title>实践建议</template>
          <AmuDescriptions :column="1" border>
            <AmuDescriptionsItem label="慎用原则">只有在用户无法进行其他有效操作时，才使用全屏遮罩</AmuDescriptionsItem>
            <AmuDescriptionsItem label="文案要求">建议明确说明当前正在执行什么，而不是只显示 Loading</AmuDescriptionsItem>
            <AmuDescriptionsItem label="失败兜底">真实业务里应配合超时提示和失败恢复方案</AmuDescriptionsItem>
          </AmuDescriptions>
        </AmuCard>
      </AmuCol>
    </AmuRow>
  </div>
</template>

<script setup lang="ts">
import { AmuButton } from 'amu-ui/button'
import { AmuCard } from 'amu-ui/card'
import { AmuCol } from 'amu-ui/col'
import { AmuDescriptions, AmuDescriptionsItem } from 'amu-ui/descriptions'
import { AmuLoadingService } from 'amu-ui/loading'
import { AmuRow } from 'amu-ui/row'
import { AmuSpace } from 'amu-ui/space'

defineOptions({
  name: 'ExamplesLoadingFullscreenView'
})

const openFullscreenLoading = () => {
  const loading = AmuLoadingService({
    lock: true,
    text: '正在构建后台模板示例资源...'
  })
  window.setTimeout(() => {
    loading.close()
  }, 2000)
}

const openLockedLoading = () => {
  const loading = AmuLoadingService({
    lock: true,
    text: '正在同步租户权限快照，请稍候...'
  })
  window.setTimeout(() => {
    loading.close()
  }, 3000)
}
</script>

<style scoped>
.fullscreen-note {
  margin-top: 24px;
  padding: 16px;
  border: 1px solid var(--amu-color-border);
  border-radius: var(--amu-radius);
  background: var(--amu-color-bg-fill);
}

.fullscreen-note__title {
  margin-bottom: 8px;
  color: var(--amu-color-text-default);
  font-weight: 600;
}

.fullscreen-note__desc {
  color: var(--amu-color-text-secondary);
}
</style>