<template>
  <div class="app-header-content">
    <div class="admin-layout__header-left">
      <div v-if="props.showMenuToggle" class="admin-layout__header-icon" @click="emit('toggleSidebar')">
        <AmuIcon>
          <IconMenu />
        </AmuIcon>
      </div>

      <div class="admin-layout__header-icon" @click="emit('refresh')">
        <AmuIcon :class="{ 'admin-layout__refresh-icon--spinning': props.loading }">
          <IconRefreshCw />
        </AmuIcon>
      </div>

      <AmuBreadcrumb separator=">">
        <AmuBreadcrumbItem v-for="crumb in breadcrumbs" :key="crumb.path">
          <div class="admin-layout__breadcrumb-item"
            :class="{ 'admin-layout__breadcrumb-item--clickable': crumb.path !== route.path }"
            @click="handleBreadcrumbClick(crumb.path)">
            <AmuIcon v-if="resolveMenuIcon(crumb.path)" :size="20" class="admin-layout__breadcrumb-icon">
              <component :is="resolveMenuIcon(crumb.path)" />
            </AmuIcon>
            <span>{{ translateRouteTitle(crumb.title) }}</span>
          </div>
        </AmuBreadcrumbItem>
      </AmuBreadcrumb>
    </div>

    <div class="admin-layout__header-right">
      <div class="admin-layout__header-icon" @click="handleGlobalSearch">
        <AmuIcon>
          <IconSearch />
        </AmuIcon>
      </div>

      <AmuDropdown trigger="click" placement="bottom-end">
        <template #trigger>
          <div class="admin-layout__header-icon admin-layout__header-icon--badge">
            <AmuIcon>
              <IconBell />
            </AmuIcon>
            <span v-if="unreadNotificationsCount > 0" class="admin-layout__badge"></span>
          </div>
        </template>
        <template #overlay>
          <div class="admin-layout__notification-panel">
            <div class="admin-layout__notification-header">
              <span class="admin-layout__notification-title">
                {{ tx('通知', 'Notification') }}
              </span>
              <AmuIcon class="admin-layout__notification-header-icon" size="18">
                <IconMail />
              </AmuIcon>
            </div>
            <div class="admin-layout__notification-tabs-container">
              <div class="admin-layout__notification-tabs">
                <div class="admin-layout__notification-tab" :class="{ 'is-active': notificationFilter === 'all' }"
                  @click="notificationFilter = 'all'">
                  {{ tx('全部', 'All') }}
                </div>
                <div class="admin-layout__notification-tab" :class="{ 'is-active': notificationFilter === 'unread' }"
                  @click="notificationFilter = 'unread'">
                  {{ tx('未读', 'Unread') }}
                </div>
              </div>
            </div>
            <AmuScrollbar height="320px">
              <div v-if="filteredNotifications.length === 0" class="admin-layout__notification-empty">
                <div class="admin-layout__notification-empty-icon">
                  <AmuIcon>
                    <IconBell />
                  </AmuIcon>
                </div>
                {{ tx('暂无新通知', 'No new notifications') }}
              </div>
              <div v-for="item in filteredNotifications" :key="item.id" class="admin-layout__notification-item"
                :class="{ 'is-read': item.isRead }">
                <div class="admin-layout__notification-avatar"
                  :style="{ background: item.color || 'var(--amu-color-primary)' }">
                  <span v-if="item.avatar">{{ item.avatar }}</span>
                  <AmuIcon v-else>
                    <IconBell />
                  </AmuIcon>
                </div>
                <div class="admin-layout__notification-content">
                  <div class="admin-layout__notification-item-header">
                    <div class="admin-layout__notification-item-title">
                      {{ item.title }}
                      <span v-if="!item.isRead" class="admin-layout__notification-dot"></span>
                    </div>
                  </div>
                  <div class="admin-layout__notification-item-desc">{{ item.desc }}</div>
                  <div class="admin-layout__notification-item-time">{{ item.time }}</div>
                </div>
                <div class="admin-layout__notification-actions">
                  <AmuButton v-if="!item.isRead" type="text" size="small"
                    class="admin-layout__notification-action tooltip" :title="tx('标为已读', 'Mark as read')"
                    @click="markAsRead(item.id)">
                    <AmuIcon size="16">
                      <IconCheck />
                    </AmuIcon>
                  </AmuButton>
                </div>
              </div>
            </AmuScrollbar>
            <div class="admin-layout__notification-footer">
              <div class="admin-layout__notification-footer-left">
                <AmuButton type="text" size="small" @click="clearNotifications">{{ tx('清空', 'Clear') }}</AmuButton>
              </div>
              <AmuButton type="primary" size="small" @click="markAllAsRead">{{ tx('查看所有消息', 'View all') }}</AmuButton>
            </div>
          </div>
        </template>
      </AmuDropdown>

      <div class="admin-layout__header-icon" @click="appStore.toggleDark()">
        <AmuIcon>
          <component :is="appStore.isDark ? IconSun : IconMoon" />
        </AmuIcon>
      </div>

      <div class="admin-layout__header-icon" @click="settingsVisible = true">
        <AmuIcon>
          <IconSettings />
        </AmuIcon>
      </div>

      <div class="admin-layout__header-icon" @click="openGithub">
        <AmuIcon>
          <IconGithub />
        </AmuIcon>
      </div>

      <div class="admin-layout__header-icon" @click="toggleFullscreen">
        <AmuIcon>
          <component :is="isFullscreen ? IconMinimize : IconMaximize" />
        </AmuIcon>
      </div>

      <AmuDropdown trigger="click" placement="bottom-end">
        <template #trigger>
          <div class="admin-layout__user">
            <div class="admin-layout__user-avatar-trigger">
              <img :src="userAvatar" :alt="userDisplayName" />
              <div class="admin-layout__user-status-dot"></div>
            </div>
          </div>
        </template>
        <template #overlay>
          <AmuDropdownMenu class="admin-layout__user-dropdown">
            <div class="admin-layout__user-info">
              <img :src="userAvatar" :alt="userDisplayName"
                class="admin-layout__user-info-avatar" />
              <div class="admin-layout__user-info-text">
                <div class="admin-layout__user-info-name">
                  {{ userDisplayName }}
                  <span class="admin-layout__user-tag">Pro</span>
                </div>
                <div class="admin-layout__user-info-email">{{ authStore.user?.email || 'admin@amu-ui.com' }}</div>
                <div class="admin-layout__user-info-email">{{ userRoleLabel }} · {{ authStore.user?.department || APP_META.name }}</div>
              </div>
            </div>

            <div class="admin-layout__user-divider"></div>

            <AmuDropdownItem :icon="IconUser">
              {{ tx('个人中心', 'Profile') }}
            </AmuDropdownItem>
            <AmuDropdownItem :icon="IconBook">
              {{ tx('文档', 'Documentation') }}
            </AmuDropdownItem>
            <AmuDropdownItem :icon="IconGithub" @click="openGithub">
              GitHub
            </AmuDropdownItem>
            <AmuDropdownItem :icon="IconHelpCircle">
              {{ tx('问题 & 帮助', 'Help & Issues') }}
            </AmuDropdownItem>

            <div class="admin-layout__user-divider"></div>

            <AmuDropdownItem :icon="IconLock">
              <div class="admin-layout__user-item-flex">
                <span>{{ tx('锁定屏幕', 'Lock Screen') }}</span>
                <span class="admin-layout__user-shortcut">Alt L</span>
              </div>
            </AmuDropdownItem>
            <AmuDropdownItem :icon="IconLogOut" @click="handleLogout">
              <div class="admin-layout__user-item-flex">
                <span>{{ tx('退出登录', 'Logout') }}</span>
                <span class="admin-layout__user-shortcut">Alt Q</span>
              </div>
            </AmuDropdownItem>
          </AmuDropdownMenu>
        </template>
      </AmuDropdown>
    </div>
  </div>

  <AmuDialog v-model="searchVisible" :width="600" type="custom" :class="'admin-search-dialog'">
    <div class="admin-search">
      <div class="admin-search__header">
        <AmuIcon class="admin-search__main-icon" :size="18">
          <IconSearch />
        </AmuIcon>
        <AmuInput ref="searchInputRef" v-model="searchKeyword" :placeholder="tx('搜索页面...', 'Search pages...')"
          :borderless="true" size="large" @keydown="handleSearchKeydown" class="admin-search__input" />
        <div class="admin-search__close" @click="searchVisible = false">
          <AmuIcon :size="20">
            <IconX />
          </AmuIcon>
        </div>
      </div>
      <div class="admin-search__result">
        <AmuScrollbar height="300px">
          <template v-if="searchKeyword.trim() && displaySearchList.length > 0">
            <div v-if="searchTitleMatches.length > 0" class="admin-search__section">
              <div class="admin-search__section-title">{{ tx('标题命中', 'Title matches') }}</div>
              <div v-for="(item, index) in searchTitleMatches" :key="`title-${item.key}`" class="admin-search__item"
                :class="{ 'is-active': getFlatIndex('title', index) === searchSelectedIndex }"
                @click="handleSearchSelect(item.key)" @mouseenter="searchSelectedIndex = getFlatIndex('title', index)">
                <div class="admin-search__item-icon">
                  <AmuIcon :size="18">
                    <component :is="resolveMenuIcon(item.key, item.icon) || IconFileText" />
                  </AmuIcon>
                </div>
                <div class="admin-search__item-content">
                  <div class="admin-search__item-title" v-html="highlightKeyword(translateRouteTitle(item.title))"></div>
                </div>
                <div class="admin-search__item-enter" @click.stop="handleSearchItemClose(item.key)">
                  <AmuIcon size="14">
                    <IconX />
                  </AmuIcon>
                </div>
              </div>
            </div>

            <div v-if="searchPathMatches.length > 0" class="admin-search__section">
              <div class="admin-search__section-title">{{ tx('路径命中', 'Path matches') }}</div>
              <div v-for="(item, index) in searchPathMatches" :key="`path-${item.key}`" class="admin-search__item"
                :class="{ 'is-active': getFlatIndex('path', index) === searchSelectedIndex }"
                @click="handleSearchSelect(item.key)" @mouseenter="searchSelectedIndex = getFlatIndex('path', index)">
                <div class="admin-search__item-icon">
                  <AmuIcon size="16">
                    <component :is="resolveMenuIcon(item.key, item.icon) || IconFileText" />
                  </AmuIcon>
                </div>
                <div class="admin-search__item-content">
                  <div class="admin-search__item-title" v-html="highlightKeyword(translateRouteTitle(item.title))"></div>
                </div>
                <div class="admin-search__item-enter" @click.stop="handleSearchItemClose(item.key)">
                  <AmuIcon size="14">
                    <IconX />
                  </AmuIcon>
                </div>
              </div>
            </div>
          </template>
          <div v-else-if="searchKeyword.trim()" class="admin-search__empty-state">
            <AmuIcon class="admin-search__empty-icon" :size="38">
              <IconCommand />
            </AmuIcon>
            <div class="admin-search__empty-text">{{ tx('暂无匹配结果', 'No matching results') }}</div>
          </div>
          <div v-else class="admin-search__empty">
            <div v-if="recentTabs.length > 0" class="admin-search__section">
              <div class="admin-search__section-title">{{ tx('最近访问', 'Recent visits') }}</div>
              <div v-for="(item, index) in recentTabs" :key="`recent-${item.key}`" class="admin-search__item"
                :class="{ 'is-active': index === searchSelectedIndex }" @click="handleSearchSelect(item.key)"
                @mouseenter="searchSelectedIndex = index">
                <div class="admin-search__item-icon">
                  <AmuIcon :size="16">
                    <component :is="resolveMenuIcon(item.key, item.icon) || IconFileText" />
                  </AmuIcon>
                </div>
                <div class="admin-search__item-content">
                  <div class="admin-search__item-title">{{ translateRouteTitle(item.title) }}</div>
                </div>
                <div class="admin-search__item-enter" @click.stop="handleSearchItemClose(item.key)">
                  <AmuIcon :size="14">
                    <IconX />
                  </AmuIcon>
                </div>
              </div>
            </div>
            <div v-else class="admin-search__empty-state">
              <AmuIcon class="admin-search__empty-icon" :size="38">
                <IconCommand />
              </AmuIcon>
              <div class="admin-search__empty-text">{{ tx('输入页面名称或路径进行搜索', 'Enter page name or path to search') }}</div>
            </div>
          </div>
        </AmuScrollbar>
      </div>
      <div class="admin-search__footer">
        <div class="admin-search__footer-item">
          <span class="admin-search__key">
            <AmuIcon size="12">
              <IconCornerDownLeft />
            </AmuIcon>
          </span>
          <span>{{ tx('确认', 'Select') }}</span>
        </div>
        <div class="admin-search__footer-item">
          <span class="admin-search__key">
            <AmuIcon size="12">
              <IconArrowUp />
            </AmuIcon>
          </span>
          <span class="admin-search__key">
            <AmuIcon size="12">
              <IconArrowDown />
            </AmuIcon>
          </span>
          <span>{{ tx('切换', 'Navigate') }}</span>
        </div>
        <div class="admin-search__footer-item">
          <span class="admin-search__key">ESC</span>
          <span>{{ tx('关闭', 'Close') }}</span>
        </div>
      </div>
    </div>
  </AmuDialog>

  <LayoutSettingsDrawer v-model="settingsVisible" />
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AmuBreadcrumb, AmuBreadcrumbItem } from 'amu-ui/breadcrumb'
import { AmuIcon } from 'amu-ui/icon'
import { AmuDropdown, AmuDropdownMenu, AmuDropdownItem } from 'amu-ui/dropdown'
import { AmuDialog } from 'amu-ui/dialog'
import { AmuInput } from 'amu-ui/input'
import { AmuScrollbar } from 'amu-ui/scrollbar'
import { AmuButton } from 'amu-ui/button'
import {
  IconMenu,
  IconRefreshCw,
  IconSettings,
  IconGithub,
  IconMinimize,
  IconMaximize,
  IconChevronDown,
  IconLogOut,
  IconBell,
  IconSearch,
  IconCheck,
  IconMail,
  IconUser,
  IconBook,
  IconHelpCircle,
  IconLock,
  IconSun,
  IconMoon,
  IconArrowUp,
  IconArrowDown,
  IconCornerDownLeft,
  IconFileText,
  IconCommand,
  IconX
} from '@amu-ui/icons'
import { APP_META, ROLE_LABELS } from '../../config/app'
import { useAppStore } from '../../store/app'
import { useAuthStore } from '../../store/auth'
import { usePermissionStore, type MenuNode } from '../../store/permission'
import { useTabsStore } from '../../store/tabs'
import { createAvatarDataUri } from '../../utils/avatar'
import { readStorageJson, removeStorage, writeStorage } from '../../utils/storage'
import { useLayout } from '../composables/useLayout'
import LayoutSettingsDrawer from './LayoutSettingsDrawer.vue'

