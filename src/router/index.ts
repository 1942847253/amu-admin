import { createRouter, createWebHistory } from 'vue-router'
import type { RouteLocationNormalized } from 'vue-router'
import { staticRoutes } from './routes'
import { useAuthStore } from '../store/auth'
import { usePermissionStore } from '../store/permission'
import { useAppStore } from '../store/app'
import { findMenuNode, resolveFirstLeafKey } from '../utils/menu-tree'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: staticRoutes
})

const titleMapEn: Record<string, string> = {
  登录: 'Login',
  无权限: 'Forbidden',
  视图: 'View',
  工作台: 'Workplace',
  仪表盘: 'Dashboard',
  示例: 'Examples',
  表单: 'Forms',
  基础表单: 'Basic Form',
  查询表单: 'Search Form',
  表单校验: 'Form Validation',
  动态表单: 'Dynamic Form',
  自定义布局: 'Custom Layout',
  按钮: 'Buttons',
  基础按钮: 'Basic Buttons',
  按钮组合: 'Button Groups',
  按钮状态: 'Button States',
  表格: 'Tables',
  基础表格: 'Basic Table',
  分页表格: 'Pagination Table',
  状态表格: 'State Table',
  空态与加载: 'Empty And Loading',
  数据展示: 'Data Display',
  文本省略: 'Text Ellipsis',
  详情页: 'Detail Page',
  统计概览: 'Statistics Overview',
  导航示例: 'Navigation',
  面包屑: 'Breadcrumb',
  标签页: 'Tabs',
  下拉菜单: 'Dropdown',
  弹窗反馈: 'Feedback Overlays',
  对话框: 'Dialog',
  二次确认: 'Confirmation',
  抽屉: 'Drawer',
  加载反馈: 'Loading Feedback',
  按钮加载: 'Button Loading',
  区域加载: 'Area Loading',
  全屏加载: 'Fullscreen Loading',
  系统管理: 'System',
  用户管理: 'Users',
  部门管理: 'Departments',
  角色管理: 'Roles',
  菜单管理: 'Menus',
  访问权限管理: 'Permissions',
  鉴权自测: 'Auth Debug',
  安全中心: 'Security',
  策略矩阵: 'Policy Matrix',
  审计日志: 'Audit Logs',
  个人中心: 'Personal Center',
  页面不存在: 'Not Found'
}

const getLocalizedTitle = (title: unknown, language: 'zh-CN' | 'en-US') => {
  const nextTitle = typeof title === 'string' && title.trim() ? title.trim() : 'amu-admin'
  if (language === 'zh-CN') return nextTitle
  return titleMapEn[nextTitle] || nextTitle
}

const ensureDynamicRoutes = (permissionStore: ReturnType<typeof usePermissionStore>) => {
  if (permissionStore.routeInjected) return

  const accessRoutes = permissionStore.generateRoutes()
  accessRoutes.forEach((route) => {
    if (route.path === '/:pathMatch(.*)*') {
      router.addRoute(route)
      return
    }
    router.addRoute('Root', route)
  })
}

const sanitizeSessionState = async () => {
  const authStore = useAuthStore()
  const permissionStore = usePermissionStore()

  const hasTokenButNoUser = !authStore.user && (authStore.token || authStore.refreshTokenValue)
  if (!hasTokenButNoUser) {
    return
  }

  try {
    await authStore.hydrateSession()
  } catch {
    await authStore.logout()
    permissionStore.reset()
  }
}

const resolvePreInjectionAuthRedirect = (to: RouteLocationNormalized) => {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated && to.path !== '/login') {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  if (to.path === '/login' && authStore.isAuthenticated) {
    return { path: '/dashboard' }
  }

  return null
}

const resolveRouteInjectionRedirect = (to: RouteLocationNormalized) => {
  const permissionStore = usePermissionStore()
  if (permissionStore.routeInjected) {
    return null
  }

  ensureDynamicRoutes(permissionStore)
  return { path: to.fullPath, replace: true }
}

const resolveAuthRedirect = (to: RouteLocationNormalized) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  if (to.path === '/login' && authStore.isAuthenticated) {
    return { path: '/dashboard' }
  }

  return null
}

const resolvePermissionRedirect = (to: RouteLocationNormalized) => {
  const authStore = useAuthStore()
  const requiredPermission = to.meta.permission

  if (requiredPermission && !authStore.hasPermission(requiredPermission)) {
    return { path: '/403', replace: true }
  }

  return null
}

const resolveFirstLeafPath = (key: string) => {
  const permissionStore = usePermissionStore()
  return resolveFirstLeafKey(findMenuNode(permissionStore.menuTree, key))
}

const resolveParentRouteRedirect = (to: RouteLocationNormalized) => {
  const firstLeaf = resolveFirstLeafPath(to.path)
  if (!firstLeaf || firstLeaf === to.path) {
    return null
  }
  return { path: firstLeaf, replace: true }
}

router.beforeEach(async (to) => {
  window.dispatchEvent(new CustomEvent('amu-admin:route-start', { detail: { to: to.fullPath } }))

  await sanitizeSessionState()

  const preInjectionAuthRedirect = resolvePreInjectionAuthRedirect(to)
  if (preInjectionAuthRedirect) {
    return preInjectionAuthRedirect
  }

  const routeInjectionRedirect = resolveRouteInjectionRedirect(to)
  if (routeInjectionRedirect) {
    return routeInjectionRedirect
  }

  const authRedirect = resolveAuthRedirect(to)
  if (authRedirect) {
    return authRedirect
  }

  const permissionRedirect = resolvePermissionRedirect(to)
  if (permissionRedirect) {
    return permissionRedirect
  }

  const parentRouteRedirect = resolveParentRouteRedirect(to)
  if (parentRouteRedirect) {
    return parentRouteRedirect
  }

  return true
})

router.afterEach((to) => {
  window.dispatchEvent(new CustomEvent('amu-admin:route-end', { detail: { to: to.fullPath } }))

  const appStore = useAppStore()
  if (!appStore.dynamicTitle) {
    document.title = 'amu-admin'
    return
  }

  const title = getLocalizedTitle(to.meta.title, appStore.language)
  document.title = `${title} - amu-admin`
})

export default router
