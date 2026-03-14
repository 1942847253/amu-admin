<template>
  <div class="page-container examples-form-view">
    <AmuRow :gutter="16" class="examples-form-view__main">
      <AmuCol :xs="24" :xl="15">
        <AmuCard class="page-card examples-form-view__card">
          <template #title>基础表单</template>
          <template #extra>
            <AmuTag type="primary">用于演示最基础的录入表单</AmuTag>
          </template>

          <AmuForm :model="form" label-position="top" class="demo-form">
            <AmuRow :gutter="16">
              <AmuCol :xs="24" :md="12">
                <AmuFormItem label="项目名称">
                  <AmuInput v-model="form.name" placeholder="请输入项目名称" clearable />
                </AmuFormItem>
              </AmuCol>
              <AmuCol :xs="24" :md="12">
                <AmuFormItem label="负责人">
                  <AmuInput v-model="form.owner" placeholder="请输入负责人姓名" clearable />
                </AmuFormItem>
              </AmuCol>
              <AmuCol :xs="24" :md="12">
                <AmuFormItem label="业务线">
                  <AmuSelect v-model="form.business" placeholder="请选择业务线" clearable>
                    <AmuOption label="平台中台" value="platform" />
                    <AmuOption label="商家运营" value="operations" />
                    <AmuOption label="安全合规" value="security" />
                  </AmuSelect>
                </AmuFormItem>
              </AmuCol>
              <AmuCol :xs="24" :md="12">
                <AmuFormItem label="交付优先级">
                  <AmuSelect v-model="form.priority" placeholder="请选择优先级">
                    <AmuOption label="高" value="high" />
                    <AmuOption label="中" value="medium" />
                    <AmuOption label="低" value="low" />
                  </AmuSelect>
                </AmuFormItem>
              </AmuCol>
              <AmuCol :xs="24">
                <AmuFormItem label="参与成员">
                  <AmuCheckboxGroup v-model="form.members" :options="memberOptions" />
                </AmuFormItem>
              </AmuCol>
              <AmuCol :xs="24">
                <AmuFormItem label="交付说明">
                  <AmuTextarea
                    v-model="form.description"
                    :rows="5"
                    placeholder="请输入当前需求背景、验收范围与交付说明"
                  />
                </AmuFormItem>
              </AmuCol>
              <AmuCol :xs="24" :md="12">
                <AmuFormItem label="是否开启灰度发布">
                  <div class="demo-form__switch-row">
                    <AmuSwitch v-model="form.grayRelease" />
                    <span>{{ form.grayRelease ? '已开启' : '未开启' }}</span>
                  </div>
                </AmuFormItem>
              </AmuCol>
              <AmuCol :xs="24" :md="12">
                <AmuFormItem label="是否需要审批">
                  <div class="demo-form__switch-row">
                    <AmuSwitch v-model="form.needApproval" />
                    <span>{{ form.needApproval ? '需要审批' : '无需审批' }}</span>
                  </div>
                </AmuFormItem>
              </AmuCol>
            </AmuRow>
          </AmuForm>

          <div class="demo-form__actions">
            <AmuSpace>
              <AmuButton @click="resetForm">重置</AmuButton>
              <AmuButton type="primary" @click="submitForm">提交示例</AmuButton>
            </AmuSpace>
          </div>
        </AmuCard>
      </AmuCol>

      <AmuCol :xs="24" :xl="9">
        <AmuCard class="page-card examples-form-view__card examples-form-view__side-card">
          <template #title>填写概览</template>

          <div class="progress-block">
            <div class="progress-block__header">
              <span>完成度</span>
              <strong>{{ completion }}%</strong>
            </div>
            <AmuProgress :percentage="completion" :stroke-width="10" />
          </div>

          <AmuDescriptions :column="1" border>
            <AmuDescriptionsItem label="项目名称">{{ form.name || '未填写' }}</AmuDescriptionsItem>
            <AmuDescriptionsItem label="负责人">{{ form.owner || '未填写' }}</AmuDescriptionsItem>
            <AmuDescriptionsItem label="业务线">{{ businessLabel || '未选择' }}</AmuDescriptionsItem>
            <AmuDescriptionsItem label="优先级">
              <AmuTag :type="priorityTag.type">{{ priorityTag.label }}</AmuTag>
            </AmuDescriptionsItem>
            <AmuDescriptionsItem label="参与成员">
              <AmuSpace wrap>
                <AmuTag v-for="member in selectedMemberLabels" :key="member">{{ member }}</AmuTag>
                <span v-if="selectedMemberLabels.length === 0">未选择</span>
              </AmuSpace>
            </AmuDescriptionsItem>
            <AmuDescriptionsItem label="灰度发布">
              <AmuTag :type="form.grayRelease ? 'success' : 'warning'">
                {{ form.grayRelease ? '已开启' : '未开启' }}
              </AmuTag>
            </AmuDescriptionsItem>
            <AmuDescriptionsItem label="审批流程">
              <AmuTag :type="form.needApproval ? 'warning' : 'success'">
                {{ form.needApproval ? '需要审批' : '无需审批' }}
              </AmuTag>
            </AmuDescriptionsItem>
          </AmuDescriptions>
        </AmuCard>
      </AmuCol>
    </AmuRow>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { AmuButton } from 'amu-ui/button'