const props = defineProps<{
  loading?: boolean
  showMenuToggle?: boolean
}>()

const emit = defineEmits<{
  (e: 'toggleSidebar'): void
  (e: 'refresh'): void
}>()

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()
const permissionStore = usePermissionStore()
const tabsStore = useTabsStore()
const { resolveMenuIcon, translateRouteTitle } = useLayout()

const isFullscreen = ref(false)
const searchVisible = ref(false)
const settingsVisible = ref(false)
const searchKeyword = ref('')
const searchSelectedIndex = ref(0)
const searchInputRef = ref<{ focus?: () => void } | null>(null)
const notificationFilter = ref<'all' | 'unread'>('all')

type NotificationItem = {
  id: number
  title: string
  desc: string
  time: string
  isRead: boolean
  avatar?: string
  color?: string
}

type SearchItem = {
  key: string
  title: string
  icon?: string
  visitedAt: number
}

type SearchMatchItem = SearchItem & {
  score: number
  matchGroup: 'title' | 'path'
}

const SEARCH_HISTORY_KEY = 'amu-admin-search-history'

const isSearchHistoryItemArray = (value: unknown): value is SearchItem[] => {
  return Array.isArray(value)
    && value.every((item) => {
      if (!item || typeof item !== 'object') return false
      const candidate = item as { key?: unknown; title?: unknown; icon?: unknown; visitedAt?: unknown }
      const hasValidVisitedAt = typeof candidate.visitedAt === 'undefined'
        || (typeof candidate.visitedAt === 'number' && Number.isFinite(candidate.visitedAt))
      return typeof candidate.key === 'string'
        && typeof candidate.title === 'string'
        && (typeof candidate.icon === 'undefined' || typeof candidate.icon === 'string')
        && hasValidVisitedAt
    })
}

