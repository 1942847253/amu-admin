<template>
  <div class="page-container">
    <AmuCard class="page-card">
      <template #title>查询表单</template>
      <AmuForm :model="filters" layout="horizontal" label-align="left" class="search-form">
        <AmuRow :gutter="[16, 16]">
          <AmuCol :xs="24" :md="12" :xl="6">
            <AmuFormItem label="关键词">
              <AmuInput v-model="filters.keyword" placeholder="请输入任务名或负责人" clearable />
            </AmuFormItem>
          </AmuCol>
          <AmuCol :xs="24" :md="12" :xl="6">
            <AmuFormItem label="状态">
              <AmuSelect v-model="filters.status" placeholder="请选择状态" clearable>
                <AmuOption label="全部" value="" />
                <AmuOption label="进行中" value="running" />
                <AmuOption label="已完成" value="done" />
                <AmuOption label="风险中" value="risk" />
              </AmuSelect>
            </AmuFormItem>
          </AmuCol>
          <AmuCol :xs="24" :md="12" :xl="6">
            <AmuFormItem label="环境">
              <AmuSelect v-model="filters.env" placeholder="请选择环境" clearable>
                <AmuOption label="预发" value="staging" />
                <AmuOption label="生产" value="prod" />
                <AmuOption label="测试" value="test" />
              </AmuSelect>
            </AmuFormItem>
          </AmuCol>
          <AmuCol :xs="24" :md="12" :xl="6">
            <AmuFormItem label="负责人">
              <AmuInput v-model="filters.owner" placeholder="请输入负责人" clearable />
            </AmuFormItem>
          </AmuCol>
        </AmuRow>
      </AmuForm>

      <div class="search-actions">
        <AmuSpace>
          <AmuButton @click="resetFilters">重置</AmuButton>
          <AmuButton type="primary" @click="search">查询</AmuButton>
        </AmuSpace>
      </div>

      <AmuDescriptions :column="1" border>
        <AmuDescriptionsItem label="当前关键词">{{ filters.keyword || '未填写' }}</AmuDescriptionsItem>
        <AmuDescriptionsItem label="当前状态">{{ statusLabel }}</AmuDescriptionsItem>
        <AmuDescriptionsItem label="当前环境">{{ envLabel }}</AmuDescriptionsItem>
        <AmuDescriptionsItem label="负责人">{{ filters.owner || '未填写' }}</AmuDescriptionsItem>
      </AmuDescriptions>
    </AmuCard>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { AmuButton } from 'amu-ui/button'
import { AmuCard } from 'amu-ui/card'
import { AmuDescriptions, AmuDescriptionsItem } from 'amu-ui/descriptions'
import { AmuForm, AmuFormItem } from 'amu-ui/form'
import { AmuInput } from 'amu-ui/input'
import { AmuMessage } from 'amu-ui/message'
import { AmuOption, AmuSelect } from 'amu-ui/select'
import { AmuRow } from 'amu-ui/row'
import { AmuCol } from 'amu-ui/col'
import { AmuSpace } from 'amu-ui/space'

defineOptions({ name: 'ExamplesFormSearchView' })

const createDefaultFilters = () => ({
  keyword: '',
  status: 'running',
  env: 'staging',
  owner: ''
})

const filters = reactive(createDefaultFilters())

const statusLabel = computed(() => ({ running: '进行中', done: '已完成', risk: '风险中', '': '全部' }[filters.status] || '全部'))
const envLabel = computed(() => ({ staging: '预发', prod: '生产', test: '测试', '': '全部' }[filters.env] || '全部'))

const resetFilters = () => {
  Object.assign(filters, createDefaultFilters())
}

const search = () => {
  AmuMessage.success({ message: '查询表单示例已执行，可替换为真实列表查询' })
}
</script>