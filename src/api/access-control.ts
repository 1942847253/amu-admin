import type { MenuNode } from '../types/auth'
import { requestDelete, requestGet, requestPost, requestPut } from './http'

export interface AccessUserRow {
  id: string
  username: string
  displayName: string
  email: string
  title: string
  status: 'ACTIVE' | 'LOCKED'
  department: string
  roleCodes: string[]
  directPermissionCodes: string[]
}

export interface AccessRoleRow {
  id: string
  code: string
  name: string
  description: string
  dataScope: string
  permissionCodes: string[]
}

export interface AccessPermissionRow {
  code: string
  name: string
  module: string
  apiScopes: string[]
}

export interface AccessDepartmentRow {
  id: string
  name: string
  parentId?: string
}

export interface UpsertDepartmentPayload {
  id: string
  name: string
  parentId?: string
}

export interface AccessMenuRow {
  id: string
  key: string
  title: string
  icon: string
  parentId?: string
  sortOrder: number
  permissionCodes: string[]
  menuType: 'DIRECTORY' | 'MENU'
  componentPath?: string
  status: 'ACTIVE' | 'DISABLED'
  children?: AccessMenuRow[]
}

export interface UpsertUserPayload {
  username: string
  displayName: string
  email: string
  departmentId: string
  title: string
  status: 'ACTIVE' | 'LOCKED'
  roleCodes: string[]
  directPermissionCodes: string[]
  password?: string
}

export interface UpsertRolePayload {
  code: string
  name: string
  description: string
  dataScope: string
  permissionCodes: string[]
}

export interface UpsertPermissionPayload {
  code: string
  name: string
  module: string
  apiScopes: string[]
}

export interface UpsertMenuPayload {
  key: string
  title: string
  icon: string
  parentId?: string
  sortOrder: number
  permissionCodes: string[]
  menuType: 'DIRECTORY' | 'MENU'
  componentPath?: string
  status: 'ACTIVE' | 'DISABLED'
}

export interface PasswordResetResult {
  userId: string
  temporaryPassword: string
}

export interface PolicyMatrixRow {
  roleCode: string
  roleName: string
  dataScope: string
  permissions: Array<{
    code: string
    name: string
    module: string
  }>
}

export interface AuditLogRow {
  id: string
  operator: string
  action: string
  resource: string
  result: string
  createdAt: string
}

export interface RequestBehaviorOptions {
  silentError?: boolean
}

export const fetchMenus = () => {
  return requestGet<MenuNode[]>({
    url: '/api/access-control/menus',
    requestKey: 'access-control-menus',
    retry: 0
  })
}

export const fetchUsers = (options: RequestBehaviorOptions = {}) => {
  return requestGet<AccessUserRow[]>({
    url: '/api/access-control/users',
    requestKey: 'access-control-users',
    retry: 0,
    silentError: options.silentError
  })
}

export const createUser = (payload: UpsertUserPayload) => {
  return requestPost<AccessUserRow>({
    url: '/api/access-control/users',
    requestKey: 'access-control-user-create',
    data: payload,
    retry: 0
  })
}

export const updateUser = (id: string, payload: UpsertUserPayload) => {
  return requestPut<AccessUserRow>({
    url: `/api/access-control/users/${id}`,
    requestKey: `access-control-user-update-${id}`,
    data: payload,
    retry: 0
  })
}

export const setUserStatus = (id: string, status: 'ACTIVE' | 'LOCKED') => {
  return requestPost<AccessUserRow>({
    url: `/api/access-control/users/${id}/status`,
    requestKey: `access-control-user-status-${id}`,
    data: { status },
    retry: 0
  })
}

export const resetUserPassword = (id: string) => {
  return requestPost<PasswordResetResult>({
    url: `/api/access-control/users/${id}/reset-password`,
    requestKey: `access-control-user-reset-password-${id}`,
    retry: 0
  })
}

export const deleteUser = (id: string) => {
  return requestDelete<{ success: boolean }>({
    url: `/api/access-control/users/${id}`,
    requestKey: `access-control-user-delete-${id}`,
    retry: 0
  })
}

export const fetchRoles = (options: RequestBehaviorOptions = {}) => {
  return requestGet<AccessRoleRow[]>({
    url: '/api/access-control/roles',
    requestKey: 'access-control-roles',
    retry: 0,
    silentError: options.silentError
  })
}

export const createRole = (payload: UpsertRolePayload) => {
  return requestPost<AccessRoleRow>({
    url: '/api/access-control/roles',
    requestKey: 'access-control-role-create',
    data: payload,
    retry: 0
  })
}

