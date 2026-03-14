import { useAppStore } from '../../store/app'
import type { Component } from 'vue'
import * as AmuIcons from '@amu-ui/icons'
import {
  IconBarChart,
  IconBook,
  IconCheckSquare,
  IconColumns,
  IconEdit3,
  IconFileText,
  IconFolder,
  IconLayers,
  IconLayout,
  IconLock,
  IconLoader,
  IconPlusSquare,
  IconSearch,
  IconTable,
  IconType,
  IconUser,
  IconUsers,
  IconShield,
  IconMonitor
} from '@amu-ui/icons'

export function useLayout() {
  const appStore = useAppStore()

  const menuIconMap: Record<string, Component> = {
    '/workplace': IconMonitor,
    '/dashboard': IconBarChart,
    '/examples': IconLayers,
    '/examples/form': IconEdit3,
    '/examples/form/basic': IconEdit3,
    '/examples/form/search': IconSearch,
    '/examples/form/validation': IconCheckSquare,
    '/examples/form/dynamic': IconPlusSquare,
    '/examples/form/layout': IconLayout,
    '/examples/buttons': IconColumns,
    '/examples/buttons/basic': IconBook,
    '/examples/buttons/group': IconColumns,
    '/examples/buttons/state': IconLoader,
    '/examples/table': IconTable,
    '/examples/table/basic': IconTable,
    '/examples/table/pagination': IconBook,
    '/examples/table/states': IconColumns,
    '/examples/table/empty': IconLoader,
    '/examples/display': IconFileText,
    '/examples/display/ellipsis': IconType,
    '/examples/display/detail': IconFileText,
    '/examples/display/stats': IconBarChart,
    '/examples/navigation': IconFolder,
    '/examples/navigation/breadcrumb': IconBook,
    '/examples/navigation/tabs': IconColumns,
    '/examples/navigation/dropdown': IconLayout,
    '/examples/feedback': IconLayout,
    '/examples/feedback/dialog': IconLayout,
    '/examples/feedback/confirm': IconCheckSquare,
    '/examples/feedback/drawer': IconColumns,
    '/examples/loading': IconLoader,
    '/examples/loading/button': IconBook,
    '/examples/loading/area': IconColumns,
    '/examples/loading/fullscreen': IconLoader,
    '/examples/detail': IconFileText,
    '/system': IconFolder,
    '/system/users': IconUser,
    '/system/roles': IconUsers,
    '/system/permissions': IconLock,
    '/system/auth-debug': IconShield,
    '/security': IconShield,
    '/security/policy-matrix': IconShield,
    '/security/audit-logs': IconShield
  }

  const resolveMenuIcon = (key: string, iconName?: string) => {
    if (iconName) {
      const resolved = (AmuIcons as Record<string, unknown>)[iconName]
      if (typeof resolved === 'object' || typeof resolved === 'function') {
        return resolved as Component
      }
    }
    if (key in menuIconMap) return menuIconMap[key]
    if (key.includes('analysis')) return IconBarChart
    return IconFolder
  }

  const routeTitleEnMap: Record<string, string> = {
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
    安全中心: 'Security',
    用户管理: 'Users',
    角色管理: 'Roles',
    访问权限管理: 'Permissions',
    鉴权自测: 'Auth Debug',
    策略矩阵: 'Policy Matrix',
    审计日志: 'Audit Logs',
    个人中心: 'Personal Center',
    页面不存在: 'Not Found'
  }

  const translateRouteTitle = (title: string) => {
    if (appStore.language === 'zh-CN') return title
    return routeTitleEnMap[title] || title
  }

  return {
    resolveMenuIcon,
    translateRouteTitle
  }
}
