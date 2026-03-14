<template>
  <div class="page-container examples-feedback-drawer-view">
    <AmuCard class="page-card">
      <template #title>抽屉</template>

      <AmuSpace wrap>
        <AmuButton type="primary" @click="drawerVisible = true">打开审批抽屉</AmuButton>
        <AmuButton @click="readonlyVisible = true">打开只读抽屉</AmuButton>
      </AmuSpace>

      <div class="examples-feedback-drawer-view__tips">
        <AmuDescriptions :column="1" border>
          <AmuDescriptionsItem label="适用场景">详情预览、轻量编辑、审批补录，不打断当前页面上下文</AmuDescriptionsItem>
          <AmuDescriptionsItem label="推荐方式">复杂编辑优先抽屉，用户仍能保留列表和筛选上下文</AmuDescriptionsItem>
          <AmuDescriptionsItem label="当前备注">{{ review.comment }}</AmuDescriptionsItem>
        </AmuDescriptions>
      </div>
    </AmuCard>

    <AmuDrawer
      v-model="drawerVisible"
      title="审批备注"
      placement="right"
      size="560px"
      :before-close="handleDrawerBeforeClose"
      body-scrollable
    >
      <div class="drawer-body">
        <div class="drawer-field">
          <label class="drawer-field__label">审批结论</label>
          <AmuSelect v-model="review.result" placeholder="请选择审批结论">
            <AmuOption label="通过" value="approved" />
            <AmuOption label="驳回" value="rejected" />
            <AmuOption label="继续观察" value="watching" />
          </AmuSelect>
        </div>
        <div class="drawer-field">
          <label class="drawer-field__label">审批备注</label>
          <AmuTextarea v-model="review.comment" :rows="6" placeholder="请输入审批意见" />
        </div>
      </div>

      <template #footer>
        <AmuSpace>
          <AmuButton @click="drawerVisible = false">取消</AmuButton>
          <AmuButton type="primary" @click="submitReview">提交审批</AmuButton>
        </AmuSpace>
      </template>
    </AmuDrawer>

    <AmuDrawer v-model="readonlyVisible" title="发布详情" placement="right" size="480px">
      <AmuDescriptions :column="1" border>
        <AmuDescriptionsItem label="变更单号">CHG-20260308-018</AmuDescriptionsItem>
        <AmuDescriptionsItem label="负责人">林川</AmuDescriptionsItem>
        <AmuDescriptionsItem label="影响范围">菜单权限缓存、管理端导航树</AmuDescriptionsItem>
      </AmuDescriptions>
    </AmuDrawer>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { AmuButton } from 'amu-ui/button'
import { AmuCard } from 'amu-ui/card'
import { AmuDescriptions, AmuDescriptionsItem } from 'amu-ui/descriptions'
import { AmuDrawer } from 'amu-ui/drawer'
import { AmuMessage } from 'amu-ui/message'
import { AmuOption, AmuSelect } from 'amu-ui/select'
import { AmuSpace } from 'amu-ui/space'
import { AmuTextarea } from 'amu-ui/textarea'

defineOptions({
  name: 'ExamplesFeedbackDrawerView'
})

const drawerVisible = ref(false)
const readonlyVisible = ref(false)
const review = reactive({
  result: 'approved',
  comment: '已完成发布检查，可按计划推进。'
})

const submitReview = () => {
  drawerVisible.value = false
  AmuMessage.success({ message: '抽屉示例已提交，可替换为真实接口' })
}

const handleDrawerBeforeClose = () => {
  if (!review.comment.trim()) {
    AmuMessage.warning({ message: '请先填写审批备注' })
    return Promise.resolve(false)
  }
  return Promise.resolve(true)
}
</script>

<style scoped>
.examples-feedback-drawer-view__tips {
  margin-top: 16px;
}

.drawer-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.drawer-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.drawer-field__label {
  color: var(--amu-color-text-secondary);
  font-size: 14px;
}
</style>