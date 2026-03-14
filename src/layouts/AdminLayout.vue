<template>
  <AmuLayout class="admin-layout" :data-amu-theme="appStore.isDark ? 'dark' : undefined" :style="layoutStyle">
    <div
      v-if="appStore.pageTransitionProgress && shouldShowTopProgress"
      class="admin-layout__top-progress"
      :style="{ width: `${topProgress}%` }"
    ></div>

    <AmuSider
      v-if="showSider"
      :width="siderWidth"
      :collapsed-width="64"
      :collapsed="effectiveCollapsed"
      :theme="siderTheme"
      @update:collapsed="handleSiderCollapse"
      class="admin-layout__sider"
      :class="{ 'is-collapsed': effectiveCollapsed }"
    >
      <AppMixedSidebar
        v-if="isMixedLayout"
        :compact-primary="appStore.layoutMode === 'mixed-nav'"
        :force-root-key="mixedRootKey"
      />
      <AppSidebar
        v-else
        :collapsed="effectiveCollapsed"
        @update:collapsed="handleSiderCollapse"
      />
    </AmuSider>

    <AmuLayout class="admin-layout__main">
      <AmuHeader height="auto" class="admin-layout__header-wrapper" :theme="headerTheme">
        <AppHeader
          @toggleSidebar="toggleSideBar"
          @refresh="handleRefresh"
          :show-menu-toggle="shouldShowMenuToggle"
          :loading="isRefreshing"
        />
        <AppTopMenu
          v-if="showTopMenu"
          :mixed-nav="appStore.layoutMode === 'mixed-nav'"
          :mixed-root="mixedRootKey"
          @update:mixed-root="handleMixedRootChange"
        />
        <TagsView v-if="appStore.layoutMode !== 'content-only'" @refresh="handleRefresh" />
      </AmuHeader>

      <AmuContent class="admin-layout__content-wrapper">
        <AppMain :refresh-key="refreshViewKey" />
      </AmuContent>
    </AmuLayout>

    <div v-if="appStore.watermark" class="admin-layout__watermark" :style="watermarkStyle"></div>

    <div v-if="isScreenLocked" class="admin-layout__lock-screen">
      <div class="admin-layout__lock-card">
        <div class="admin-layout__lock-title">{{ tx('屏幕已锁定', 'Screen locked') }}</div>
        <div class="admin-layout__lock-time">{{ lockTimeText }}</div>
        <div class="admin-layout__lock-user">{{ authStore.user?.username || tx('访客', 'Guest') }}</div>
        <AmuButton type="primary" @click="handleUnlockScreen">{{ tx('解锁', 'Unlock') }}</AmuButton>
      </div>
    </div>
  </AmuLayout>
</template>

<script setup lang="ts">
import { ref, nextTick, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AmuLayout, AmuSider, AmuHeader, AmuContent } from 'amu-ui/layout'
import { AmuButton } from 'amu-ui/button'
import { useAppStore } from '../store/app'
import { useAuthStore } from '../store/auth'
import { usePermissionStore } from '../store/permission'
import { useTabsStore } from '../store/tabs'
import { APP_META } from '../config/app'
import AppSidebar from './components/AppSidebar.vue'
import AppHeader from './components/AppHeader.vue'
import TagsView from './components/TagsView.vue'
import AppMain from './components/AppMain.vue'
import AppTopMenu from './components/AppTopMenu.vue'
import AppMixedSidebar from './components/AppMixedSidebar.vue'
import { findRootMenuByKey } from '../utils/menu-tree'

defineOptions({
  name: 'AdminLayout'
})

const appStore = useAppStore()
const authStore = useAuthStore()
const permissionStore = usePermissionStore()
const tabsStore = useTabsStore()
const route = useRoute()
const router = useRouter()
const isRefreshing = ref(false)
const refreshViewKey = ref(0)
const refreshProgress = ref(0)
const routeProgress = ref(0)
const isScreenLocked = ref(false)
const lockTimeText = ref('')
let refreshProgressTimer: number | null = null
let routeProgressTimer: number | null = null
let lockClockTimer: number | null = null
const mixedRootKey = ref('')

const tx = (zh: string, en: string) => {
  return appStore.language === 'zh-CN' ? zh : en
}

const shouldShowMenuToggle = computed(() => {
  return appStore.collapseMenu
    && appStore.showCollapseButton
    && showSider.value
})

const isMixedLayout = computed(() => {
  return appStore.layoutMode === 'double-column'
    || appStore.layoutMode === 'mixed-nav'
    || appStore.layoutMode === 'mixed-column'
})

