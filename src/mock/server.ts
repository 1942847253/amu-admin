import type { AccessDepartmentRow, AccessMenuRow, AccessPermissionRow, AccessRoleRow, AccessUserRow, AuditLogRow, PasswordResetResult, PolicyMatrixRow, UpsertDepartmentPayload, UpsertMenuPayload, UpsertPermissionPayload, UpsertRolePayload, UpsertUserPayload } from '../api/access-control'
import type { DashboardOverview } from '../api/dashboard'
import { DEMO_ACCOUNTS } from '../config/app'
import { asyncRoutes } from '../router/routes'
import type { AccessOverviewPayload, AuthSessionPayload, MenuNode, UserProfile, UserRole } from '../types/auth'
import type { ApiResponse, HttpResponseLike, ResolvedRequestConfig } from '../utils/request'

type UserStatus = 'ACTIVE' | 'LOCKED'
type MenuStatus = 'ACTIVE' | 'DISABLED'
type DataScope = 'ALL' | 'DEPARTMENT' | 'DEPARTMENT_AND_CHILDREN' | 'SELF' | 'CUSTOM'

interface MockUserRecord {
  id: string
  username: string
  displayName: string
  email: string
  departmentId: string
  title: string
  status: UserStatus
  roleCodes: string[]
  directPermissionCodes: string[]
  password: string
  avatarSeed: string
}

interface MockMenuRecord {
  id: string
  key: string
  title: string
  icon: string
  parentId?: string
  sortOrder: number
  permissionCodes: string[]
  menuType: 'DIRECTORY' | 'MENU'
  componentPath?: string
  status: MenuStatus
}

interface MockSessionRecord {
  id: string
  userId: string
  accessToken: string
  refreshToken: string
  accessExpiresAt: number
  refreshExpiresAt: number
}

interface MockDatabase {
  version: number
  users: MockUserRecord[]
  roles: AccessRoleRow[]
  permissions: AccessPermissionRow[]
  departments: AccessDepartmentRow[]
  menus: MockMenuRecord[]
  auditLogs: AuditLogRow[]
  sessions: MockSessionRecord[]
}

type MenuTreeRow = AccessMenuRow & { children: MenuTreeRow[] }

type SessionResolution =
  | { error: MockRouteResult<null> }
  | { session: MockSessionRecord; user: MockUserRecord }

interface MockRouteResult<T = unknown> {
  status: number
  payload: ApiResponse<T>
  delay?: number
}

const MOCK_DB_KEY = 'amu-admin-mock-db-v1'
const MOCK_DB_SCHEMA_VERSION = 2

const permissionSeeds: AccessPermissionRow[] = [
  { code: 'dashboard:view', name: '查看仪表盘', module: 'dashboard', apiScopes: ['GET:/api/dashboard/overview'] },
  { code: 'workplace:view', name: '查看工作台', module: 'dashboard', apiScopes: ['GET:/api/access-control/menus'] },
  { code: 'examples:view', name: '查看示例页面', module: 'examples', apiScopes: ['GET:/api/access-control/menus'] },
  { code: 'system:user:read', name: '查看用户', module: 'iam', apiScopes: ['GET:/api/access-control/users', 'GET:/api/access-control/departments'] },
  { code: 'system:user:write', name: '编辑用户', module: 'iam', apiScopes: ['POST:/api/access-control/users', 'PUT:/api/access-control/users/:id', 'POST:/api/access-control/users/:id/status', 'POST:/api/access-control/users/:id/reset-password', 'DELETE:/api/access-control/users/:id'] },
  { code: 'system:department:read', name: '查看部门', module: 'iam', apiScopes: ['GET:/api/access-control/department-catalog'] },
  { code: 'system:department:write', name: '编辑部门', module: 'iam', apiScopes: ['POST:/api/access-control/department-catalog', 'PUT:/api/access-control/department-catalog/:id', 'DELETE:/api/access-control/department-catalog/:id'] },
  { code: 'system:role:read', name: '查看角色', module: 'iam', apiScopes: ['GET:/api/access-control/roles'] },
  { code: 'system:role:write', name: '编辑角色', module: 'iam', apiScopes: ['POST:/api/access-control/roles', 'PUT:/api/access-control/roles/:id', 'DELETE:/api/access-control/roles/:id'] },
  { code: 'system:menu:read', name: '查看菜单', module: 'iam', apiScopes: ['GET:/api/access-control/menu-catalog'] },
  { code: 'system:menu:write', name: '编辑菜单', module: 'iam', apiScopes: ['POST:/api/access-control/menu-catalog', 'PUT:/api/access-control/menu-catalog/:id', 'DELETE:/api/access-control/menu-catalog/:id'] },
  { code: 'system:permission:read', name: '查看访问权限', module: 'iam', apiScopes: ['GET:/api/access-control/permissions'] },
  { code: 'system:permission:write', name: '编辑访问权限', module: 'iam', apiScopes: ['POST:/api/access-control/permissions', 'PUT:/api/access-control/permissions/:code', 'DELETE:/api/access-control/permissions/:code'] },
  { code: 'system:auth:debug', name: '访问鉴权调试', module: 'iam', apiScopes: ['GET:/api/access-control/policy-matrix'] },
  { code: 'audit:log:read', name: '查看审计日志', module: 'audit', apiScopes: ['GET:/api/access-control/audit-logs'] },
  { code: 'security:policy:read', name: '查看安全策略', module: 'security', apiScopes: ['GET:/api/access-control/policy-matrix'] },
  { code: '*', name: '超级权限', module: 'system', apiScopes: ['*'] }
]

