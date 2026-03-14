<template>
  <div class="admin-layout__tabs">
    <AmuTabs
      v-model="activePath"
      type="card"
      surface="elevated"
      closable
      @tab-click="handleTabClick"
      @tab-remove="handleTabRemove"
      class="admin-layout__tabs-container"
    >
      <Draggable
        v-model="draggableTabs"
        item-key="path"
        handle=".amu-tabs__item"
        class="admin-layout__tabs-draggable"
      >
        <template #item="{ element: item }">
          <AmuTabPane
            :key="item.path"
            :title="translateRouteTitle(item.title)"
            :name="item.path"
            :closable="item.closable"
          />
        </template>
      </Draggable>
    </AmuTabs>

    <div class="admin-layout__tabs-extra">
      <AmuDropdown trigger="click" placement="bottom-end" @select="handleCommand">
        <div class="admin-layout__tabs-extra-btn">
          <AmuIcon>
            <IconChevronDown />
          </AmuIcon>
        </div>
        <template #overlay>
          <AmuDropdownMenu>
            <AmuDropdownItem command="close-current" :icon="IconX" :disabled="!canCloseCurrentTab">
              {{ tx('关闭当前', 'Close current') }}
            </AmuDropdownItem>
            <AmuDropdownItem v-if="appStore.showPinButton" command="pin" :icon="IconMapPin" :disabled="isDashboardTab">
              {{ isCurrentTabPinned ? tx('取消固定', 'Unpin') : tx('固定', 'Pin') }}
            </AmuDropdownItem>
            <AmuDropdownItem command="maximize" :icon="isFullscreen ? IconMinimize : IconMaximize">
              {{ isFullscreen ? tx('还原', 'Restore') : tx('最大化', 'Maximize') }}
            </AmuDropdownItem>
            <AmuDropdownItem command="new-window" :icon="IconExternalLink">
              {{ tx('新窗口打开', 'Open in new window') }}
            </AmuDropdownItem>
            <AmuDropdownItem command="close-left" :icon="IconArrowLeft" :disabled="!hasClosableLeftTabs">
              {{ tx('关闭左侧', 'Close left') }}
            </AmuDropdownItem>
            <AmuDropdownItem command="close-right" :icon="IconArrowRight" :disabled="!hasClosableRightTabs">
              {{ tx('关闭右侧', 'Close right') }}
            </AmuDropdownItem>
            <AmuDropdownItem command="close-others" :icon="IconXCircle" :disabled="!hasClosableOtherTabs">
              {{ tx('关闭其他', 'Close others') }}
            </AmuDropdownItem>
            <AmuDropdownItem command="close-all" :icon="IconRepeat" :disabled="!hasClosableTabs">
              {{ tx('关闭全部', 'Close all') }}
            </AmuDropdownItem>
          </AmuDropdownMenu>
        </template>
      </AmuDropdown>

      <div class="admin-layout__tabs-extra-btn" @click="handleRefresh">
        <AmuIcon :class="{ 'spinning': loading }">
          <IconRefreshCw />
        </AmuIcon>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { AmuTabs, AmuTabPane } from 'amu-ui/tabs'
import { AmuIcon } from 'amu-ui/icon'
import { AmuDropdown, AmuDropdownMenu, AmuDropdownItem } from 'amu-ui/dropdown'
import Draggable from 'vuedraggable'
import {
  IconRefreshCw,
  IconChevronDown,
  IconArrowLeft,
  IconArrowRight,
  IconXCircle,
  IconRepeat,
  IconX,
  IconMapPin,
  IconExternalLink,
  IconMinimize,
  IconMaximize
} from '@amu-ui/icons'
import { useAppStore } from '../../store/app'
import { useTabsStore } from '../../store/tabs'
import { useLayout } from '../composables/useLayout'

