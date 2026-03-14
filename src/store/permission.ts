import { computed, ref, shallowRef } from 'vue'
import { defineStore } from 'pinia'
import type { RouteRecordRaw } from 'vue-router'
import type { MenuNode as AuthMenuNode } from '../types/auth'
import { asyncRoutes } from '../router/routes'
import { useAuthStore } from './auth'

export interface MenuNode extends AuthMenuNode {}

const filterRoutesByPermission = (routes: RouteRecordRaw[], hasPermission: (value?: string | string[]) => boolean): RouteRecordRaw[] => {
  const result: RouteRecordRaw[] = []

  routes.forEach((route) => {
    const meta = route.meta ?? {}
    if (meta.permission && !hasPermission(meta.permission)) return

    const copied: RouteRecordRaw = { ...route }
    if (copied.children?.length) {
      copied.children = filterRoutesByPermission(copied.children, hasPermission)
    }

    if (copied.children && copied.children.length === 0 && route.path === '/system') {
      return
    }

    result.push(copied)
  })

  return result
}

const toMenuNodes = (routes: RouteRecordRaw[], parentPath = ''): MenuNode[] => {
  return routes
    .filter((item) => item.meta?.menu)
    .map((item) => {
      const fullPath = item.path.startsWith('/')
        ? item.path
        : `${parentPath.replace(/\/$/, '')}/${item.path}`
      const children = item.children ? toMenuNodes(item.children, fullPath) : undefined

      return {
        key: fullPath,
        title: item.meta?.title || String(item.name || fullPath),
        children: children && children.length ? children : undefined
      }
    })
}

export const usePermissionStore = defineStore('permission', () => {
  const routeRecords = shallowRef<RouteRecordRaw[]>([])
  const menuRecords = shallowRef<MenuNode[]>([])
  const routeInjected = ref(false)

  const availableRouteKeys = (routes: RouteRecordRaw[]) => {
    const keys = new Set<string>()
    const walk = (routeList: RouteRecordRaw[], parentPath = '') => {
      routeList.forEach((route) => {
        const currentPath = route.path.startsWith('/')
          ? route.path
          : `${parentPath}/${route.path}`.replace(/\/+/g, '/')
        keys.add(currentPath)
        if (route.children?.length) {
          walk(route.children, currentPath)
        }
      })
    }

    walk(routes)
    return keys
  }

  const filterMenuByRoutes = (menuList: MenuNode[], routeKeys: Set<string>): MenuNode[] => {
    return menuList.reduce<MenuNode[]>((result, menu) => {
      const children = menu.children ? filterMenuByRoutes(menu.children, routeKeys) : undefined
      if (!routeKeys.has(menu.key) && (!children || children.length === 0)) {
        return result
      }

      result.push({
        ...menu,
        children: children && children.length > 0 ? children : undefined
      })
      return result
    }, [])
  }

  const authStore = useAuthStore()

  const generateRoutes = () => {
    routeRecords.value = filterRoutesByPermission(asyncRoutes, authStore.hasPermission)
    const routeKeys = availableRouteKeys(routeRecords.value)
    menuRecords.value = authStore.menus.length > 0
      ? filterMenuByRoutes(authStore.menus, routeKeys)
      : toMenuNodes(routeRecords.value)
    routeInjected.value = true
    return routeRecords.value
  }

  const reset = () => {
    routeRecords.value = []
    menuRecords.value = []
    routeInjected.value = false
  }

  const menuTree = computed(() => menuRecords.value)

  return {
    routeRecords,
    menuRecords,
    routeInjected,
    menuTree,
    generateRoutes,
    reset
  }
})