const roleSeeds: AccessRoleRow[] = [
  { id: 'role-admin', code: 'platform_admin', name: '平台管理员', description: '拥有完整的系统管理权限', dataScope: 'ALL', permissionCodes: ['*'] },
  { id: 'role-operator', code: 'operations_manager', name: '运营负责人', description: '负责业务运营和用户治理', dataScope: 'DEPARTMENT_AND_CHILDREN', permissionCodes: ['dashboard:view', 'workplace:view', 'examples:view', 'system:user:read', 'system:user:write', 'system:department:read', 'system:department:write', 'system:role:read', 'system:menu:read', 'system:permission:read'] },
  { id: 'role-auditor', code: 'auditor', name: '审计员', description: '具备审计和只读权限', dataScope: 'ALL', permissionCodes: ['dashboard:view', 'examples:view', 'audit:log:read', 'system:role:read', 'system:permission:read'] },
  { id: 'role-security', code: 'security_officer', name: '安全管理员', description: '负责访问策略与审计安全', dataScope: 'CUSTOM', permissionCodes: ['dashboard:view', 'examples:view', 'security:policy:read', 'system:permission:read', 'system:auth:debug', 'audit:log:read', 'system:role:read'] },
  { id: 'role-release', code: 'release_manager', name: '发布管理员', description: '负责版本发布、变更窗口和值班协调', dataScope: 'DEPARTMENT_AND_CHILDREN', permissionCodes: ['dashboard:view', 'workplace:view', 'examples:view', 'system:user:read', 'system:menu:read', 'audit:log:read'] },
  { id: 'role-support', code: 'support_engineer', name: '平台支持工程师', description: '负责一线支持与工单处置', dataScope: 'SELF', permissionCodes: ['dashboard:view', 'workplace:view', 'examples:view'] }
]

const departmentSeeds: AccessDepartmentRow[] = [
  { id: 'root', name: '集团总部' },
  { id: 'platform', name: '平台架构中心', parentId: 'root' },
  { id: 'platform-fe', name: '前端体验组', parentId: 'platform' },
  { id: 'platform-release', name: '发布工程组', parentId: 'platform' },
  { id: 'operations', name: '业务运营中心', parentId: 'root' },
  { id: 'operations-growth', name: '增长运营组', parentId: 'operations' },
  { id: 'operations-service', name: '客户运营组', parentId: 'operations' },
  { id: 'security', name: '安全与合规中心', parentId: 'root' },
  { id: 'security-audit', name: '审计治理组', parentId: 'security' },
  { id: 'security-risk', name: '风险策略组', parentId: 'security' }
]

const auditLogSeeds: AuditLogRow[] = [
  { id: 'audit-1', operator: 'admin', action: '更新角色权限矩阵', resource: 'role:platform_admin', result: 'SUCCESS', createdAt: '2026-03-15 09:18:00' },
  { id: 'audit-2', operator: 'security', action: '轮换 refresh token 密钥', resource: 'auth:session', result: 'SUCCESS', createdAt: '2026-03-15 08:42:00' },
  { id: 'audit-3', operator: 'operator', action: '调整菜单可见范围', resource: 'menu:/system/users', result: 'SUCCESS', createdAt: '2026-03-14 19:26:00' },
  { id: 'audit-4', operator: 'audit', action: '导出权限审计报告', resource: 'audit:weekly-report', result: 'SUCCESS', createdAt: '2026-03-14 16:54:00' },
  { id: 'audit-5', operator: 'nancy.release', action: '关闭生产发布窗口', resource: 'release:window-cn-east', result: 'SUCCESS', createdAt: '2026-03-14 15:10:00' },
  { id: 'audit-6', operator: 'admin', action: '删除测试角色', resource: 'role:temp_debug', result: 'SUCCESS', createdAt: '2026-03-14 11:32:00' },
  { id: 'audit-7', operator: 'iris.compliance', action: '校验策略矩阵缺口', resource: 'policy:security_officer', result: 'SUCCESS', createdAt: '2026-03-13 18:05:00' },
  { id: 'audit-8', operator: 'leo.support', action: '重置租户管理员密码', resource: 'user:tenant-admin', result: 'SUCCESS', createdAt: '2026-03-13 14:44:00' }
]

const additionalUserSeeds: MockUserRecord[] = [
  {
    id: 'user-growth-olivia',
    username: 'olivia.ops',
    displayName: '增长运营专员',
    email: 'olivia.ops@amu-ui.com',
    departmentId: 'operations-growth',
    title: 'Growth Specialist',
    status: 'ACTIVE',
    roleCodes: ['operations_manager'],
    directPermissionCodes: [],
    password: '123456',
    avatarSeed: 'olivia-growth'
  },
  {
    id: 'user-release-nancy',
    username: 'nancy.release',
    displayName: '发布值班经理',
    email: 'nancy.release@amu-ui.com',
    departmentId: 'platform-release',
    title: 'Release Manager',
    status: 'ACTIVE',
    roleCodes: ['release_manager'],
    directPermissionCodes: ['system:auth:debug'],
    password: '123456',
    avatarSeed: 'nancy-release'
  },
  {
    id: 'user-support-leo',
    username: 'leo.support',
    displayName: '平台支持工程师',
    email: 'leo.support@amu-ui.com',
    departmentId: 'platform-fe',
    title: 'Support Engineer',
    status: 'LOCKED',
    roleCodes: ['support_engineer'],
    directPermissionCodes: [],
    password: '123456',
    avatarSeed: 'leo-support'
  },
  {
    id: 'user-compliance-iris',
    username: 'iris.compliance',
    displayName: '合规治理负责人',
    email: 'iris.compliance@amu-ui.com',
    departmentId: 'security-audit',
    title: 'Compliance Lead',
    status: 'ACTIVE',
    roleCodes: ['auditor', 'security_officer'],
    directPermissionCodes: ['system:user:read'],
    password: '123456',
    avatarSeed: 'iris-compliance'
  }
]

const dashboardMetricsByRole: Record<UserRole, DashboardOverview> = {
  admin: { visits: 98540, pendingTickets: 19, newUsers: 268 },
  operator: { visits: 64210, pendingTickets: 34, newUsers: 126 },
  auditor: { visits: 18840, pendingTickets: 11, newUsers: 23 },
  security: { visits: 27490, pendingTickets: 16, newUsers: 41 }
}

const customScopeDepartmentMap: Record<string, string[]> = {
  security_officer: ['security', 'security-audit', 'security-risk'],
  auditor: ['security', 'security-audit']
}

const visibleRoleCodeMap: Record<UserRole, string[]> = {
  admin: ['*'],
  operator: ['operations_manager', 'release_manager', 'support_engineer'],
  auditor: ['platform_admin', 'auditor', 'security_officer'],
  security: ['platform_admin', 'auditor', 'security_officer']
}

