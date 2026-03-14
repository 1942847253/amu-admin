<template>
  <div class="page-container">
    <AmuRow :gutter="16">
      <AmuCol :xs="24" :xl="16">
        <AmuCard class="page-card">
          <template #title>自定义布局</template>
          <AmuForm :model="form" label-position="top">
            <AmuRow :gutter="16">
              <AmuCol :xs="24" :md="8">
                <AmuFormItem label="姓">
                  <AmuInput v-model="form.firstName" />
                </AmuFormItem>
              </AmuCol>
              <AmuCol :xs="24" :md="8">
                <AmuFormItem label="中间名">
                  <AmuInput v-model="form.middleName" />
                </AmuFormItem>
              </AmuCol>
              <AmuCol :xs="24" :md="8">
                <AmuFormItem label="名">
                  <AmuInput v-model="form.lastName" />
                </AmuFormItem>
              </AmuCol>
            </AmuRow>

            <AmuRow :gutter="16">
              <AmuCol :xs="24" :md="16">
                <AmuFormItem label="详细地址">
                  <AmuInput v-model="form.address" />
                </AmuFormItem>
              </AmuCol>
              <AmuCol :xs="24" :md="8">
                <AmuFormItem label="城市">
                  <AmuInput v-model="form.city" />
                </AmuFormItem>
              </AmuCol>
            </AmuRow>

            <AmuFormItem label="补充说明">
              <AmuTextarea v-model="form.notes" :rows="5" />
            </AmuFormItem>
          </AmuForm>
        </AmuCard>
      </AmuCol>

      <AmuCol :xs="24" :xl="8">
        <AmuCard class="page-card">
          <template #title>布局说明</template>
          <AmuDescriptions :column="1" border>
            <AmuDescriptionsItem label="适用场景">长表单、主副信息并排展示</AmuDescriptionsItem>
            <AmuDescriptionsItem label="推荐方式">用 Row/Col 先分块，再在块内放 FormItem</AmuDescriptionsItem>
            <AmuDescriptionsItem label="当前城市">{{ form.city || '未填写' }}</AmuDescriptionsItem>
          </AmuDescriptions>
        </AmuCard>
      </AmuCol>
    </AmuRow>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { AmuCard } from 'amu-ui/card'
import { AmuDescriptions, AmuDescriptionsItem } from 'amu-ui/descriptions'
import { AmuForm, AmuFormItem } from 'amu-ui/form'
import { AmuInput } from 'amu-ui/input'
import { AmuRow } from 'amu-ui/row'
import { AmuCol } from 'amu-ui/col'
import { AmuTextarea } from 'amu-ui/textarea'

defineOptions({ name: 'ExamplesFormLayoutView' })

const form = reactive({
  firstName: 'Lin',
  middleName: '',
  lastName: 'Chuan',
  address: '上海市徐汇区漕河泾开发区 88 号',
  city: '上海',
  notes: '这一页用于演示后台模板中较长表单的栅格分布方式。'
})
</script>