const normalizeSearchHistory = (value: SearchItem[]) => {
  const now = Date.now()
  return value.map((item, index) => {
    if (typeof item.visitedAt === 'number' && Number.isFinite(item.visitedAt)) {
      return item
    }
    return {
      ...item,
      visitedAt: now - index
    }
  })
}

const notificationOptions = ref<NotificationItem[]>([
  {
    id: 1,
    title: '系统版本更新完成',
    desc: '系统已经成功更新至 v2.4.0，本次更新修复了已知的数据同步延迟问题。',
    time: '10 分钟前',
    isRead: false,
    avatar: 'Sys',
    color: '#34d399'
  },
  {
    id: 2,
    title: '有一条新的审批代办',
    desc: '张三提交了一份[采购申请单]，需要您在今天下班前完成审批流程。',
    time: '2 小时前',
    isRead: false,
    color: '#60a5fa'
  },
  {
    id: 3,
    title: '资源使用率报警',
    desc: '您的生产环境数据库 CPU 使用率已连续 5 分钟超过 80%，请及时排查异常查询。',
    time: '5 小时前',
    isRead: false,
    color: '#f472b6'
  },
  {
    id: 4,
    title: '服务续费提醒',
    desc: '您订购的云服务器资源还有 3 天即将到期，为避免影响业务运行，请尽快续费。',
    time: '1 天前',
    isRead: false,
    color: '#a78bfa'
  }
])