const showTopMenu = computed(() => {
  return appStore.layoutMode === 'horizontal' || appStore.layoutMode === 'mixed-nav'
})

const showSider = computed(() => {
  return appStore.showSidebar
    && appStore.layoutMode !== 'content-only'
    && appStore.layoutMode !== 'horizontal'
})

const siderTheme = computed(() => {
  if (appStore.isDark || appStore.sidebarDark || appStore.sidebarChildDark) {
    return 'dark'
  }
  return undefined
})

const headerTheme = computed(() => {
  if (appStore.isDark || appStore.headerDark) {
    return 'dark'
  }
  return undefined
})

const effectiveCollapsed = computed(() => {
  if (!showSider.value) return true
  return appStore.sidebarCollapsed
})

const siderWidth = computed(() => {
  if (appStore.layoutMode === 'mixed-nav') {
    return 216
  }
  if (isMixedLayout.value) {
    return appStore.showMixedChildMenu || appStore.layoutMode === 'double-column' ? 280 : 64
  }
  return 240
})

const resolveRootByPath = (path: string) => {
  return findRootMenuByKey(permissionStore.menuTree, path)
}

const layoutStyle = computed(() => {
  return {
    '--amu-color-primary': appStore.primaryColor,
    '--admin-font-size': `${appStore.fontSize}px`,
    '--admin-radius': `${4 + appStore.radiusScale * 8}px`
  }
})

const topProgress = computed(() => {
  return Math.max(refreshProgress.value, routeProgress.value)
})

const shouldShowTopProgress = computed(() => {
  return topProgress.value > 0
})

