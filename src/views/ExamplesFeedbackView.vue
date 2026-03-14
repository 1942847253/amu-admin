<template>
  <div class="page-container examples-feedback-view">
    <AmuCard class="page-card examples-feedback-view__card">
      <template #title>对话框</template>

      <AmuSpace wrap>
        <AmuButton type="primary" @click="dialogVisible = true">打开确认弹窗</AmuButton>
        <AmuButton @click="draggableDialogVisible = true">打开可拖拽弹窗</AmuButton>
        <AmuButton type="primary" @click="drawerVisible = true">打开审批抽屉</AmuButton>
      </AmuSpace>

      <div class="examples-feedback-view__tips">
        <AmuDescriptions :column="1" border>
          <AmuDescriptionsItem label="适用场景">二次确认、简短信息补录、审批操作</AmuDescriptionsItem>
          <AmuDescriptionsItem label="当前建议">复杂编辑优先抽屉，强确认优先弹窗</AmuDescriptionsItem>
          <AmuDescriptionsItem label="演示重点">常规弹窗、可拖拽弹窗、带底部操作区的内容布局</AmuDescriptionsItem>
        </AmuDescriptions>
      </div>
    </AmuCard>

    <AmuDialog v-model="dialogVisible" title="确认发布配置" width="560px" type="custom">
      <AmuDescriptions :column="1" border>
        <AmuDescriptionsItem label="发布环境">生产环境</AmuDescriptionsItem>
        <AmuDescriptionsItem label="风险等级">
          <AmuTag type="danger">高风险</AmuTag>
        </AmuDescriptionsItem>
        <AmuDescriptionsItem label="变更说明">当前示例用于展示后台模板中的确认型弹窗布局。</AmuDescriptionsItem>
      </AmuDescriptions>

      <template #footer>
        <AmuSpace>
          <AmuButton @click="dialogVisible = false">取消</AmuButton>
          <AmuButton type="primary" :loading="confirmLoading" @click="confirmDialog">确认发布</AmuButton>
        </AmuSpace>
      </template>
    </AmuDialog>

    <AmuDialog
      v-model="draggableDialogVisible"
      draggable
      title="可拖拽弹窗"
      description="你可以拖动标题区域，适合临时对比信息或查看短内容。"
      width="520px"
    />

    <AmuDrawer
      v-model="drawerVisible"
      title="审批备注"
      placement="right"
      size="560px"
      :before-close="handleDrawerBeforeClose"
      body-scrollable
    >
      <div class="examples-feedback-view__drawer-body">
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
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { AmuButton } from 'amu-ui/button'
import { AmuCard } from 'amu-ui/card'
import { AmuDescriptions, AmuDescriptionsItem } from 'amu-ui/descriptions'
import { AmuDialog } from 'amu-ui/dialog'
import { AmuDrawer } from 'amu-ui/drawer'
import { AmuMessage } from 'amu-ui/message'
import { AmuOption, AmuSelect } from 'amu-ui/select'
import { AmuSpace } from 'amu-ui/space'
import { AmuTag } from 'amu-ui/tag'
import { AmuTextarea } from 'amu-ui/textarea'

defineOptions({
  name: 'ExamplesFeedbackView'
})

const dialogVisible = ref(false)
const draggableDialogVisible = ref(false)
const drawerVisible = ref(false)
const confirmLoading = ref(false)
const review = reactive({
  result: 'approved',
  comment: '已完成发布检查，可按计划推进。'
})

const confirmDialog = () => {
  confirmLoading.value = true
  window.setTimeout(() => {
    confirmLoading.value = false
    dialogVisible.value = false
    AmuMessage.success({ message: '确认弹窗示例已完成异步提交' })
  }, 600)
}

const submitReview = () => {
  drawerVisible.value = false
  AmuMessage.success({ message: '抽屉示例已提交，可替换为真实审批接口' })
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
.examples-feedback-view__card {
  gap: 16px;
}

.examples-feedback-view__tips {
  margin-top: 16px;
}

.examples-feedback-view__drawer-body {
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