const searchHistory = ref<SearchItem[]>(
  normalizeSearchHistory(readStorageJson<SearchItem[]>(SEARCH_HISTORY_KEY, isSearchHistoryItemArray, []))
)

const unreadNotificationsCount = computed(() => {
  return notificationOptions.value.filter((item) => !item.isRead).length
})

const userDisplayName = computed(() => {
  return authStore.user?.displayName || authStore.user?.username || 'Admin'
})

const userRoleLabel = computed(() => {
  const role = authStore.user?.role
  return role ? ROLE_LABELS[role].en : 'Administrator'
})

const userAvatar = computed(() => {
  const label = userDisplayName.value
  const seed = authStore.user?.avatarSeed || authStore.user?.username || 'admin'
  return createAvatarDataUri(seed, label)
})

const filteredNotifications = computed(() => {
  if (notificationFilter.value === 'unread') {
    return notificationOptions.value.filter((item) => !item.isRead)
  }
  return notificationOptions.value
})

const breadcrumbs = computed(() => {
  return route.matched
    .filter((item) => item.meta?.title && item.path !== '/')
    .map((item) => ({
      path: item.path,
      title: (item.meta.title as string) || String(item.name || item.path)
    }))
})

const flattenMenuNodes = (nodes: MenuNode[]): SearchItem[] => {
  return nodes.flatMap((item) => {
    if (item.children?.length) {
      return flattenMenuNodes(item.children)
    }
    return [{ key: item.key, title: item.title, visitedAt: 0 }]
  })
}