import { AmuCard } from 'amu-ui/card'
import { AmuCheckboxGroup } from 'amu-ui/checkbox'
import { AmuDescriptions, AmuDescriptionsItem } from 'amu-ui/descriptions'
import { AmuForm, AmuFormItem } from 'amu-ui/form'
import { AmuInput } from 'amu-ui/input'
import { AmuMessage } from 'amu-ui/message'
import { AmuOption, AmuSelect } from 'amu-ui/select'
import { AmuProgress } from 'amu-ui/progress'
import { AmuRow } from 'amu-ui/row'
import { AmuCol } from 'amu-ui/col'
import { AmuSpace } from 'amu-ui/space'
import { AmuSwitch } from 'amu-ui/switch'
import { AmuTag } from 'amu-ui/tag'
import { AmuTextarea } from 'amu-ui/textarea'

defineOptions({
  name: 'ExamplesFormView'
})

const memberOptions = [
  { label: '产品', value: 'product' },
  { label: '前端', value: 'frontend' },
  { label: '后端', value: 'backend' },
  { label: '测试', value: 'qa' }
]

const createDefaultForm = () => ({
  name: '统一发布台改版',
  owner: '林川',
  business: 'platform',
  priority: 'high',
  members: ['product', 'frontend'],
  description: '整合多业务线发布入口，统一审批、回滚和灰度流程。',
  grayRelease: true,
  needApproval: true
})

const form = reactive(createDefaultForm())

const completion = computed(() => {
  const checks = [
    Boolean(form.name.trim()),
    Boolean(form.owner.trim()),
    Boolean(form.business),
    Boolean(form.priority),
    form.members.length > 0,
    Boolean(form.description.trim())
  ]
  const passed = checks.filter(Boolean).length
  return Math.round((passed / checks.length) * 100)
})

const businessLabel = computed(() => {
  const item = [
    { label: '平台中台', value: 'platform' },
    { label: '商家运营', value: 'operations' },
    { label: '安全合规', value: 'security' }
  ].find((option) => option.value === form.business)
  return item?.label || ''
})

const priorityTag = computed(() => {
  const map = {
    high: { label: '高优先级', type: 'danger' as const },
    medium: { label: '中优先级', type: 'warning' as const },
    low: { label: '低优先级', type: 'success' as const }
  }
  return map[form.priority as keyof typeof map] || { label: '未选择', type: 'info' as const }
})

const selectedMemberLabels = computed(() => {
  return memberOptions
    .filter((item) => form.members.includes(item.value))
    .map((item) => item.label)
})

const resetForm = () => {
  Object.assign(form, createDefaultForm())
}

const submitForm = () => {
  AmuMessage.success({ message: '表单示例已提交，可按业务改接真实接口' })
}
</script>

<style scoped>
.examples-form-view__main {
  flex: 1;
  min-height: 0;
}

.examples-form-view__card {
  min-height: 0;
}

.demo-form {
  flex: 1;
}

.demo-form__switch-row {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 32px;
  color: var(--amu-color-text-secondary);
}

.demo-form__actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 8px;
}

.examples-form-view__side-card {
  gap: 16px;
}

.progress-block {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.progress-block__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--amu-color-text-default);
}
</style>