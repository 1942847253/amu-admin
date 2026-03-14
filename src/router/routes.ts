import { h, markRaw } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import { RouterView } from 'vue-router'

export type AppRouteMeta = {
  title: string
  requiresAuth?: boolean
  permission?: string | string[]
  menu?: boolean
  keepAlive?: boolean
}

const RouteView = markRaw({ render: () => h(RouterView) })

export const staticRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('../views/ForbiddenView.vue'),
    meta: { title: '无权限' }
  },
  {
    path: '/',
    name: 'Root',
    component: () => import('../layouts/AdminLayout.vue'),
    meta: { title: '视图' },
    redirect: '/workplace',
    children: []
  }
]

export const asyncRoutes: RouteRecordRaw[] = [
  {
    path: '/workplace',
    name: 'Workplace',
    component: () => import('../views/WorkplaceView.vue'),
    meta: { title: '工作台', requiresAuth: true, menu: true, keepAlive: true } satisfies AppRouteMeta
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { title: '仪表盘', requiresAuth: true, menu: true, keepAlive: true } satisfies AppRouteMeta
  },
  {
    path: '/examples',
    name: 'Examples',
    component: RouteView,
    meta: { title: '示例', requiresAuth: true, menu: true } satisfies AppRouteMeta,
    children: [
      {
        path: 'form',
        name: 'ExamplesFormGroup',
        component: RouteView,
        meta: { title: '表单', requiresAuth: true, permission: 'examples:view', menu: true } satisfies AppRouteMeta,
        children: [
          {
            path: 'basic',
            name: 'ExamplesFormBasic',
            component: () => import('../views/ExamplesFormView.vue'),
            meta: { title: '基础表单', requiresAuth: true, permission: 'examples:view', menu: true, keepAlive: true } satisfies AppRouteMeta
          },
          {
            path: 'search',
            name: 'ExamplesFormSearch',
            component: () => import('../views/ExamplesFormSearchView.vue'),
            meta: { title: '查询表单', requiresAuth: true, permission: 'examples:view', menu: true, keepAlive: true } satisfies AppRouteMeta
          },
          {
            path: 'validation',
            name: 'ExamplesFormValidation',
            component: () => import('../views/ExamplesFormValidationView.vue'),
            meta: { title: '表单校验', requiresAuth: true, permission: 'examples:view', menu: true, keepAlive: true } satisfies AppRouteMeta
          },
          {
            path: 'dynamic',
            name: 'ExamplesFormDynamic',
            component: () => import('../views/ExamplesFormDynamicView.vue'),
            meta: { title: '动态表单', requiresAuth: true, permission: 'examples:view', menu: true, keepAlive: true } satisfies AppRouteMeta
          },
          {
            path: 'layout',
            name: 'ExamplesFormLayout',
            component: () => import('../views/ExamplesFormLayoutView.vue'),
            meta: { title: '自定义布局', requiresAuth: true, permission: 'examples:view', menu: true, keepAlive: true } satisfies AppRouteMeta
          }
        ]
      },
      {
        path: 'buttons',
        name: 'ExamplesButtonsGroup',
        component: RouteView,
        meta: { title: '按钮', requiresAuth: true, permission: 'examples:view', menu: true } satisfies AppRouteMeta,
        children: [
          {
            path: 'basic',
            name: 'ExamplesButtonsBasic',
            component: () => import('../views/ExamplesButtonsBasicView.vue'),
            meta: { title: '基础按钮', requiresAuth: true, permission: 'examples:view', menu: true, keepAlive: true } satisfies AppRouteMeta
          },
          {
            path: 'group',
            name: 'ExamplesButtonsGroupDetail',
            component: () => import('../views/ExamplesButtonsView.vue'),
            meta: { title: '按钮组合', requiresAuth: true, permission: 'examples:view', menu: true, keepAlive: true } satisfies AppRouteMeta
          },
          {
            path: 'state',
            name: 'ExamplesButtonsState',
            component: () => import('../views/ExamplesButtonsStateView.vue'),
            meta: { title: '按钮状态', requiresAuth: true, permission: 'examples:view', menu: true, keepAlive: true } satisfies AppRouteMeta
          }
        ]
      },
      {
        path: 'table',
        name: 'ExamplesTableGroup',
        component: RouteView,
        meta: { title: '表格', requiresAuth: true, permission: 'examples:view', menu: true } satisfies AppRouteMeta,
        children: [
          {
            path: 'basic',
            name: 'ExamplesTableBasic',
            component: () => import('../views/ExamplesTableBasicView.vue'),
            meta: { title: '基础表格', requiresAuth: true, permission: 'examples:view', menu: true, keepAlive: true } satisfies AppRouteMeta
          },
          {
            path: 'pagination',
            name: 'ExamplesTablePagination',
            component: () => import('../views/ExamplesTablePaginationView.vue'),
            meta: { title: '分页表格', requiresAuth: true, permission: 'examples:view', menu: true, keepAlive: true } satisfies AppRouteMeta
          },
          {
            path: 'states',
            name: 'ExamplesTableStates',
            component: () => import('../views/ExamplesTableView.vue'),
            meta: { title: '状态表格', requiresAuth: true, permission: 'examples:view', menu: true, keepAlive: true } satisfies AppRouteMeta
          },
          {
            path: 'empty',
            name: 'ExamplesTableEmpty',
            component: () => import('../views/ExamplesTableEmptyView.vue'),
            meta: { title: '空态与加载', requiresAuth: true, permission: 'examples:view', menu: true, keepAlive: true } satisfies AppRouteMeta
          }
        ]
      },
      {
        path: 'display',
        name: 'ExamplesDisplayGroup',
        component: RouteView,
        meta: { title: '数据展示', requiresAuth: true, permission: 'examples:view', menu: true } satisfies AppRouteMeta,
        children: [
          {
            path: 'ellipsis',
            name: 'ExamplesDisplayEllipsis',
            component: () => import('../views/ExamplesEllipsisView.vue'),
            meta: { title: '文本省略', requiresAuth: true, permission: 'examples:view', menu: true, keepAlive: true } satisfies AppRouteMeta
          },
          {
            path: 'detail',
            name: 'ExamplesDisplayDetail',
            component: () => import('../views/ExamplesDetailView.vue'),
            meta: { title: '详情页', requiresAuth: true, permission: 'examples:view', menu: true, keepAlive: true } satisfies AppRouteMeta
          },
          {
            path: 'stats',
            name: 'ExamplesDisplayStats',
            component: () => import('../views/ExamplesDisplayStatsView.vue'),
            meta: { title: '统计概览', requiresAuth: true, permission: 'examples:view', menu: true, keepAlive: true } satisfies AppRouteMeta
          }
        ]
      },
      {
        path: 'navigation',
        name: 'ExamplesNavigationGroup',
        component: RouteView,
        meta: { title: '导航示例', requiresAuth: true, permission: 'examples:view', menu: true } satisfies AppRouteMeta,
        children: [
          {
            path: 'breadcrumb',
            name: 'ExamplesNavigationBreadcrumb',
            component: () => import('../views/ExamplesNavigationBreadcrumbView.vue'),
            meta: { title: '面包屑', requiresAuth: true, permission: 'examples:view', menu: true, keepAlive: true } satisfies AppRouteMeta
          },
          {
            path: 'tabs',
            name: 'ExamplesNavigationTabs',
            component: () => import('../views/ExamplesNavigationTabsView.vue'),
            meta: { title: '标签页', requiresAuth: true, permission: 'examples:view', menu: true, keepAlive: true } satisfies AppRouteMeta
          },
          {
            path: 'dropdown',
            name: 'ExamplesNavigationDropdown',
            component: () => import('../views/ExamplesNavigationDropdownView.vue'),
            meta: { title: '下拉菜单', requiresAuth: true, permission: 'examples:view', menu: true, keepAlive: true } satisfies AppRouteMeta
          }
        ]
      },
      {
        path: 'feedback',
        name: 'ExamplesFeedbackGroup',
        component: RouteView,
        meta: { title: '弹窗反馈', requiresAuth: true, permission: 'examples:view', menu: true } satisfies AppRouteMeta,
        children: [
          {
            path: 'dialog',
            name: 'ExamplesFeedbackDialog',
            component: () => import('../views/ExamplesFeedbackView.vue'),
            meta: { title: '对话框', requiresAuth: true, permission: 'examples:view', menu: true, keepAlive: true } satisfies AppRouteMeta
          },
          {
            path: 'confirm',
            name: 'ExamplesFeedbackConfirm',
            component: () => import('../views/ExamplesFeedbackConfirmView.vue'),
            meta: { title: '二次确认', requiresAuth: true, permission: 'examples:view', menu: true, keepAlive: true } satisfies AppRouteMeta
          },
          {
            path: 'drawer',
            name: 'ExamplesFeedbackDrawer',
            component: () => import('../views/ExamplesFeedbackDrawerView.vue'),
            meta: { title: '抽屉', requiresAuth: true, permission: 'examples:view', menu: true, keepAlive: true } satisfies AppRouteMeta
          }
        ]
      },
      {
        path: 'loading',
        name: 'ExamplesLoadingGroup',
        component: RouteView,
        meta: { title: '加载反馈', requiresAuth: true, permission: 'examples:view', menu: true } satisfies AppRouteMeta,
        children: [
          {
            path: 'button',
            name: 'ExamplesLoadingButton',
            component: () => import('../views/ExamplesLoadingButtonView.vue'),
            meta: { title: '按钮加载', requiresAuth: true, permission: 'examples:view', menu: true, keepAlive: true } satisfies AppRouteMeta
          },
          {
            path: 'area',
            name: 'ExamplesLoadingArea',
            component: () => import('../views/ExamplesLoadingView.vue'),
            meta: { title: '区域加载', requiresAuth: true, permission: 'examples:view', menu: true, keepAlive: true } satisfies AppRouteMeta
          },
          {
            path: 'fullscreen',
            name: 'ExamplesLoadingFullscreen',
            component: () => import('../views/ExamplesLoadingFullscreenView.vue'),
            meta: { title: '全屏加载', requiresAuth: true, permission: 'examples:view', menu: true, keepAlive: true } satisfies AppRouteMeta
          }
        ]
      }
    ]
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/ProfileView.vue'),
    meta: { title: '个人中心', requiresAuth: true, menu: false, keepAlive: true } satisfies AppRouteMeta
  },
  {
    path: '/system',
    name: 'System',
    component: RouteView,
    meta: { title: '系统管理', requiresAuth: true, menu: true } satisfies AppRouteMeta,
    children: [
      {
        path: 'users',
        name: 'SystemUsers',
        component: () => import('../views/SystemUsersView.vue'),
        meta: { title: '用户管理', requiresAuth: true, permission: 'system:user:read', menu: true, keepAlive: true } satisfies AppRouteMeta
      },
      {
        path: 'departments',
        name: 'SystemDepartments',
        component: () => import('../views/SystemDepartmentsView.vue'),
        meta: { title: '部门管理', requiresAuth: true, permission: 'system:department:read', menu: true, keepAlive: true } satisfies AppRouteMeta
      },
      {
        path: 'roles',
        name: 'SystemRoles',
        component: () => import('../views/SystemRolesView.vue'),
        meta: { title: '角色管理', requiresAuth: true, permission: 'system:role:read', menu: true, keepAlive: true } satisfies AppRouteMeta
      },
      {
        path: 'menus',
        name: 'SystemMenus',
        component: () => import('../views/SystemMenusView.vue'),
        meta: { title: '菜单管理', requiresAuth: true, permission: 'system:menu:read', menu: true, keepAlive: true } satisfies AppRouteMeta
      },
      {
        path: 'permissions',
        name: 'SystemPermissions',
        component: () => import('../views/SystemPermissionsView.vue'),
        meta: { title: '访问权限管理', requiresAuth: true, permission: 'system:permission:read', menu: true, keepAlive: true } satisfies AppRouteMeta
      },
      {
        path: 'auth-debug',
        name: 'SystemAuthDebug',
        component: () => import('../views/SystemAuthDebugView.vue'),
        meta: { title: '鉴权自测', requiresAuth: true, permission: 'system:auth:debug', menu: true } satisfies AppRouteMeta
      }
    ]
  },
  {
    path: '/security',
    name: 'Security',
    component: RouteView,
    meta: { title: '安全中心', requiresAuth: true, menu: true } satisfies AppRouteMeta,
    children: [
      {
        path: 'policy-matrix',
        name: 'SecurityPolicyMatrix',
        component: () => import('../views/SecurityPolicyMatrixView.vue'),
        meta: { title: '策略矩阵', requiresAuth: true, permission: 'security:policy:read', menu: true, keepAlive: true } satisfies AppRouteMeta
      },
      {
        path: 'audit-logs',
        name: 'SecurityAuditLogs',
        component: () => import('../views/SecurityAuditLogsView.vue'),
        meta: { title: '审计日志', requiresAuth: true, permission: 'audit:log:read', menu: true, keepAlive: true } satisfies AppRouteMeta
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFoundView.vue'),
    meta: { title: '页面不存在' }
  }
]
