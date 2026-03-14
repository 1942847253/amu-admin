import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export interface VisitedTab {
  path: string
  title: string
  name?: string
  closable: boolean
  keepAlive: boolean
}

const DEFAULT_TAB: VisitedTab = {
  path: '/dashboard',
  title: '仪表盘',
  name: 'Dashboard',
  closable: false,
  keepAlive: true
}

export const useTabsStore = defineStore('tabs', () => {
  const visitedTabs = ref<VisitedTab[]>([DEFAULT_TAB])

  const cacheNames = computed(() => {
    return visitedTabs.value
      .filter((tab) => tab.keepAlive && tab.name)
      .map((tab) => tab.name as string)
  })

  const upsertTab = (tab: VisitedTab) => {
    const index = visitedTabs.value.findIndex((item) => item.path === tab.path)
    if (index === -1) {
      visitedTabs.value.push(tab)
      return
    }
    visitedTabs.value[index] = { ...visitedTabs.value[index], ...tab }
  }

  const removeTab = (path: string) => {
    const item = visitedTabs.value.find((tab) => tab.path === path)
    if (!item?.closable) return
    visitedTabs.value = visitedTabs.value.filter((tab) => tab.path !== path)
  }

  const removeLeft = (path: string) => {
    const currentIndex = visitedTabs.value.findIndex((tab) => tab.path === path)
    if (currentIndex === -1) return
    visitedTabs.value = visitedTabs.value.filter((tab, index) => {
      if (index >= currentIndex) return true
      return !tab.closable
    })
  }

  const removeRight = (path: string) => {
    const currentIndex = visitedTabs.value.findIndex((tab) => tab.path === path)
    if (currentIndex === -1) return
    visitedTabs.value = visitedTabs.value.filter((tab, index) => {
      if (index <= currentIndex) return true
      return !tab.closable
    })
  }

  const removeOthers = (path: string) => {
    visitedTabs.value = visitedTabs.value.filter((tab) => {
      if (tab.path === path) return true
      return !tab.closable
    })
  }

  const removeAll = () => {
    visitedTabs.value = visitedTabs.value.filter((tab) => !tab.closable)
  }

  const togglePin = (path: string) => {
    const tab = visitedTabs.value.find((t) => t.path === path)
    if (tab && tab.path !== '/dashboard') {
      tab.closable = !tab.closable
    }
  }

  const moveTab = (fromPath: string, toPath: string) => {
    if (fromPath === toPath) return

    const fromIndex = visitedTabs.value.findIndex((tab) => tab.path === fromPath)
    const toIndex = visitedTabs.value.findIndex((tab) => tab.path === toPath)
    if (fromIndex === -1 || toIndex === -1) return

    const [movingTab] = visitedTabs.value.splice(fromIndex, 1)
    visitedTabs.value.splice(toIndex, 0, movingTab)
  }

  const reset = () => {
    visitedTabs.value = [DEFAULT_TAB]
  }

  return {
    visitedTabs,
    cacheNames,
    upsertTab,
    removeTab,
    removeLeft,
    removeRight,
    removeOthers,
    removeAll,
    togglePin,
    moveTab,
    reset
  }
})
