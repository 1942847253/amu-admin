import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { DEMO_ACCOUNTS } from '../src/config/app'
import { useAuthStore } from '../src/store/auth'

describe('amu-admin auth store', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      if (!url.includes('/api/auth/login')) {
        throw new Error(`unexpected request: ${url}`)
      }

      const payload = JSON.parse(String(init?.body || '{}')) as { username?: string; password?: string }
      const account = DEMO_ACCOUNTS.find((item) => item.username === payload.username && item.password === payload.password)

      if (!account) {
        return {
          status: 401,
          json: async () => ({ message: '用户名或密码错误' })
        }
      }

      return {
        status: 200,
        json: async () => ({
          code: 0,
          message: 'ok',
          data: {
            accessToken: 'test-access-token',
            refreshToken: 'test-refresh-token',
            expiresIn: 900,
            currentUser: {
              ...account,
              permissions: account.role === 'admin' ? ['*'] : ['dashboard:view']
            },
            menus: [{ key: '/dashboard', title: '仪表盘' }]
          }
        })
      }
    }))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('只允许已声明的演示账号登录', async () => {
    const authStore = useAuthStore()

    await expect(authStore.login('unknown', '123456')).rejects.toThrow()
    await expect(authStore.login('admin', 'bad-password')).rejects.toThrow()
    expect(authStore.isAuthenticated).toBe(false)
  })

  it('登录后写入完整用户资料与权限', async () => {
    const authStore = useAuthStore()
    const account = DEMO_ACCOUNTS[0]

    await authStore.login(account.username, account.password)
    expect(authStore.isAuthenticated).toBe(true)
    expect(authStore.user).toMatchObject({
      id: account.id,
      username: account.username,
      displayName: account.displayName,
      email: account.email,
      department: account.department,
      title: account.title,
      avatarSeed: account.avatarSeed
    })
    expect(authStore.permissions).toContain('*')
  })
})