const computeSearchScore = (item: SearchItem, keyword: string) => {
  const rawTitle = item.title.toLowerCase()
  const localizedTitle = translateRouteTitle(item.title).toLowerCase()
  const path = item.key.toLowerCase()

  if (rawTitle.startsWith(keyword) || localizedTitle.startsWith(keyword)) return 0
  if (rawTitle.includes(keyword) || localizedTitle.includes(keyword)) return 1
  if (path.startsWith(keyword)) return 2
  if (path.includes(keyword)) return 3
  return 9
}

const searchPool = computed<SearchMatchItem[]>(() => {
  const list = flattenMenuNodes(permissionStore.menuTree)
  if (!searchKeyword.value.trim()) return []
  const normalized = searchKeyword.value.trim().toLowerCase()
  return list
    .map((item, index) => ({
      ...item,
      sortIndex: index,
      score: computeSearchScore(item, normalized)
    }))
    .filter((item) => item.score < 9)
    .sort((left, right) => {
      if (left.score !== right.score) return left.score - right.score
      return left.sortIndex - right.sortIndex
    })
    .map(({ sortIndex, ...item }) => ({
      ...item,
      matchGroup: item.score <= 1 ? 'title' as const : 'path' as const
    }))
})

const searchTitleMatches = computed(() => {
  return searchPool.value.filter((item) => item.matchGroup === 'title')
})

const searchPathMatches = computed(() => {
  return searchPool.value.filter((item) => item.matchGroup === 'path')
})

const searchGroupedList = computed(() => {
  return [...searchTitleMatches.value, ...searchPathMatches.value]
})

const recentTabs = computed(() => {
  const map = new Map<string, SearchItem>()
  const tabsOrder = new Map<string, number>()
  tabsStore.visitedTabs
    .slice()
    .reverse()
    .forEach((item, index) => {
      tabsOrder.set(item.path, index)
    })

  searchHistory.value.forEach((item) => {
    if (item.key === '/login' || item.key === '/403' || item.key === route.fullPath) return
    map.set(item.key, item)
  })

  tabsStore.visitedTabs
    .slice()
    .reverse()
    .forEach((item, index) => {
      if (item.path === '/login' || item.path === '/403' || item.path === route.fullPath) return
      if (!map.has(item.path)) {
        map.set(item.path, { key: item.path, title: item.title, visitedAt: 0 })
      }
      const existing = map.get(item.path)
      if (!existing) return
      map.set(item.path, {
        ...existing,
        title: item.title,
        visitedAt: Math.max(existing.visitedAt, 0 - index)
      })
    })

  return Array.from(map.values())
    .sort((left, right) => {
      if (left.visitedAt !== right.visitedAt) return right.visitedAt - left.visitedAt
      const leftOrder = tabsOrder.get(left.key) ?? Number.MAX_SAFE_INTEGER
      const rightOrder = tabsOrder.get(right.key) ?? Number.MAX_SAFE_INTEGER
      return leftOrder - rightOrder
    })
    .slice(0, 8)
})

const displaySearchList = computed(() => {
  if (searchKeyword.value.trim()) return searchGroupedList.value
  if (recentTabs.value.length > 0) return recentTabs.value
  return []
})

const getFlatIndex = (group: 'title' | 'path', index: number) => {
  if (group === 'title') return index
  return searchTitleMatches.value.length + index
}

watch(searchKeyword, () => {
  searchSelectedIndex.value = 0
})

watch(
  () => displaySearchList.value.length,
  (length) => {
    if (length === 0) {
      searchSelectedIndex.value = 0
      return
    }
    if (searchSelectedIndex.value >= length) {
      searchSelectedIndex.value = length - 1
    }
  }
)

watch(
  searchHistory,
  (value) => {
    writeStorage(SEARCH_HISTORY_KEY, JSON.stringify(value))
  },
  { deep: true }
)

