<template>
  <div class="forbidden-page">
    <AmuEmpty description="你没有访问该页面的权限" />
    <div class="forbidden-page__actions">
      <AmuButton @click="router.back()">返回上一页</AmuButton>
      <AmuButton type="primary" @click="router.replace('/dashboard')">回到首页</AmuButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AmuButton } from 'amu-ui/button'
import { AmuEmpty } from 'amu-ui/empty'
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<style scoped>
.forbidden-page {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.forbidden-page__actions {
  display: flex;
  gap: 16px;
}
</style>
