<template>
  <div class="page-container">
    <AmuCard class="page-card">
      <template #title>动态表单</template>
      <AmuForm ref="formRef" :model="form" label-position="top" class="dynamic-form">
        <AmuFormItem
          v-for="(item, index) in form.items"
          :key="item.key"
          :label="`域名 ${index + 1}`"
          :prop="`items.${index}.value`"
          :rules="[{ required: true, message: '请输入域名', trigger: 'blur' }]"
        >
          <AmuRow :gutter="10">
            <AmuCol :span="20">
              <AmuInput v-model="item.value" placeholder="例如 admin.example.com" />
            </AmuCol>
            <AmuCol :span="4">
              <AmuButton style="width: 100%" @click.prevent="removeItem(item.key)">删除</AmuButton>
            </AmuCol>
          </AmuRow>
        </AmuFormItem>

        <AmuFormItem>
          <AmuSpace>
            <AmuButton type="primary" @click="submit">提交</AmuButton>
            <AmuButton @click="addItem">新增一项</AmuButton>
          </AmuSpace>
        </AmuFormItem>
      </AmuForm>
    </AmuCard>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { AmuButton } from 'amu-ui/button'
import { AmuCard } from 'amu-ui/card'
import { AmuForm, AmuFormItem } from 'amu-ui/form'
import { AmuInput } from 'amu-ui/input'
import { AmuMessage } from 'amu-ui/message'
import { AmuRow } from 'amu-ui/row'
import { AmuCol } from 'amu-ui/col'
import { AmuSpace } from 'amu-ui/space'
import type { FormInstance } from 'amu-ui'

defineOptions({ name: 'ExamplesFormDynamicView' })

const formRef = ref<FormInstance>()
const form = reactive({
  items: [
    { key: 1, value: 'admin.example.com' },
    { key: 2, value: '' }
  ]
})

const addItem = () => {
  form.items.push({ key: Date.now(), value: '' })
}

const removeItem = (key: number) => {
  form.items = form.items.filter((item) => item.key !== key)
}

const submit = async () => {
  try {
    await formRef.value?.validate()
    AmuMessage.success({ message: `动态表单提交成功，共 ${form.items.length} 项` })
  } catch {
    AmuMessage.error({ message: '请先补全动态表单内容' })
  }
}
</script>