const handleGlobalSearch = async () => {
  searchVisible.value = true
  await nextTick()
  searchInputRef.value?.focus?.()
}

const handleSearchSelect = (path: string) => {
  const selectedItem = displaySearchList.value.find((item) => item.key === path)
  if (selectedItem) {
    const nextHistory = searchHistory.value.filter((item) => item.key !== selectedItem.key)
    searchHistory.value = [
      {
        ...selectedItem,
        visitedAt: Date.now()
      },
      ...nextHistory
    ].slice(0, 12)
  }

  router.push(path)
  searchVisible.value = false
  searchKeyword.value = ''
}

const handleSearchItemClose = (path: string) => {
  searchHistory.value = searchHistory.value.filter((item) => item.key !== path)

  const visitedTab = tabsStore.visitedTabs.find((item) => item.path === path)
  if (visitedTab?.closable && route.fullPath !== path) {
    tabsStore.removeTab(path)
  }

  const currentLength = displaySearchList.value.length
  if (currentLength === 0) {
    searchSelectedIndex.value = 0
    return
  }

  if (searchSelectedIndex.value >= currentLength) {
    searchSelectedIndex.value = Math.max(0, currentLength - 1)
  }
}

const handleSearchKeydown = (event: KeyboardEvent) => {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    if (displaySearchList.value.length === 0) return
    searchSelectedIndex.value = (searchSelectedIndex.value + 1) % displaySearchList.value.length
    return
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    if (displaySearchList.value.length === 0) return
    searchSelectedIndex.value = searchSelectedIndex.value <= 0
      ? displaySearchList.value.length - 1
      : searchSelectedIndex.value - 1
    return
  }

  if (event.key === 'Enter') {
    event.preventDefault()
    const selected = displaySearchList.value[searchSelectedIndex.value]
    if (selected) {
      handleSearchSelect(selected.key)
    }
  }
}

const escapeRegExp = (value: string) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const escapeHtml = (value: string) => {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const highlightKeyword = (value: string) => {
  const safeValue = escapeHtml(value)
  const keyword = searchKeyword.value.trim()
  if (!keyword) return safeValue

  const pattern = new RegExp(`(${escapeRegExp(escapeHtml(keyword))})`, 'ig')
  return safeValue.replace(pattern, '<span>$1</span>')
}

const handleShortcut = (event: KeyboardEvent) => {
  if (!appStore.enableShortcut || !appStore.enableSearchShortcut) return
  if (event.ctrlKey && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    void handleGlobalSearch()
  }
}

const markAsRead = (id: number) => {
  notificationOptions.value = notificationOptions.value.map((item) => {
    if (item.id !== id) return item
    return { ...item, isRead: true }
  })
}

const clearNotifications = () => {
  notificationOptions.value = []
}

const markAllAsRead = () => {
  notificationOptions.value = notificationOptions.value.map((item) => ({
    ...item,
    isRead: true
  }))
}

const handleBreadcrumbClick = (path: string) => {
  if (path !== route.path) router.push(path)
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
    return
  }

  if (document.exitFullscreen) {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

const openGithub = () => {
  if (!APP_META.repositoryUrl) return
  window.open(APP_META.repositoryUrl, '_blank')
}

const handleLogout = async () => {
  await authStore.logout(true)
  permissionStore.reset()
  tabsStore.reset()
  searchHistory.value = []
  removeStorage(SEARCH_HISTORY_KEY)
  await router.replace('/login')
}

onMounted(() => {
  window.addEventListener('keydown', handleShortcut)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleShortcut)
})

const tx = (zh: string, en: string) => (appStore.language === 'zh-CN' ? zh : en)
</script>

<style scoped lang="less">
.app-header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  padding: 0 16px;
  background: var(--amu-color-bg-elevated);
  border-bottom: 1px solid var(--amu-color-border);
  box-sizing: border-box;
  flex-shrink: 0;
}

.admin-layout__header-left,
.admin-layout__header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.admin-layout__header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  cursor: pointer;
  border-radius: 4px;
  color: var(--amu-color-text-secondary);
  transition: all 0.2s;
}

.admin-layout__header-icon:hover {
  background: var(--amu-color-bg-fill);
  color: var(--amu-color-text);
}

.admin-layout__refresh-icon--spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.admin-layout__breadcrumb-item {
  display: flex;
  align-items: center;
  color: var(--amu-color-text-secondary);
  cursor: default;
}

.admin-layout__breadcrumb-item--clickable {
  cursor: pointer;
  transition: color 0.2s;
}

.admin-layout__breadcrumb-item--clickable:hover {
  color: var(--amu-color-text);
}

.admin-layout__breadcrumb-icon {
  margin-right: 4px;
}

.admin-layout__user {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: background 0.2s;
}

.admin-layout__user:hover {
  background: var(--amu-color-bg-fill);
}

