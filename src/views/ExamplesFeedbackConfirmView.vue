<template>
  <div class="page-container examples-feedback-confirm-view">
    <AmuRow :gutter="16">
      <AmuCol :xs="24" :xl="15">
        <AmuCard class="page-card">
          <template #title>二次确认</template>

          <AmuSpace wrap>
            <AmuPopconfirm title="确认立即删除该应用配置？" @confirm="handleConfirmDelete">
              <template #reference>
                <AmuButton status="danger">删除配置</AmuButton>
              </template>
            </AmuPopconfirm>

            <AmuPopconfirm
              title="确认发布生产环境变更？"
              content="该操作会触发全量生效，请先完成巡检。"
              :on-before-confirm="handleBeforePublish"
              @confirm="handleConfirmPublish"
            >
              <template #reference>
                <AmuButton type="primary">发布变更</AmuButton>
              </template>
            </AmuPopconfirm>
          </AmuSpace>

          <div class="confirm-log">
            <div class="confirm-log__title">最近一次动作</div>
            <div class="confirm-log__content">{{ latestAction }}</div>
          </div>
        </AmuCard>
      </AmuCol>

      <AmuCol :xs="24" :xl="9">
        <AmuCard class="page-card">
          <template #title>使用建议</template>
          <AmuDescriptions :column="1" border>
            <AmuDescriptionsItem label="适用场景">删除、重置、发布、切换高风险状态这类不可逆操作</AmuDescriptionsItem>
            <AmuDescriptionsItem label="异步确认">可以在确认前接入巡检、校验、权限检查等异步逻辑</AmuDescriptionsItem>
            <AmuDescriptionsItem label="文案重点">标题直接说结果，描述再补充影响范围和风险提示</AmuDescriptionsItem>
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
import { AmuMessage } from 'amu-ui/message'
import { AmuPopconfirm } from 'amu-ui/popconfirm'
import { AmuRow } from 'amu-ui/row'
import { AmuSpace } from 'amu-ui/space'

defineOptions({
  name: 'ExamplesFeedbackConfirmView'
})

const latestAction = ref('尚未触发确认操作')

const handleConfirmDelete = () => {
  latestAction.value = '已确认删除应用配置'
  AmuMessage.success({ message: '删除确认示例已执行' })
}

const handleBeforePublish = async () => {
  return new Promise<boolean>((resolve) => {
    window.setTimeout(() => {
      resolve(true)
    }, 600)
  })
}

const handleConfirmPublish = () => {
  latestAction.value = '已确认发布生产环境变更'
  AmuMessage.success({ message: '发布确认示例已执行' })
}
</script>

<style scoped>
.confirm-log {
  margin-top: 24px;
  padding: 16px;
  border: 1px solid var(--amu-color-border);
  border-radius: var(--amu-radius);
  background: var(--amu-color-bg-fill);
}

.confirm-log__title {
  margin-bottom: 8px;
  color: var(--amu-color-text-secondary);
}

.confirm-log__content {
  color: var(--amu-color-text-default);
  font-weight: 600;
}
</style>