defineProps<{
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()
const tabsStore = useTabsStore()
const { translateRouteTitle } = useLayout()
const fullscreenFlag = ref(Boolean(document.fullscreenElement))
const isFullscreen = computed(() => fullscreenFlag.value)

const syncFullscreen = () => {
  fullscreenFlag.value = Boolean(document.fullscreenElement)
}

onMounted(() => {
  document.addEventListener('fullscreenchange', syncFullscreen)
})

onBeforeUnmount(() => {
  document.removeEventListener('fullscreenchange', syncFullscreen)
})

const activePath = computed({
  get: () => route.fullPath,
  set: (val) => {
    router.push(val)
  }
})

const draggableTabs = computed({
  get: () => tabsStore.visitedTabs,
  set: (tabs) => {
    tabsStore.visitedTabs = tabs
  }
})

const handleTabClick = (name: string | number) => {
  router.push(String(name))
}

const handleTabRemove = (val: string | number) => {
  const path = String(val)
  tabsStore.removeTab(path)
  if (activePath.value === path) {
    const latest = tabsStore.visitedTabs.slice(-1)[0]
    if (latest) {
      router.push(latest.path)
    }
  }
}

const handleRefresh = () => {
  emit('refresh')
}

const currentTab = computed(() => {
  return tabsStore.visitedTabs.find((tab) => tab.path === route.fullPath)
})

const currentTabIndex = computed(() => {
  return tabsStore.visitedTabs.findIndex((tab) => tab.path === route.fullPath)
})

const canCloseCurrentTab = computed(() => Boolean(currentTab.value?.closable))
const isDashboardTab = computed(() => currentTab.value?.path === '/dashboard')
const isCurrentTabPinned = computed(() => Boolean(currentTab.value) && !currentTab.value!.closable)

const hasClosableTabs = computed(() => {
  return tabsStore.visitedTabs.some((tab) => tab.closable)
})

const hasClosableLeftTabs = computed(() => {
  if (currentTabIndex.value <= 0) return false
  return tabsStore.visitedTabs.slice(0, currentTabIndex.value).some((tab) => tab.closable)
})

const hasClosableRightTabs = computed(() => {
  if (currentTabIndex.value < 0) return false
  return tabsStore.visitedTabs.slice(currentTabIndex.value + 1).some((tab) => tab.closable)
})

const hasClosableOtherTabs = computed(() => {
  const targetPath = currentTab.value?.path
  if (!targetPath) return false
  return tabsStore.visitedTabs.some((tab) => tab.path !== targetPath && tab.closable)
})

const fallbackToLastTab = () => {
  const latest = tabsStore.visitedTabs[tabsStore.visitedTabs.length - 1]
  router.push(latest?.path || '/dashboard')
}

const handleCommand = (command: unknown) => {
  const currentPath = route.fullPath

  if (command === 'close-current') {
    tabsStore.removeTab(currentPath)
    fallbackToLastTab()
    return
  }

  if (command === 'close-left') {
    tabsStore.removeLeft(currentPath)
    return
  }

  if (command === 'pin') {
    tabsStore.togglePin(currentPath)
    return
  }

  if (command === 'maximize') {
    if (!document.fullscreenElement) {
      void document.documentElement.requestFullscreen()
      return
    }
    if (document.exitFullscreen) {
      void document.exitFullscreen()
    }
    return
  }

  if (command === 'new-window') {
    const href = router.resolve(currentPath).href
    window.open(href, '_blank')
    return
  }

  if (command === 'close-right') {
    tabsStore.removeRight(currentPath)
    return
  }

  if (command === 'close-others') {
    tabsStore.removeOthers(currentPath)
    return
  }

  if (command === 'close-all') {
    tabsStore.removeAll()
    router.push('/dashboard')
  }
}

const tx = (zh: string, en: string) => (appStore.language === 'zh-CN' ? zh : en)
</script>

<style scoped lang="less">
.admin-layout__tabs {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  height: 35px;
  line-height: normal;
  background: var(--amu-color-bg-elevated);
  border-bottom: 1px solid var(--amu-color-border);
  padding-right: 12px;
}

.admin-layout__tabs-container {
  flex: 1;
  overflow: hidden;
}

:deep(.amu-tabs) {
  display: flex;
  flex-direction: column;
  height: 100%;
}

:deep(.amu-tabs__header) {
  margin: 0;
  height: 100%;
  border-bottom: none;
  align-items: stretch;
}

:deep(.amu-tabs--card > .amu-tabs__header) {
  margin-bottom: 0;
  margin-top: 0;
  border-top: none;
  background: transparent;
}

:deep(.amu-tabs__nav-wrap),
:deep(.amu-tabs__nav-scroll),
:deep(.amu-tabs__nav) {
  height: 100%;
  align-items: stretch;
}

:deep(.amu-tabs--card .amu-tabs__item) {
  height: 100%;
  line-height: normal;
  margin-top: 0;
  margin-bottom: 0;
  border-top: none;
  border-bottom: none;
  background: transparent;
}

:deep(.amu-tabs__label) {
  line-height: normal;
}

:deep(.amu-tabs--card .amu-tabs__item.is-active) {
  background: var(--amu-color-bg-elevated);
}

:deep(.amu-tabs__content) {
  display: none;
}

.admin-layout__tabs-extra {
  display: flex;
  align-items: center;
  margin-left: 16px;
}

.admin-layout__tabs-extra-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 4px;
  color: var(--amu-color-text-secondary);
}

.admin-layout__tabs-extra-btn:hover {
  background: var(--amu-color-bg-fill);
  color: var(--amu-color-text);
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
