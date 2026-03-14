import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { DEMO_ACCOUNTS } from '../src/config/app'
import { useAuthStore } from '../src/store/auth'
import { usePermissionStore } from '../src/store/permission'

const flattenPaths = (records: Array<{ path: string; children?: Array<{ path: string }> }>) => {
  return records.flatMap((record) => {
    const children = record.children?.map((child) => child.path) ?? []
    return [record.path, ...children]
  })
}

describe('amu-admin permission store', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('operator 仅获取允许访问的动态路由', () => {
    const authStore = useAuthStore()
    const permissionStore = usePermissionStore()
    const account = DEMO_ACCOUNTS.find((item) => item.username === 'operator')!

    authStore.applySession({
      accessToken: 'operator-access-token',
      refreshToken: 'operator-refresh-token',
      expiresAt: Date.now() + 10 * 60 * 1000,
      currentUser: {
        ...account,
        permissions: ['dashboard:view', 'workplace:view', 'system:user:read', 'system:user:write', 'system:role:read']
      },
      menus: [
        { key: '/workplace', title: '工作台' },
        { key: '/dashboard', title: '仪表盘' },
        {
          key: '/system',
          title: '系统管理',
          children: [
            { key: '/system/users', title: '用户管理' },
            { key: '/system/roles', title: '角色管理' }
          ]
        }
      ]
    })
    const routes = permissionStore.generateRoutes()
    const paths = flattenPaths(routes as Array<{ path: string; children?: Array<{ path: string }> }>)

    expect(paths).toContain('/dashboard')
    expect(paths).toContain('users')
    expect(paths).toContain('roles')
    expect(paths).not.toContain('auth-debug')
  })
})
