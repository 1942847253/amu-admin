<template>
  <div class="not-found">
    <AmuEmpty description="页面不存在" />
    <AmuButton type="primary" @click="router.replace('/dashboard')">返回首页</AmuButton>
  </div>
</template>

<script setup lang="ts">
import { AmuButton } from 'amu-ui/button'
import { AmuEmpty } from 'amu-ui/empty'
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<style scoped>
.not-found {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
}
</style>