const visiblePermissionModuleMap: Record<UserRole, string[]> = {
  admin: ['*'],
  operator: ['dashboard', 'examples', 'iam'],
  auditor: ['audit', 'iam', 'security', 'dashboard', 'examples'],
  security: ['security', 'iam', 'audit', 'dashboard', 'examples']
}

const menuIconMap: Record<string, string> = {
  '/workplace': 'IconHome',
  '/dashboard': 'IconBarChart',
  '/examples': 'IconLayers',
  '/examples/form': 'IconEdit3',
  '/examples/buttons': 'IconColumns',
  '/examples/table': 'IconTable',
  '/examples/display': 'IconFileText',
  '/examples/navigation': 'IconFolder',
  '/examples/feedback': 'IconLayout',
  '/examples/loading': 'IconLoader',
  '/profile': 'IconUser',
  '/system': 'IconSettings',
  '/system/users': 'IconUser',
  '/system/departments': 'IconGitBranch',
  '/system/roles': 'IconShield',
  '/system/menus': 'IconMenu',
  '/system/permissions': 'IconLock',
  '/system/auth-debug': 'IconShield',
  '/security': 'IconShield',
  '/security/policy-matrix': 'IconFileText',
  '/security/audit-logs': 'IconFileText'
}

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

const slugify = (value: string) => value.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'root'

const nowString = () => new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')

