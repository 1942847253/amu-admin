<template>
  <div class="page-container">
    <AmuCard class="page-card">
      <template #title>鉴权链路自测</template>
      <template #extra>
        <AmuTag type="warning">仅建议开发环境使用</AmuTag>
      </template>

      <AmuSpace direction="vertical" size="large" style="width: 100%">
        <AmuDescriptions :column="1" border>
          <AmuDescriptionsItem label="当前用户">{{ authStore.user?.username || '-' }}</AmuDescriptionsItem>
          <AmuDescriptionsItem label="当前角色">{{ authStore.user?.role || '-' }}</AmuDescriptionsItem>
          <AmuDescriptionsItem label="accessToken">{{ authStore.token || '-' }}</AmuDescriptionsItem>
          <AmuDescriptionsItem label="refreshToken">{{ authStore.refreshTokenValue || '-' }}</AmuDescriptionsItem>
          <AmuDescriptionsItem label="access 剩余秒数">{{ accessRemainSeconds }}</AmuDescriptionsItem>
          <AmuDescriptionsItem label="当前权限数">{{ authStore.permissions.length }}</AmuDescriptionsItem>
          <AmuDescriptionsItem label="菜单节点数">{{ authStore.menus.length }}</AmuDescriptionsItem>
        </AmuDescriptions>

        <AmuSpace wrap>
          <AmuButton :type="httpDebugEnabled ? 'primary' : 'default'" @click="toggleHttpDebug">
            {{ httpDebugEnabled ? '关闭 HTTP 调试日志' : '开启 HTTP 调试日志' }}
          </AmuButton>
        </AmuSpace>

        <AmuSpace wrap>
          <AmuButton @click="invalidateAccessToken">写入无效 accessToken</AmuButton>
          <AmuButton @click="invalidateRefreshToken">写入无效 refreshToken</AmuButton>
          <AmuButton type="primary" @click="restoreProfile">重新拉取当前会话</AmuButton>
        </AmuSpace>

        <AmuSpace wrap>
          <AmuButton type="primary" @click="requestOnce">发起单次业务请求</AmuButton>
          <AmuButton type="primary" @click="requestConcurrent">发起 5 个并发请求</AmuButton>
          <AmuButton @click="requestCancelable">发起可取消请求</AmuButton>
          <AmuButton @click="cancelPending">取消可取消请求</AmuButton>
          <AmuButton type="primary" :loading="scriptRunning" @click="runScriptedReplay">一键脚本化回放</AmuButton>
        </AmuSpace>

        <AmuCard>
          <template #title>执行日志</template>
          <template #extra>
            <AmuButton size="small" @click="logs = []">清空日志</AmuButton>
          </template>
          <div class="debug-log">{{ logs.join('\n') || '暂无日志' }}</div>
        </AmuCard>
      </AmuSpace>
    </AmuCard>
  </div>
</template>

<script setup lang="ts">
import { AmuButton } from 'amu-ui/button'
import { AmuCard } from 'amu-ui/card'
import { AmuDescriptions, AmuDescriptionsItem } from 'amu-ui/descriptions'
import { computed, ref } from 'vue'
import { AmuSpace } from 'amu-ui/space'
import { AmuTag } from 'amu-ui/tag'
import { AmuMessage } from 'amu-ui/message'
import { loginByPassword } from '../api/auth'
import { fetchDashboardOverview } from '../api/dashboard'
import { cancelRequest, requestGet } from '../api/http'
import { useAuthStore } from '../store/auth'
import { isHttpDebugEnabled, setHttpDebugEnabled } from '../utils/http-debug'
import { DEMO_ACCOUNTS } from '../config/app'

defineOptions({
  name: 'SystemAuthDebug'
})

const authStore = useAuthStore()
const logs = ref<string[]>([])
const scriptRunning = ref(false)
const httpDebugEnabled = ref(isHttpDebugEnabled())
let concurrentBatch = 0

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const appendLog = (message: string) => {
  logs.value.unshift(`[${new Date().toLocaleTimeString('zh-CN', { hour12: false })}] ${message}`)
  logs.value = logs.value.slice(0, 30)
}