.admin-layout__user-avatar-trigger {
  position: relative;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.admin-layout__user-avatar-trigger img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  background: var(--amu-color-bg-fill);
}

.admin-layout__user-status-dot {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  background-color: var(--amu-color-status-success);
  border: 2px solid var(--amu-color-bg-elevated);
  border-radius: 50%;
  z-index: 1;
}

.admin-layout__user-dropdown {
  min-width: 240px;
  padding: 8px 0;
}

.admin-layout__user-dropdown :deep(.amu-dropdown-item) {
  padding-top: 10px;
  padding-bottom: 10px;
}

.admin-layout__user-info {
  display: flex;
  align-items: center;
  padding: 8px 16px 12px;
  gap: 12px;
}

.admin-layout__user-info-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #f0f0f0;
}

.admin-layout__user-info-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.admin-layout__user-info-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--amu-color-text);
  display: flex;
  align-items: center;
  gap: 8px;
}

.admin-layout__user-tag {
  font-size: 12px;
  padding: 1px 6px;
  border-radius: 4px;
  background: rgba(16, 185, 129, 0.1);
  color: var(--amu-color-status-success);
  font-weight: 500;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.admin-layout__user-info-email {
  font-size: 13px;
  margin-top: 4px;
  color: var(--amu-color-text-secondary);
}

.admin-layout__user-divider {
  height: 1px;
  background-color: var(--amu-color-border);
  margin: 4px 0;
}

.admin-layout__user-item-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.admin-layout__user-shortcut {
  font-size: 12px;
  color: var(--amu-color-text-disabled);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

.admin-layout__header-icon--badge {
  position: relative;
}

.admin-layout__badge {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 6px;
  height: 6px;
  background: var(--amu-color-status-danger);
  border-radius: 50%;
  border: 1px solid var(--amu-color-bg-elevated);
}

.admin-layout__notification-panel {
  width: 320px;
  display: flex;
  flex-direction: column;
}

.admin-layout__notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--amu-color-border);
}

.admin-layout__notification-header-icon {
  color: var(--amu-color-text-secondary);
  cursor: pointer;
}

.admin-layout__notification-title {
  margin: 0;
  color: var(--amu-color-text);
  font-size: 16px;
  font-weight: 600;
}

.admin-layout__notification-tabs-container {
  padding: 8px 16px 0;
}

.admin-layout__notification-tabs {
  display: flex;
  gap: 2px;
  background: var(--amu-color-bg-fill);
  padding: 3px;
  border-radius: 6px;
}

.admin-layout__notification-tab {
  padding: 3px 11px;
  border: 1px solid transparent;
  font-size: 13px;
  color: var(--amu-color-text-secondary);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.admin-layout__notification-tab:hover {
  color: var(--amu-color-text);
}

.admin-layout__notification-tab.is-active {
  background: var(--amu-color-bg-elevated);
  color: var(--amu-color-primary);
  box-shadow: 0 1px 4px color-mix(in srgb, var(--amu-color-text) 10%, transparent);
  border: 1px solid var(--amu-color-border);
}

.admin-layout__notification-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--amu-color-border);
  transition: background-color 0.2s;
  cursor: pointer;
}

.admin-layout__notification-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 16px;
  font-weight: 500;
  flex-shrink: 0;
  background: var(--amu-color-primary);
  /* 使用 gradient 让色彩更丰富、立体 */
  background-image: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(0, 0, 0, 0.1) 100%);
  box-shadow: 0 2px 4px color-mix(in srgb, var(--amu-color-text) 10%, transparent);
}

.admin-layout__notification-item:hover {
  background-color: var(--amu-color-bg-fill);
}

.admin-layout__notification-item:last-child {
  border-bottom: none;
}

.admin-layout__notification-item.is-read {
  opacity: 0.6;
}

.admin-layout__notification-item.is-read .admin-layout__notification-item-title {
  font-weight: 400;
}

.admin-layout__notification-content {
  flex: 1;
  min-width: 0;
}

.admin-layout__notification-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.admin-layout__notification-item-title {
  color: var(--amu-color-text);
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}

.admin-layout__notification-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--amu-color-primary);
  flex-shrink: 0;
  margin-left: 2px;
}

.admin-layout__notification-item-desc {
  color: var(--amu-color-text-secondary);
  font-size: 13px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.admin-layout__notification-item-time {
  margin-top: 6px;
  color: var(--amu-color-text-disabled);
  font-size: 12px;
}

.admin-layout__notification-actions {
  display: flex;
  align-items: center;
  align-self: center;
  margin-left: 8px;
}

.admin-layout__notification-action {
  opacity: 0;
  transition: opacity 0.2s, color 0.2s;
  padding: 4px;
  height: auto;
  color: var(--amu-color-text-secondary);
}

.admin-layout__notification-action:hover {
  color: var(--amu-color-primary);
}

.admin-layout__notification-item:hover .admin-layout__notification-action {
  opacity: 1;
}

.admin-layout__notification-footer {
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--amu-color-border);
}