const randomId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`

const getEnvSwitch = (value: string | undefined) => {
  const normalized = value?.trim().toLowerCase()
  if (normalized === 'true' || normalized === '1') return true
  if (normalized === 'false' || normalized === '0') return false
  return null
}

export const isMockApiEnabled = () => {
  const explicit = getEnvSwitch(import.meta.env.VITE_USE_MOCK_API)
  if (explicit !== null) return explicit
  return !import.meta.env.VITE_API_BASE_URL?.trim()
}

const guessComponentPath = (routeName: unknown, hasChildren: boolean) => {
  if (hasChildren) return ''
  if (typeof routeName !== 'string' || !routeName.trim()) return ''
  return `views/${routeName.trim()}View.vue`
}

const buildMenuSeeds = () => {
  const rows: MockMenuRecord[] = []

  const visit = (items: typeof asyncRoutes, parentPath = '', parentId = '') => {
    items.forEach((item, index) => {
      const meta = item.meta ?? {}
      if (!meta.menu) return

      const fullPath = item.path.startsWith('/')
        ? item.path
        : `${parentPath.replace(/\/$/, '')}/${item.path}`.replace(/\/+/g, '/')
      const id = `menu-${slugify(fullPath)}`
      const hasChildren = Boolean(item.children?.some((child: { meta?: { menu?: boolean } }) => child.meta?.menu))
      rows.push({
        id,
        key: fullPath,
        title: String(meta.title || item.name || fullPath),
        icon: menuIconMap[fullPath] || menuIconMap[parentPath] || 'IconMenu',
        parentId: parentId || undefined,
        sortOrder: index,
        permissionCodes: meta.permission ? (Array.isArray(meta.permission) ? [...meta.permission] : [meta.permission]) : [],
        menuType: hasChildren ? 'DIRECTORY' : 'MENU',
        componentPath: guessComponentPath(item.name, hasChildren) || undefined,
        status: 'ACTIVE'
      })

      if (item.children?.length) {
        visit(item.children as typeof asyncRoutes, fullPath, id)
      }
    })
  }

  visit(asyncRoutes)
  return rows
}

const userRoleAliasMap: Record<string, UserRole> = {
  platform_admin: 'admin',
  operations_manager: 'operator',
  auditor: 'auditor',
  security_officer: 'security'
}

const initialUsers = (): MockUserRecord[] => {
  return [
    ...DEMO_ACCOUNTS.map((account): MockUserRecord => ({
    id: account.id,
    username: account.username,
    displayName: account.displayName,
    email: account.email,
    departmentId: account.role === 'operator' ? 'operations' : account.role === 'security' || account.role === 'auditor' ? 'security' : 'platform',
    title: account.title,
    status: 'ACTIVE',
    roleCodes: [account.role === 'admin' ? 'platform_admin' : account.role === 'operator' ? 'operations_manager' : account.role === 'auditor' ? 'auditor' : 'security_officer'],
    directPermissionCodes: account.role === 'security' ? ['system:role:read'] : [],
    password: account.password,
    avatarSeed: account.avatarSeed
    })),
    ...clone(additionalUserSeeds)
  ]
}

const createInitialDatabase = (): MockDatabase => ({
  version: MOCK_DB_SCHEMA_VERSION,
  users: initialUsers(),
  roles: clone(roleSeeds),
  permissions: clone(permissionSeeds),
  departments: clone(departmentSeeds),
  menus: buildMenuSeeds(),
  auditLogs: clone(auditLogSeeds),
  sessions: []
})

export const resetMockDatabase = () => {
  const initial = createInitialDatabase()
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(MOCK_DB_KEY, JSON.stringify(initial))
  }
  return initial
}

const readDatabase = (): MockDatabase => {
  if (typeof localStorage === 'undefined') {
    return createInitialDatabase()
  }

  const raw = localStorage.getItem(MOCK_DB_KEY)
  if (!raw) {
    const initial = createInitialDatabase()
    localStorage.setItem(MOCK_DB_KEY, JSON.stringify(initial))
    return initial
  }

  try {
    const parsed = JSON.parse(raw) as Partial<MockDatabase>
    if (parsed.version !== MOCK_DB_SCHEMA_VERSION) {
      const initial = createInitialDatabase()
      localStorage.setItem(MOCK_DB_KEY, JSON.stringify(initial))
      return initial
    }
    return parsed as MockDatabase
  } catch {
    const initial = createInitialDatabase()
    localStorage.setItem(MOCK_DB_KEY, JSON.stringify(initial))
    return initial
  }
}

const writeDatabase = (database: MockDatabase) => {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(MOCK_DB_KEY, JSON.stringify(database))
}

const resolveRoleRows = (database: MockDatabase, roleCodes: string[]) => {
  return database.roles.filter((role) => roleCodes.includes(role.code))
}

const resolvePermissionCodes = (database: MockDatabase, user: MockUserRecord) => {
  const rolePermissions = resolveRoleRows(database, user.roleCodes).flatMap((role) => role.permissionCodes)
  const combined = new Set([...rolePermissions, ...user.directPermissionCodes])
  if (combined.has('*')) return ['*']
  return Array.from(combined)
}

const resolveDataScope = (database: MockDatabase, user: MockUserRecord): DataScope => {
  const role = resolveRoleRows(database, user.roleCodes)[0]
  return (role?.dataScope as DataScope | undefined) || 'SELF'
}

const resolveUserRole = (user: MockUserRecord): UserRole => {
  const primaryRoleCode = user.roleCodes[0]
  return userRoleAliasMap[primaryRoleCode] || 'operator'
}

const departmentNameMap = (database: MockDatabase) => new Map(database.departments.map((item) => [item.id, item.name]))

const toUserProfile = (database: MockDatabase, user: MockUserRecord): UserProfile => ({
  id: user.id,
  username: user.username,
  role: resolveUserRole(user),
  displayName: user.displayName,
  email: user.email,
  department: departmentNameMap(database).get(user.departmentId) || user.departmentId,
  title: user.title,
  avatarSeed: user.avatarSeed
})

const buildMenuTree = (database: MockDatabase) => {
  const nodes = new Map<string, MenuTreeRow>()
  database.menus.forEach((menu) => {
    nodes.set(menu.id, { ...menu, children: [] })
  })

  const roots: MenuTreeRow[] = []
  nodes.forEach((node) => {
    if (node.parentId && nodes.has(node.parentId)) {
      nodes.get(node.parentId)?.children.push(node)
    } else {
      roots.push(node)
    }
  })

  const sortNodes = (items: MenuTreeRow[]) => {
    items.sort((left, right) => left.sortOrder - right.sortOrder || left.title.localeCompare(right.title, 'zh-CN'))
    items.forEach((item) => sortNodes(item.children))
  }

  sortNodes(roots)
  return roots as AccessMenuRow[]
}

const filterMenusByPermissions = (menus: AccessMenuRow[], permissions: string[]): AccessMenuRow[] => {
  const allowAll = permissions.includes('*')

  return menus.reduce<AccessMenuRow[]>((result, menu) => {
    if (menu.status !== 'ACTIVE') return result
    const children = menu.children?.length ? filterMenusByPermissions(menu.children, permissions) : undefined
    const allowed = allowAll
      || menu.permissionCodes.length === 0
      || menu.permissionCodes.some((code) => permissions.includes(code))
      || Boolean(children?.length)

    if (!allowed) return result

    result.push({
      ...menu,
      children: children && children.length > 0 ? children : undefined
    })
    return result
  }, [])
}

const toMenuNodes = (menus: AccessMenuRow[]): MenuNode[] => {
  return menus.map((menu) => ({
    key: menu.key,
    title: menu.title,
    icon: menu.icon,
    permission: menu.permissionCodes.length === 0 ? undefined : menu.permissionCodes,
    children: menu.children?.length ? toMenuNodes(menu.children) : undefined
  }))
}

const toAccessUserRow = (database: MockDatabase, user: MockUserRecord): AccessUserRow => ({
  id: user.id,
  username: user.username,
  displayName: user.displayName,
  email: user.email,
  title: user.title,
  status: user.status,
  department: departmentNameMap(database).get(user.departmentId) || user.departmentId,
  roleCodes: [...user.roleCodes],
  directPermissionCodes: [...user.directPermissionCodes]
})

const appendAuditLog = (database: MockDatabase, operator: string, action: string, resource: string, result = 'SUCCESS') => {
  database.auditLogs.unshift({
    id: randomId('audit'),
    operator,
    action,
    resource,
    result,
    createdAt: nowString()
  })
}

const resolveDashboardOverview = (database: MockDatabase, user: MockUserRecord): DashboardOverview => {
  const role = resolveUserRole(user)
  const seed = dashboardMetricsByRole[role]
  const activeUsers = database.users.filter((item) => item.status === 'ACTIVE').length
  const todayAuditCount = database.auditLogs.filter((item) => item.createdAt.startsWith('2026-03-15')).length

  return {
    visits: seed.visits + activeUsers * 13,
    pendingTickets: seed.pendingTickets + Math.max(todayAuditCount - 2, 0),
    newUsers: seed.newUsers + activeUsers
  }
}

const resolveChildrenDepartmentIds = (database: MockDatabase, departmentId: string): string[] => {
  const result = new Set<string>()
  const walk = (parentId: string) => {
    database.departments.forEach((department) => {
      if (department.parentId === parentId && !result.has(department.id)) {
        result.add(department.id)
        walk(department.id)
      }
    })
  }

  walk(departmentId)
  return Array.from(result)
}

const resolveAncestorDepartmentIds = (database: MockDatabase, departmentIds: string[]) => {
  const result = new Set<string>(departmentIds)
  const departmentMap = new Map(database.departments.map((item) => [item.id, item]))

  departmentIds.forEach((departmentId) => {
    let current = departmentMap.get(departmentId)
    while (current?.parentId) {
      result.add(current.parentId)
      current = departmentMap.get(current.parentId)
    }
  })

  return Array.from(result)
}

const resolveScopedDepartmentIds = (database: MockDatabase, user: MockUserRecord) => {
  const dataScope = resolveDataScope(database, user)
  if (dataScope === 'ALL') {
    return database.departments.map((item) => item.id)
  }

  if (dataScope === 'SELF') {
    return [user.departmentId]
  }

  if (dataScope === 'DEPARTMENT') {
    return [user.departmentId]
  }

  if (dataScope === 'DEPARTMENT_AND_CHILDREN') {
    return [user.departmentId, ...resolveChildrenDepartmentIds(database, user.departmentId)]
  }

  const scopedIds = new Set<string>()
  user.roleCodes.forEach((roleCode) => {
    customScopeDepartmentMap[roleCode]?.forEach((departmentId) => scopedIds.add(departmentId))
  })
  if (scopedIds.size === 0) {
    scopedIds.add(user.departmentId)
  }
  return Array.from(scopedIds)
}

const resolveVisibleUsers = (database: MockDatabase, user: MockUserRecord) => {
  const dataScope = resolveDataScope(database, user)
  if (dataScope === 'ALL') {
    return database.users
  }
  if (dataScope === 'SELF') {
    return database.users.filter((item) => item.id === user.id)
  }

  const scopedDepartmentIds = new Set(resolveScopedDepartmentIds(database, user))
  return database.users.filter((item) => scopedDepartmentIds.has(item.departmentId))
}

const resolveVisibleDepartments = (database: MockDatabase, user: MockUserRecord) => {
  const dataScope = resolveDataScope(database, user)
  if (dataScope === 'ALL') {
    return clone(database.departments)
  }

  const scopedDepartmentIds = resolveScopedDepartmentIds(database, user)
  const visibleDepartmentIds = new Set(resolveAncestorDepartmentIds(database, scopedDepartmentIds))
  return clone(database.departments.filter((item) => visibleDepartmentIds.has(item.id)))
}

const resolveVisibleAuditLogs = (database: MockDatabase, user: MockUserRecord) => {
  const dataScope = resolveDataScope(database, user)
  if (dataScope === 'ALL') {
    return clone(database.auditLogs)
  }

  const visibleOperatorIds = new Set(resolveVisibleUsers(database, user).map((item) => item.username))
  visibleOperatorIds.add(user.username)
  return clone(database.auditLogs.filter((item) => visibleOperatorIds.has(item.operator)))
}

const resolveVisibleRoles = (database: MockDatabase, user: MockUserRecord) => {
  const role = resolveUserRole(user)
  const allowedCodes = visibleRoleCodeMap[role]
  if (allowedCodes.includes('*')) {
    return clone(database.roles)
  }
  return clone(database.roles.filter((item) => allowedCodes.includes(item.code)))
}

const resolveVisiblePermissions = (database: MockDatabase, user: MockUserRecord) => {
  const role = resolveUserRole(user)
  const allowedModules = visiblePermissionModuleMap[role]
  if (allowedModules.includes('*')) {
    return clone(database.permissions)
  }
  return clone(database.permissions.filter((item) => allowedModules.includes(item.module)))
}

const resolveVisibleMenuCatalog = (database: MockDatabase, user: MockUserRecord) => {
  const permissions = resolvePermissionCodes(database, user)
  return filterMenusByPermissions(buildMenuCatalog(database), permissions)
}

const resolveVisiblePolicyMatrix = (database: MockDatabase, user: MockUserRecord): PolicyMatrixRow[] => {
  const visibleRoles = resolveVisibleRoles(database, user)
  const visiblePermissionCodes = new Set(resolveVisiblePermissions(database, user).map((item) => item.code))

  return visibleRoles.map((roleRow) => ({
    roleCode: roleRow.code,
    roleName: roleRow.name,
    dataScope: roleRow.dataScope,
    permissions: roleRow.permissionCodes
      .filter((code) => code === '*' || visiblePermissionCodes.has(code))
      .map((code) => {
        const permission = database.permissions.find((item) => item.code === code)
        return {
          code,
          name: permission?.name || code,
          module: permission?.module || 'system'
        }
      })
  }))
}

const ok = <T>(data: T, delay = 120): MockRouteResult<T> => ({
  status: 200,
  delay,
  payload: {
    code: 0,
    message: 'success',
    data
  }
})

const fail = (status: number, message: string, code = status): MockRouteResult<null> => ({
  status,
  delay: 120,
  payload: {
    code,
    message,
    data: null
  }
})

const readBearerToken = (config: ResolvedRequestConfig) => {
  const authorization = config.headers.Authorization || config.headers.authorization || ''
  const [, token] = authorization.match(/^Bearer\s+(.+)$/i) || []
  return token || ''
}

const requireSession = (database: MockDatabase, config: ResolvedRequestConfig): SessionResolution => {
  const token = readBearerToken(config)
  const session = database.sessions.find((item) => item.accessToken === token)
  if (!session) return { error: fail(401, '登录状态失效，请重新登录', 40101) }
  if (session.accessExpiresAt <= Date.now()) return { error: fail(401, '登录态失效，正在尝试刷新凭证', 40101) }
  const user = database.users.find((item) => item.id === session.userId)
  if (!user || user.status !== 'ACTIVE') return { error: fail(401, '账号不存在或已被禁用', 40101) }
  return { session, user }
}

const requirePermission = (database: MockDatabase, user: MockUserRecord, permission?: string) => {
  if (!permission) return null
  const permissions = resolvePermissionCodes(database, user)
  if (permissions.includes('*') || permissions.includes(permission)) return null
  return fail(403, '没有访问权限', 403)
}

const issueSession = (database: MockDatabase, user: MockUserRecord): AuthSessionPayload => {
  const accessToken = `mock-access-${randomId(user.username)}`
  const refreshToken = `mock-refresh-${randomId(user.username)}`
  const accessExpiresAt = Date.now() + 15 * 60 * 1000
  const refreshExpiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000
  database.sessions = database.sessions.filter((item) => item.userId !== user.id)
  database.sessions.push({
    id: randomId('session'),
    userId: user.id,
    accessToken,
    refreshToken,
    accessExpiresAt,
    refreshExpiresAt
  })
  writeDatabase(database)

  const permissions = resolvePermissionCodes(database, user)
  const menus = toMenuNodes(filterMenusByPermissions(buildMenuTree(database), permissions))
  return {
    accessToken,
    refreshToken,
    expiresIn: 15 * 60,
    currentUser: {
      ...toUserProfile(database, user),
      permissions,
      dataScope: resolveDataScope(database, user)
    },
    menus
  }
}

const extractIdFromUrl = (url: string, segment: string) => url.replace(segment, '').replace(/^\//, '')

const handleAuthRoutes = (database: MockDatabase, config: ResolvedRequestConfig): MockRouteResult => {
  if (config.url === '/api/auth/login' && config.method === 'POST') {
    const payload = (config.data || {}) as { username?: string; password?: string }
    const username = payload.username?.trim().toLowerCase() || ''
    const password = payload.password || ''
    const user = database.users.find((item) => item.username === username)
    if (!user || user.status !== 'ACTIVE') return fail(401, '账号不存在或已被禁用', 40101)
    if (user.password !== password) return fail(401, '用户名或密码错误', 40101)
    appendAuditLog(database, username, '登录控制台', `session:${username}`)
    return ok(issueSession(database, user), 180)
  }

  if (config.url === '/api/auth/refresh' && config.method === 'POST') {
    const payload = (config.data || {}) as { refreshToken?: string }
    const session = database.sessions.find((item) => item.refreshToken === payload.refreshToken)
    if (!session || session.refreshExpiresAt <= Date.now()) return fail(401, '刷新凭证失效，请重新登录', 40102)
    const user = database.users.find((item) => item.id === session.userId)
    if (!user || user.status !== 'ACTIVE') return fail(401, '刷新凭证失效，请重新登录', 40102)
    database.sessions = database.sessions.filter((item) => item.id !== session.id)
    appendAuditLog(database, user.username, '刷新访问凭证', `session:${user.username}`)
    return ok(issueSession(database, user), 180)
  }

  if (config.url === '/api/auth/profile' && config.method === 'GET') {
    const current = requireSession(database, config)
    if ('error' in current) return current.error
    const permissions = resolvePermissionCodes(database, current.user)
    return ok<AccessOverviewPayload>({
      currentUser: {
        ...toUserProfile(database, current.user),
        permissions,
        dataScope: resolveDataScope(database, current.user)
      },
      menus: toMenuNodes(filterMenusByPermissions(buildMenuTree(database), permissions)),
      departments: database.departments.map((item) => ({ ...item }))
    })
  }

  if (config.url === '/api/auth/logout' && config.method === 'POST') {
    const token = readBearerToken(config)
    const session = database.sessions.find((item) => item.accessToken === token)
    const sessionUser = session ? database.users.find((item) => item.id === session.userId) : null
    database.sessions = database.sessions.filter((item) => item.accessToken !== token)
    if (sessionUser) {
      appendAuditLog(database, sessionUser.username, '退出控制台', `session:${sessionUser.username}`)
    }
    writeDatabase(database)
    return ok({ success: true })
  }

  return fail(404, '接口未定义，请检查路由映射', 40401)
}

const handleDashboardRoutes = (database: MockDatabase, config: ResolvedRequestConfig): MockRouteResult => {
  const current = requireSession(database, config)
  if ('error' in current) return current.error
  const denied = requirePermission(database, current.user, 'dashboard:view')
  if (denied) return denied

  if (config.url === '/api/dashboard/overview' && config.method === 'GET') {
    const data = resolveDashboardOverview(database, current.user)
    return ok(data, 480)
  }

  return fail(404, '接口未定义，请检查路由映射', 40401)
}

const buildMenuCatalog = (database: MockDatabase) => buildMenuTree(database)

const handleAccessControlRoutes = (database: MockDatabase, config: ResolvedRequestConfig): MockRouteResult => {
  const current = requireSession(database, config)
  if ('error' in current) return current.error
  const operator = current.user.username

  if (config.url === '/api/access-control/menus' && config.method === 'GET') {
    return ok(toMenuNodes(filterMenusByPermissions(buildMenuCatalog(database), resolvePermissionCodes(database, current.user))))
  }

  if (config.url === '/api/access-control/users' && config.method === 'GET') {
    const denied = requirePermission(database, current.user, 'system:user:read')
    if (denied) return denied
    return ok(resolveVisibleUsers(database, current.user).map((item) => toAccessUserRow(database, item)))
  }

  if (config.url === '/api/access-control/users' && config.method === 'POST') {
    const denied = requirePermission(database, current.user, 'system:user:write')
    if (denied) return denied
    const payload = config.data as UpsertUserPayload
    if (database.users.some((item) => item.username === payload.username.trim().toLowerCase())) {
      return fail(400, '账号已存在', 50011)
    }
    const nextUser: MockUserRecord = {
      id: randomId('user'),
      username: payload.username.trim().toLowerCase(),
      displayName: payload.displayName.trim(),
      email: payload.email.trim(),
      departmentId: payload.departmentId,
      title: payload.title.trim(),
      status: payload.status,
      roleCodes: [...payload.roleCodes],
      directPermissionCodes: [...payload.directPermissionCodes],
      password: payload.password || '123456',
      avatarSeed: slugify(payload.username)
    }
    database.users.push(nextUser)
    appendAuditLog(database, operator, '新建用户', `user:${nextUser.username}`)
    writeDatabase(database)
    return ok(toAccessUserRow(database, nextUser))
  }

  if (config.url.startsWith('/api/access-control/users/') && config.method === 'PUT') {
    const denied = requirePermission(database, current.user, 'system:user:write')
    if (denied) return denied
    const id = extractIdFromUrl(config.url, '/api/access-control/users/')
    const payload = config.data as UpsertUserPayload
    const user = database.users.find((item) => item.id === id)
    if (!user) return fail(404, '用户不存在', 40401)
    Object.assign(user, {
      username: payload.username.trim().toLowerCase(),
      displayName: payload.displayName.trim(),
      email: payload.email.trim(),
      departmentId: payload.departmentId,
      title: payload.title.trim(),
      status: payload.status,
      roleCodes: [...payload.roleCodes],
      directPermissionCodes: [...payload.directPermissionCodes],
      password: payload.password || user.password
    })
    appendAuditLog(database, operator, '更新用户', `user:${user.username}`)
    writeDatabase(database)
    return ok(toAccessUserRow(database, user))
  }

  if (config.url.endsWith('/status') && config.method === 'POST') {
    const denied = requirePermission(database, current.user, 'system:user:write')
    if (denied) return denied
    const id = extractIdFromUrl(config.url, '/api/access-control/users/').replace('/status', '')
    const user = database.users.find((item) => item.id === id)
    if (!user) return fail(404, '用户不存在', 40401)
    user.status = ((config.data as { status?: UserStatus }).status || 'ACTIVE')
    appendAuditLog(database, operator, user.status === 'ACTIVE' ? '启用用户' : '锁定用户', `user:${user.username}`)
    writeDatabase(database)
    return ok(toAccessUserRow(database, user))
  }

  if (config.url.endsWith('/reset-password') && config.method === 'POST') {
    const denied = requirePermission(database, current.user, 'system:user:write')
    if (denied) return denied
    const id = extractIdFromUrl(config.url, '/api/access-control/users/').replace('/reset-password', '')
    const user = database.users.find((item) => item.id === id)
    if (!user) return fail(404, '用户不存在', 40401)
    user.password = '123456'
    appendAuditLog(database, operator, '重置用户密码', `user:${user.username}`)
    writeDatabase(database)
    const result: PasswordResetResult = { userId: user.id, temporaryPassword: '123456' }
    return ok(result)
  }

  if (config.url.startsWith('/api/access-control/users/') && config.method === 'DELETE') {
    const denied = requirePermission(database, current.user, 'system:user:write')
    if (denied) return denied
    const id = extractIdFromUrl(config.url, '/api/access-control/users/')
    const user = database.users.find((item) => item.id === id)
    if (!user) return fail(404, '用户不存在', 40401)
    database.users = database.users.filter((item) => item.id !== id)
    appendAuditLog(database, operator, '删除用户', `user:${user.username}`)
    writeDatabase(database)
    return ok({ success: true })
  }

  if (config.url === '/api/access-control/roles' && config.method === 'GET') {
    const denied = requirePermission(database, current.user, 'system:role:read')
    if (denied) return denied
    return ok(resolveVisibleRoles(database, current.user))
  }

  if (config.url === '/api/access-control/roles' && config.method === 'POST') {
    const denied = requirePermission(database, current.user, 'system:role:write')
    if (denied) return denied
    const payload = config.data as UpsertRolePayload
    const nextRole: AccessRoleRow = { id: randomId('role'), ...payload }
    database.roles.push(nextRole)
    appendAuditLog(database, operator, '新建角色', `role:${nextRole.code}`)
    writeDatabase(database)
    return ok(nextRole)
  }

  if (config.url.startsWith('/api/access-control/roles/') && config.method === 'PUT') {
    const denied = requirePermission(database, current.user, 'system:role:write')
    if (denied) return denied
    const id = extractIdFromUrl(config.url, '/api/access-control/roles/')
    const role = database.roles.find((item) => item.id === id)
    if (!role) return fail(404, '角色不存在', 40401)
    Object.assign(role, config.data as UpsertRolePayload)
    appendAuditLog(database, operator, '更新角色', `role:${role.code}`)
    writeDatabase(database)
    return ok(clone(role))
  }

  if (config.url.startsWith('/api/access-control/roles/') && config.method === 'DELETE') {
    const denied = requirePermission(database, current.user, 'system:role:write')
    if (denied) return denied
    const id = extractIdFromUrl(config.url, '/api/access-control/roles/')
    const role = database.roles.find((item) => item.id === id)
    if (!role) return fail(404, '角色不存在', 40401)
    database.roles = database.roles.filter((item) => item.id !== id)
    database.users.forEach((user) => {
      user.roleCodes = user.roleCodes.filter((code) => code !== role.code)
    })
    appendAuditLog(database, operator, '删除角色', `role:${role.code}`)
    writeDatabase(database)
    return ok({ success: true })
  }

  if (config.url === '/api/access-control/permissions' && config.method === 'GET') {
    const denied = requirePermission(database, current.user, 'system:permission:read')
    if (denied) return denied
    return ok(resolveVisiblePermissions(database, current.user))
  }

  if (config.url === '/api/access-control/permissions' && config.method === 'POST') {
    const denied = requirePermission(database, current.user, 'system:permission:write')
    if (denied) return denied
    const payload = config.data as UpsertPermissionPayload
    const nextPermission: AccessPermissionRow = { ...payload, apiScopes: [...payload.apiScopes] }
    database.permissions.push(nextPermission)
    appendAuditLog(database, operator, '新建访问权限', `permission:${nextPermission.code}`)
    writeDatabase(database)
    return ok(nextPermission)
  }

  if (config.url.startsWith('/api/access-control/permissions/') && config.method === 'PUT') {
    const denied = requirePermission(database, current.user, 'system:permission:write')
    if (denied) return denied
    const code = extractIdFromUrl(config.url, '/api/access-control/permissions/')
    const permission = database.permissions.find((item) => item.code === code)
    if (!permission) return fail(404, '访问权限不存在', 40401)
    Object.assign(permission, clone(config.data as UpsertPermissionPayload))
    appendAuditLog(database, operator, '更新访问权限', `permission:${permission.code}`)
    writeDatabase(database)
    return ok(clone(permission))
  }

  if (config.url.startsWith('/api/access-control/permissions/') && config.method === 'DELETE') {
    const denied = requirePermission(database, current.user, 'system:permission:write')
    if (denied) return denied
    const code = extractIdFromUrl(config.url, '/api/access-control/permissions/')
    database.permissions = database.permissions.filter((item) => item.code !== code)
    database.roles.forEach((role) => {
      role.permissionCodes = role.permissionCodes.filter((item) => item !== code)
    })
    database.users.forEach((user) => {
      user.directPermissionCodes = user.directPermissionCodes.filter((item) => item !== code)
    })
    database.menus.forEach((menu) => {
      menu.permissionCodes = menu.permissionCodes.filter((item) => item !== code)
    })
    appendAuditLog(database, operator, '删除访问权限', `permission:${code}`)
    writeDatabase(database)
    return ok({ success: true })
  }

  if (config.url === '/api/access-control/menu-catalog' && config.method === 'GET') {
    const denied = requirePermission(database, current.user, 'system:menu:read')
    if (denied) return denied
    return ok(resolveVisibleMenuCatalog(database, current.user))
  }

  if (config.url === '/api/access-control/menu-catalog' && config.method === 'POST') {
    const denied = requirePermission(database, current.user, 'system:menu:write')
    if (denied) return denied
    const payload = config.data as UpsertMenuPayload
    const nextMenu: MockMenuRecord = {
      id: randomId('menu'),
      parentId: payload.parentId || undefined,
      key: payload.key,
      title: payload.title,
      icon: payload.icon,
      sortOrder: payload.sortOrder,
      permissionCodes: [...payload.permissionCodes],
      menuType: payload.menuType,
      componentPath: payload.componentPath || undefined,
      status: payload.status
    }
    database.menus.push(nextMenu)
    appendAuditLog(database, operator, '新建菜单', `menu:${nextMenu.key}`)
    writeDatabase(database)
    return ok({ ...nextMenu })
  }

  if (config.url.startsWith('/api/access-control/menu-catalog/') && config.method === 'PUT') {
    const denied = requirePermission(database, current.user, 'system:menu:write')
    if (denied) return denied
    const id = extractIdFromUrl(config.url, '/api/access-control/menu-catalog/')
    const menu = database.menus.find((item) => item.id === id)
    if (!menu) return fail(404, '菜单不存在', 40401)
    Object.assign(menu, {
      parentId: (config.data as UpsertMenuPayload).parentId || undefined,
      ...clone(config.data as UpsertMenuPayload)
    })
    appendAuditLog(database, operator, '更新菜单', `menu:${menu.key}`)
    writeDatabase(database)
    return ok({ ...menu })
  }

  if (config.url.startsWith('/api/access-control/menu-catalog/') && config.method === 'DELETE') {
    const denied = requirePermission(database, current.user, 'system:menu:write')
    if (denied) return denied
    const id = extractIdFromUrl(config.url, '/api/access-control/menu-catalog/')
    const relatedIds = new Set<string>([id])
    let changed = true
    while (changed) {
      changed = false
      database.menus.forEach((menu) => {
        if (menu.parentId && relatedIds.has(menu.parentId) && !relatedIds.has(menu.id)) {
          relatedIds.add(menu.id)
          changed = true
        }
      })
    }
    database.menus = database.menus.filter((menu) => !relatedIds.has(menu.id))
    appendAuditLog(database, operator, '删除菜单', `menu:${id}`)
    writeDatabase(database)
    return ok({ success: true })
  }

  if (config.url === '/api/access-control/departments' && config.method === 'GET') {
    const denied = requirePermission(database, current.user, 'system:user:read')
    if (denied) return denied
    return ok(resolveVisibleDepartments(database, current.user))
  }

  if (config.url === '/api/access-control/department-catalog' && config.method === 'GET') {
    const denied = requirePermission(database, current.user, 'system:department:read')
    if (denied) return denied
    return ok(resolveVisibleDepartments(database, current.user))
  }

  if (config.url === '/api/access-control/department-catalog' && config.method === 'POST') {
    const denied = requirePermission(database, current.user, 'system:department:write')
    if (denied) return denied
    const payload = config.data as UpsertDepartmentPayload
    const nextDepartment: AccessDepartmentRow = { id: payload.id, name: payload.name, parentId: payload.parentId || undefined }
    database.departments.push(nextDepartment)
    appendAuditLog(database, operator, '新建部门', `department:${nextDepartment.id}`)
    writeDatabase(database)
    return ok(nextDepartment)
  }

  if (config.url.startsWith('/api/access-control/department-catalog/') && config.method === 'PUT') {
    const denied = requirePermission(database, current.user, 'system:department:write')
    if (denied) return denied
    const id = extractIdFromUrl(config.url, '/api/access-control/department-catalog/')
    const department = database.departments.find((item) => item.id === id)
    if (!department) return fail(404, '部门不存在', 40401)
    Object.assign(department, { ...config.data as UpsertDepartmentPayload, parentId: (config.data as UpsertDepartmentPayload).parentId || undefined })
    appendAuditLog(database, operator, '更新部门', `department:${department.id}`)
    writeDatabase(database)
    return ok(clone(department))
  }

  if (config.url.startsWith('/api/access-control/department-catalog/') && config.method === 'DELETE') {
    const denied = requirePermission(database, current.user, 'system:department:write')
    if (denied) return denied
    const id = extractIdFromUrl(config.url, '/api/access-control/department-catalog/')
    database.departments = database.departments.filter((item) => item.id !== id)
    appendAuditLog(database, operator, '删除部门', `department:${id}`)
    writeDatabase(database)
    return ok({ success: true })
  }

  if (config.url === '/api/access-control/policy-matrix' && config.method === 'GET') {
    const denied = requirePermission(database, current.user, 'security:policy:read')
    if (denied) return denied
    const rows = resolveVisiblePolicyMatrix(database, current.user)
    return ok(rows)
  }

  if (config.url === '/api/access-control/audit-logs' && config.method === 'GET') {
    const denied = requirePermission(database, current.user, 'audit:log:read')
    if (denied) return denied
    return ok(resolveVisibleAuditLogs(database, current.user))
  }

  return fail(404, '接口未定义，请检查路由映射', 40401)
}

const resolveMockRoute = (config: ResolvedRequestConfig): MockRouteResult => {
  const database = readDatabase()

  if (config.url.startsWith('/api/auth/')) {
    return handleAuthRoutes(database, config)
  }

  if (config.url.startsWith('/api/dashboard/')) {
    return handleDashboardRoutes(database, config)
  }

  if (config.url.startsWith('/api/access-control/')) {
    return handleAccessControlRoutes(database, config)
  }

  return fail(404, '接口未定义，请检查路由映射', 40401)
}

const abortError = () => {
  const error = new Error('Aborted') as Error & { name: string }
  error.name = 'AbortError'
  return error
}

export const createMockAdapter = (config: ResolvedRequestConfig): Promise<HttpResponseLike> => {
  const routeResult = resolveMockRoute(config)
  const delay = routeResult.delay ?? 120

  return new Promise((resolve, reject) => {
    if (config.signal?.aborted) {
      reject(abortError())
      return
    }

    const timer = setTimeout(() => {
      config.signal?.removeEventListener('abort', handleAbort)
      resolve({
        status: routeResult.status,
        json: async <T>() => clone(routeResult.payload) as T
      })
    }, delay)

    const handleAbort = () => {
      clearTimeout(timer)
      config.signal?.removeEventListener('abort', handleAbort)
      reject(abortError())
    }

    config.signal?.addEventListener('abort', handleAbort, { once: true })
  })
}