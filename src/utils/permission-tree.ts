import type { TreeKey, TreeOption } from 'amu-ui/tree'
import type { AccessPermissionRow } from '../api/access-control'

const moduleLabelMap: Record<string, string> = {
  audit: '审计模块',
  dashboard: '仪表盘模块',
  iam: '身份权限模块',
  security: '安全模块',
  system: '系统模块'
}

const getModuleLabel = (module: string, count: number) => {
  const normalized = module.trim().toLowerCase()
  return `${moduleLabelMap[normalized] || `${module} 模块`} (${count})`
}

export const buildPermissionTree = (permissions: AccessPermissionRow[]): TreeOption[] => {
  const groups = new Map<string, AccessPermissionRow[]>()

  permissions.forEach((permission) => {
    const module = permission.module.trim().toLowerCase() || 'other'
    const current = groups.get(module)
    if (current) {
      current.push(permission)
      return
    }
    groups.set(module, [permission])
  })

  return Array.from(groups.entries())
    .sort(([left], [right]) => left.localeCompare(right, 'zh-CN'))
    .map(([module, groupPermissions]) => ({
      key: `module:${module}`,
      label: getModuleLabel(module, groupPermissions.length),
      children: groupPermissions
        .slice()
        .sort((left, right) => left.code.localeCompare(right.code, 'zh-CN'))
        .map((permission) => ({
          key: permission.code,
          label: `${permission.name} (${permission.code})`
        }))
    }))
}

export const collectExpandedKeys = (tree: TreeOption[]): TreeKey[] => {
  return tree.map((item) => item.key ?? '')
}

export const pickPermissionCodes = (keys: TreeKey[], permissions: AccessPermissionRow[]): string[] => {
  const validCodes = new Set(permissions.map((permission) => permission.code))
  return keys
    .filter((key): key is string => typeof key === 'string' && validCodes.has(key))
    .sort((left, right) => left.localeCompare(right, 'zh-CN'))
}