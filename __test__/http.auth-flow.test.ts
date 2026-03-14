import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { DEMO_ACCOUNTS } from '../src/config/app'
import { fetchDashboardOverview } from '../src/api/dashboard'
import { useAuthStore } from '../src/store/auth'

describe('amu-admin http auth flow', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('accessToken 过期后可以自动刷新并完成请求', async () => {
    const authStore = useAuthStore()
    const account = DEMO_ACCOUNTS[0]
    let dashboardCallCount = 0

    authStore.applySession({
      accessToken: 'expired-access-token',
      refreshToken: 'valid-refresh-token',
      expiresAt: Date.now() - 1000,
      currentUser: {
        ...account,
        permissions: ['*']
      },
      menus: [{ key: '/dashboard', title: '仪表盘' }]
    })

    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      const authHeader = String(init?.headers && (init.headers as Record<string, string>).Authorization || '')

      if (url.includes('/api/auth/refresh')) {
        return {
          status: 200,
          json: async () => ({
            code: 0,
            message: 'ok',
            data: {
              accessToken: 'fresh-access-token',
              refreshToken: 'fresh-refresh-token',
              expiresIn: 900,
              currentUser: {
                ...account,
                permissions: ['*']
              },
              menus: [{ key: '/dashboard', title: '仪表盘' }]
            }
          })
        }
      }

      if (url.includes('/api/dashboard/overview')) {
        dashboardCallCount += 1
        if (authHeader === 'Bearer fresh-access-token') {
          return {
            status: 200,
            json: async () => ({
              code: 0,
              message: 'ok',
              data: { visits: 12480, pendingTickets: 86, newUsers: 1024 }
            })
          }
        }

        return {
          status: 401,
          json: async () => ({ message: 'Unauthorized' })
        }
      }

      throw new Error(`unexpected request: ${url}`)
    }))


    const result = await fetchDashboardOverview(true)

    expect(result.visits).toBeGreaterThan(0)
    expect(authStore.accessTokenExpiresAt).toBeGreaterThan(Date.now())
    expect(authStore.token).toBe('fresh-access-token')
    expect(dashboardCallCount).toBe(1)
  })

  it('accessToken 与 refreshToken 同时失效后会清空登录态', async () => {
    const authStore = useAuthStore()
    const account = DEMO_ACCOUNTS[0]

    authStore.applySession({
      accessToken: 'expired-access-token',
      refreshToken: 'expired-refresh-token',
      expiresAt: Date.now() - 1000,
      currentUser: {
        ...account,
        permissions: ['*']
      },
      menus: [{ key: '/dashboard', title: '仪表盘' }]
    })

    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)

      if (url.includes('/api/auth/refresh')) {
        return {
          status: 401,
          json: async () => ({ message: 'Unauthorized' })
        }
      }

      if (url.includes('/api/dashboard/overview')) {
        return {
          status: 401,
          json: async () => ({ message: 'Unauthorized' })
        }
      }

      throw new Error(`unexpected request: ${url}`)
    }))

    await expect(fetchDashboardOverview(true)).rejects.toThrow()
    expect(authStore.isAuthenticated).toBe(false)
  })
})