.admin-layout__notification-footer-left {
  display: flex;
}

.admin-layout__notification-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 0;
  color: var(--amu-color-text-disabled);
  font-size: 13px;
}

.admin-layout__notification-empty-icon {
  font-size: 32px;
  margin-bottom: 12px;
  opacity: 0.5;
}

:global(.admin-search-dialog) {
  border-radius: 12px !important;
  overflow: hidden;
  box-shadow: var(--amu-shadow-md) !important;
  border: 1px solid var(--amu-color-border) !important;
}

:global(.admin-search-dialog:focus),
:global(.admin-search-dialog:focus-visible) {
  outline: none !important;
}

:global(.admin-search-dialog .amu-dialog-header) {
  display: none !important;
}

:global(.admin-search-dialog .amu-dialog-body) {
  padding: 0 !important;
}

.admin-search {
  display: flex;
  flex-direction: column;
  background: var(--amu-color-bg-elevated);
}

.admin-search__header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--amu-color-border);
  background: var(--amu-color-bg-elevated);
}

.admin-search__main-icon {
  color: var(--amu-color-primary);
}

.admin-search__input {
  flex: 1;
}

.admin-search__input :deep(.amu-input-wrapper) {
  background: transparent;
}

.admin-search__input :deep(.amu-input__inner-wrapper) {
  border: none;
  box-shadow: none;
  background: transparent;
}

.admin-search__input :deep(.amu-input__inner) {
  font-size: 15px;
  font-weight: 500;
  height: 40px;
}

.admin-search__close {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--amu-color-text-secondary);
  cursor: pointer;
  transition: color 0.2s;
}

.admin-search__close:hover {
  color: var(--amu-color-text);
}

.admin-search__esc {
  font-size: 12px;
  font-weight: 600;
  color: var(--amu-color-text-secondary);
  background: var(--amu-color-bg-fill);
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid var(--amu-color-border);
}

.admin-search__result {
  padding: 14px 16px;
  background: var(--amu-color-bg-elevated);
}

.admin-search__section-title {
  display: none;
}

.admin-search__item {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 0 18px;
  min-height: 55px;
  border-radius: 10px;
  cursor: pointer;
  margin-bottom: 10px;
  border: none;
  background: var(--amu-color-bg-fill);

}

.admin-search__item:last-child {
  margin-bottom: 0;
}

.admin-search__item:hover,
.admin-search__item.is-active {
  background: var(--amu-color-primary);
}

.admin-search__item-icon {
  color: var(--amu-color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 0;
  background: transparent;
}

.admin-search__item.is-active .admin-search__item-icon {
  color: var(--amu-color-on-solid);
  background: transparent;
  box-shadow: none;
}

.admin-search__item-content {
  flex: 1;
  display: flex;
  align-items: center;
}

.admin-search__item-title {
  color: var(--amu-color-text);
  font-size: 16px;

  line-height: 1;
}

.admin-search__item.is-active .admin-search__item-title {
  color: var(--amu-color-on-solid);
}

.admin-search__item-path {
  display: none;
}

.admin-search__item-enter {
  color: var(--amu-color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  background: transparent;
  border-radius: 0;
}

.admin-search__item.is-active .admin-search__item-enter {
  color: var(--amu-color-on-solid);
}

.admin-search__empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 56px 0;
  color: var(--amu-color-text-secondary);
  opacity: 0.8;
}

.admin-search__empty-icon {
  margin-bottom: 12px;
  opacity: 0.3;
}

.admin-search__empty-text {
  font-size: 13px;
  letter-spacing: 0;
}

.admin-search__empty {
  display: flex;
  flex-direction: column;
}

.admin-search__section {
  text-align: left;
  margin-bottom: 10px;
}

.admin-search__section-title {
  display: none;
  margin-bottom: 12px;
  padding: 0 8px;
  color: var(--amu-color-text-secondary);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.admin-search__item-title :deep(.admin-search__mark),
.admin-search__item-path :deep(.admin-search__mark) {
  color: var(--amu-color-primary);
  font-weight: bold;
}

:deep(.admin-search__mark) {
  color: var(--amu-color-primary);
  font-weight: bold;
}

.admin-search__footer {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  border-top: 1px solid var(--amu-color-border);
  background: var(--amu-color-bg-elevated);
  gap: 14px;
  font-size: 12px;
  color: var(--amu-color-text-secondary);
}

.admin-search__footer-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.admin-search__key {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 12px;
  font-weight: 600;
  color: var(--amu-color-text-secondary);
}
</style>
