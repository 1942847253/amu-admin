<template>
  <div class="page-container">
    <AmuCard class="page-card">
      <template #title>表单校验</template>
      <AmuForm ref="formRef" :model="form" :rules="rules" label-position="top" class="validation-form" @submit.prevent>
        <AmuFormItem prop="name" label="用户名">
          <AmuInput v-model="form.name" placeholder="请输入用户名" />
        </AmuFormItem>
        <AmuFormItem prop="password" label="密码">
          <AmuInput v-model="form.password" type="password" placeholder="请输入密码" show-password />
        </AmuFormItem>
        <AmuFormItem prop="confirmPassword" label="确认密码">
          <AmuInput v-model="form.confirmPassword" type="password" placeholder="请再次输入密码" show-password />
        </AmuFormItem>
        <AmuFormItem prop="agreed">
          <AmuCheckbox v-model="form.agreed">我已阅读并同意发布规范</AmuCheckbox>
        </AmuFormItem>
        <AmuFormItem>
          <AmuSpace>
            <AmuButton type="primary" @click="submit">校验并提交</AmuButton>
            <AmuButton @click="reset">重置</AmuButton>
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
import { AmuCheckbox } from 'amu-ui/checkbox'
import { AmuForm, AmuFormItem } from 'amu-ui/form'
import { AmuInput } from 'amu-ui/input'
import { AmuMessage } from 'amu-ui/message'
import { AmuSpace } from 'amu-ui/space'
import type { FormInstance, FormRules } from 'amu-ui'

defineOptions({ name: 'ExamplesFormValidationView' })

const formRef = ref<FormInstance>()
const form = reactive({
  name: '',
  password: '',
  confirmPassword: '',
  agreed: false
})

const rules: FormRules = {
  name: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 16, message: '长度需为 3 到 16 位', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ],
  confirmPassword: [
    {
      validator: (_rule, value, callback) => {
        if (!value) {
          callback(new Error('请再次输入密码'))
          return
        }
        if (value !== form.password) {
          callback(new Error('两次输入的密码不一致'))
          return
        }
        callback()
      },
      trigger: 'blur'
    }
  ],
  agreed: [
    {
      validator: (_rule, value, callback) => {
        if (!value) {
          callback(new Error('请先勾选规范确认'))
          return
        }
        callback()
      },
      trigger: 'change'
    }
  ]
}

const submit = async () => {
  try {
    await formRef.value?.validate()
    AmuMessage.success({ message: '表单校验通过' })
  } catch {
    AmuMessage.error({ message: '表单校验未通过' })
  }
}

const reset = () => {
  formRef.value?.resetFields()
}
</script>