export const updateRole = (id: string, payload: UpsertRolePayload) => {
  return requestPut<AccessRoleRow>({
    url: `/api/access-control/roles/${id}`,
    requestKey: `access-control-role-update-${id}`,
    data: payload,
    retry: 0
  })
}

export const deleteRole = (id: string) => {
  return requestDelete<{ success: boolean }>({
    url: `/api/access-control/roles/${id}`,
    requestKey: `access-control-role-delete-${id}`,
    retry: 0
  })
}

export const fetchPermissions = (options: RequestBehaviorOptions = {}) => {
  return requestGet<AccessPermissionRow[]>({
    url: '/api/access-control/permissions',
    requestKey: 'access-control-permissions',
    retry: 0,
    silentError: options.silentError
  })
}

export const fetchMenuCatalog = (options: RequestBehaviorOptions = {}) => {
  return requestGet<AccessMenuRow[]>({
    url: '/api/access-control/menu-catalog',
    requestKey: 'access-control-menu-catalog',
    retry: 0,
    silentError: options.silentError
  })
}

export const createMenu = (payload: UpsertMenuPayload) => {
  return requestPost<AccessMenuRow>({
    url: '/api/access-control/menu-catalog',
    requestKey: 'access-control-menu-create',
    data: payload,
    retry: 0
  })
}

export const updateMenu = (id: string, payload: UpsertMenuPayload) => {
  return requestPut<AccessMenuRow>({
    url: `/api/access-control/menu-catalog/${id}`,
    requestKey: `access-control-menu-update-${id}`,
    data: payload,
    retry: 0
  })
}

export const deleteMenu = (id: string) => {
  return requestDelete<{ success: boolean }>({
    url: `/api/access-control/menu-catalog/${id}`,
    requestKey: `access-control-menu-delete-${id}`,
    retry: 0
  })
}

export const createPermission = (payload: UpsertPermissionPayload) => {
  return requestPost<AccessPermissionRow>({
    url: '/api/access-control/permissions',
    requestKey: 'access-control-permission-create',
    data: payload,
    retry: 0
  })
}

export const updatePermission = (code: string, payload: UpsertPermissionPayload) => {
  return requestPut<AccessPermissionRow>({
    url: `/api/access-control/permissions/${code}`,
    requestKey: `access-control-permission-update-${code}`,
    data: payload,
    retry: 0
  })
}

export const deletePermission = (code: string) => {
  return requestDelete<{ success: boolean }>({
    url: `/api/access-control/permissions/${code}`,
    requestKey: `access-control-permission-delete-${code}`,
    retry: 0
  })
}

export const fetchDepartments = (options: RequestBehaviorOptions = {}) => {
  return requestGet<AccessDepartmentRow[]>({
    url: '/api/access-control/departments',
    requestKey: 'access-control-departments',
    retry: 0,
    silentError: options.silentError
  })
}

export const fetchDepartmentCatalog = (options: RequestBehaviorOptions = {}) => {
  return requestGet<AccessDepartmentRow[]>({
    url: '/api/access-control/department-catalog',
    requestKey: 'access-control-department-catalog',
    retry: 0,
    silentError: options.silentError
  })
}

export const createDepartment = (payload: UpsertDepartmentPayload) => {
  return requestPost<AccessDepartmentRow>({
    url: '/api/access-control/department-catalog',
    requestKey: 'access-control-department-create',
    data: payload,
    retry: 0
  })
}

export const updateDepartment = (id: string, payload: UpsertDepartmentPayload) => {
  return requestPut<AccessDepartmentRow>({
    url: `/api/access-control/department-catalog/${id}`,
    requestKey: `access-control-department-update-${id}`,
    data: payload,
    retry: 0
  })
}

export const deleteDepartment = (id: string) => {
  return requestDelete<{ success: boolean }>({
    url: `/api/access-control/department-catalog/${id}`,
    requestKey: `access-control-department-delete-${id}`,
    retry: 0
  })
}

export const fetchPolicyMatrix = () => {
  return requestGet<PolicyMatrixRow[]>({
    url: '/api/access-control/policy-matrix',
    requestKey: 'access-control-policy-matrix',
    retry: 0
  })
}

export const fetchAuditLogs = () => {
  return requestGet<AuditLogRow[]>({
    url: '/api/access-control/audit-logs',
    requestKey: 'access-control-audit-logs',
    retry: 0
  })
}