const watermarkStyle = computed(() => {
  const title = appStore.language === 'en-US'
    ? APP_META.name.toUpperCase()
    : APP_META.name
  const stamp = new Date().toLocaleDateString()
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='140'><g transform='rotate(-18 110 70)'><text x='18' y='68' fill='var(--amu-color-text-disabled)' font-size='16' font-family='sans-serif'>${title}</text><text x='18' y='96' fill='var(--amu-color-text-disabled)' font-size='12' font-family='sans-serif'>${stamp}</text></g></svg>`
  return {
    backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
  }
})

watch(
  () => route.fullPath,
  () => {
    if (route.path === '/login' || route.path === '/403') return
    tabsStore.upsertTab({
      path: route.fullPath,
      title: String(route.meta.title || route.name || route.fullPath),
      name: route.name ? String(route.name) : undefined,
      closable: route.path !== '/dashboard',
      keepAlive: Boolean(route.meta.keepAlive)
    })
  },
  { immediate: true }
)

watch(
  () => [route.path, permissionStore.menuTree] as const,
  () => {
    const root = resolveRootByPath(route.path) || permissionStore.menuTree[0]
    mixedRootKey.value = root?.key || ''
  },
  { immediate: true }
)

const toggleSideBar = () => {
  appStore.sidebarCollapsed = !appStore.sidebarCollapsed
}

const handleSiderCollapse = (value: boolean) => {
  appStore.sidebarCollapsed = value
}

const handleMixedRootChange = (value: string) => {
  mixedRootKey.value = value
}

const clearRefreshProgressTimer = () => {
  if (refreshProgressTimer === null) return
  window.clearInterval(refreshProgressTimer)
  refreshProgressTimer = null
}

const clearRouteProgressTimer = () => {
  if (routeProgressTimer === null) return
  window.clearInterval(routeProgressTimer)
  routeProgressTimer = null
}

const startRefreshProgress = () => {
  clearRefreshProgressTimer()
  refreshProgress.value = 8
  refreshProgressTimer = window.setInterval(() => {
    if (refreshProgress.value >= 90) return
    refreshProgress.value = Math.min(90, refreshProgress.value + 8)
  }, 100)
}

const finishRefreshProgress = async () => {
  clearRefreshProgressTimer()
  refreshProgress.value = 100
  await new Promise((resolve) => setTimeout(resolve, 120))
  refreshProgress.value = 0
}

const startRouteProgress = () => {
  clearRouteProgressTimer()
  routeProgress.value = 8
  routeProgressTimer = window.setInterval(() => {
    if (routeProgress.value >= 88) return
    routeProgress.value = Math.min(88, routeProgress.value + 6)
  }, 90)
}

const finishRouteProgress = async () => {
  clearRouteProgressTimer()
  routeProgress.value = 100
  await new Promise((resolve) => setTimeout(resolve, 100))
  routeProgress.value = 0
}

const updateLockTime = () => {
  const now = new Date()
  const hour = String(now.getHours()).padStart(2, '0')
  const minute = String(now.getMinutes()).padStart(2, '0')
  const second = String(now.getSeconds()).padStart(2, '0')
  lockTimeText.value = `${hour}:${minute}:${second}`
}

const handleLockScreen = () => {
  isScreenLocked.value = true
  updateLockTime()
  if (lockClockTimer !== null) {
    window.clearInterval(lockClockTimer)
  }
  lockClockTimer = window.setInterval(updateLockTime, 1000)
}

const handleUnlockScreen = () => {
  isScreenLocked.value = false
  if (lockClockTimer === null) return
  window.clearInterval(lockClockTimer)
  lockClockTimer = null
}

const handleLogout = async () => {
  await authStore.logout(true)
  permissionStore.reset()
  tabsStore.reset()
  await router.replace('/login')
}

const handleRouteStart = () => {
  if (route.path === '/login') return
  if (appStore.pageTransitionProgress) {
    startRouteProgress()
  }
}

const handleRouteEnd = async () => {
  if (appStore.pageTransitionProgress) {
    await finishRouteProgress()
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (isScreenLocked.value && event.key === 'Escape') {
    event.preventDefault()
    handleUnlockScreen()
    return
  }

  if (!appStore.enableShortcut) return
  if (route.path === '/login') return

  const key = event.key.toLowerCase()
  if (event.altKey && key === 'q' && appStore.enableLogoutShortcut) {
    event.preventDefault()
    handleLogout()
    return
  }

  if (event.altKey && key === 'l' && appStore.enableLockShortcut) {
    event.preventDefault()
    handleLockScreen()
  }
}

const routeStartListener = () => {
  handleRouteStart()
}

const routeEndListener = () => {
  void handleRouteEnd()
}

const handleRefresh = async () => {
  isRefreshing.value = true
  if (appStore.pageTransitionProgress) {
    startRefreshProgress()
  }
  await nextTick()
  refreshViewKey.value += 1
  if (appStore.pageTransitionProgress) {
    await finishRefreshProgress()
  }
  setTimeout(() => {
    isRefreshing.value = false
  }, 400)
}

onMounted(() => {
  window.addEventListener('amu-admin:route-start', routeStartListener)
  window.addEventListener('amu-admin:route-end', routeEndListener)
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  clearRefreshProgressTimer()
  clearRouteProgressTimer()
  if (lockClockTimer !== null) {
    window.clearInterval(lockClockTimer)
    lockClockTimer = null
  }
  window.removeEventListener('amu-admin:route-start', routeStartListener)
  window.removeEventListener('amu-admin:route-end', routeEndListener)
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped lang="less">
.admin-layout {
  height: 100vh;
  width: 100vw;
  display: flex;
  overflow: hidden;
  font-size: var(--admin-font-size);
}

.admin-layout__top-progress {
  position: fixed;
  top: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--amu-color-primary);
  transition: width 0.2s ease;
  z-index: 1200;
}

.admin-layout__sider {
  height: 100%;
  background: var(--amu-color-bg-elevated);
  border-right: 1px solid var(--amu-color-border);
  transition: all 0.2s;
  z-index: 10;
}

.admin-layout__main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  background: var(--amu-color-bg-fill);
}

.admin-layout__header-wrapper {
  background: var(--amu-color-bg-elevated);
  padding: 0;
  z-index: 9;
  line-height: normal;
  display: flex;
  flex-direction: column;
  height: auto;
}

.admin-layout__content-wrapper {
  flex: 1;
  padding: 0;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  background: var(--amu-color-bg-fill);
}

[data-amu-theme='dark'] .admin-layout__main {
  background: var(--amu-color-bg);
}

[data-amu-theme='dark'] .admin-layout__content-wrapper {
  background: var(--amu-color-bg);
}

.admin-layout__watermark {
  position: fixed;
  inset: 0;
  z-index: 1000;
  pointer-events: none;
  background-repeat: repeat;
  opacity: 0.24;
}

.admin-layout__lock-screen {
  position: fixed;
  inset: 0;
  z-index: 1300;
  background: var(--amu-color-bg-mask);
  display: flex;
  align-items: center;
  justify-content: center;
}

.admin-layout__lock-card {
  width: 320px;
  padding: 20px;
  border-radius: var(--admin-radius);
  border: 1px solid var(--amu-color-border);
  background: var(--amu-color-bg-elevated);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.admin-layout__lock-title {
  color: var(--amu-color-text);
  font-size: 16px;
  font-weight: 600;
}

.admin-layout__lock-time {
  color: var(--amu-color-primary);
  font-size: 24px;
  font-weight: 700;
}

.admin-layout__lock-user {
  color: var(--amu-color-text-secondary);
  font-size: 13px;
}
</style>