const accessRemainSeconds = computed(() => {
  if (!authStore.accessTokenExpiresAt) return '-'
  const remain = Math.floor((authStore.accessTokenExpiresAt - Date.now()) / 1000)
  return String(Math.max(remain, 0))
})

const invalidateAccessToken = () => {
  authStore.setToken('invalid-access-token', Date.now() + 10 * 60 * 1000)
  appendLog('已写入无效 accessToken')
}

const invalidateRefreshToken = () => {
  authStore.setRefreshToken('invalid-refresh-token')
  appendLog('已写入无效 refreshToken')
}

const restoreProfile = async () => {
  try {
    await authStore.fetchProfile()
    appendLog('已重新拉取当前会话资料')
    AmuMessage.success({ message: '会话信息已刷新' })
  } catch (error) {
    appendLog(`拉取会话失败：${(error as Error).message}`)
  }
}

const requestOnce = async () => {
  try {
    const data = await fetchDashboardOverview()
    appendLog(`单次请求成功：visits=${data.visits}`)
  } catch (error) {
    appendLog(`单次请求失败：${(error as Error).message}`)
  }
}

const requestConcurrent = async () => {
  try {
    appendLog('开始并发请求 5 次')
    concurrentBatch += 1
    const tasks = Array.from({ length: 5 }).map((_, index) =>
      requestGet({
        url: '/api/dashboard/overview',
        requestKey: `dashboard-overview-batch-${concurrentBatch}-${index + 1}`,
        retry: 1
      })
    )
    const result = await Promise.all(tasks)
    appendLog(`并发请求完成：${result.length} / 5 成功`)
  } catch (error) {
    appendLog(`并发请求失败：${(error as Error).message}`)
  }
}

const requestCancelable = async () => {
  appendLog('发起可取消请求：requestKey=debug-cancel')
  requestGet({
    url: '/api/dashboard/overview',
    requestKey: 'debug-cancel',
    retry: 0,
    silentError: true
  })
    .then(() => appendLog('可取消请求完成'))
    .catch((error) => appendLog(`可取消请求结束：${(error as Error).message}`))
}

const cancelPending = () => {
  cancelRequest('debug-cancel')
  appendLog('已触发取消 debug-cancel 请求')
}

const toggleHttpDebug = () => {
  httpDebugEnabled.value = !httpDebugEnabled.value
  setHttpDebugEnabled(httpDebugEnabled.value)
  appendLog(httpDebugEnabled.value ? '已开启 HTTP 调试日志（控制台可查看）' : '已关闭 HTTP 调试日志')
}

const runScriptedReplay = async () => {
  if (scriptRunning.value) return

  scriptRunning.value = true
  appendLog('开始脚本化回放：使用真实后端验证刷新链路')

  try {
    const preferredAccount = DEMO_ACCOUNTS.find((account) => account.username === (authStore.user?.username || '')) || DEMO_ACCOUNTS[0]
    const nextSession = await loginByPassword(preferredAccount.username, preferredAccount.password)
    authStore.applySession({
      accessToken: nextSession.accessToken,
      refreshToken: nextSession.refreshToken,
      expiresAt: Date.now() + nextSession.expiresIn * 1000,
      currentUser: nextSession.currentUser,
      menus: nextSession.menus
    })
    appendLog(`已使用账号 ${preferredAccount.username} 重建有效会话`)
    await sleep(150)

    appendLog('步骤1：正常请求，预期成功')
    await requestOnce()
    await sleep(150)

    appendLog('步骤2：写入无效 accessToken，触发刷新后重放')
    invalidateAccessToken()
    await requestOnce()
    await sleep(150)

    appendLog('步骤3：令 refreshToken + accessToken 同时失效，预期回退登录')
    invalidateRefreshToken()
    invalidateAccessToken()
    await requestOnce()
  } catch (error) {
    appendLog(`脚本化回放结束（捕获异常）：${(error as Error).message}`)
  } finally {
    scriptRunning.value = false
  }
}
</script>

<style scoped>
.debug-log {
  white-space: pre-wrap;
  max-height: 400px;
  overflow: auto;
  padding: 16px;
  background: var(--amu-color-bg-fill);
  border-radius: var(--amu-radius);
  font-size: 13px;
  line-height: 1.6;
  font-family: monospace;
  border: 1px solid var(--amu-color-border);
}
</style>
