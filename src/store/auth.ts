import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { fetchAuthProfile, loginByPassword, logoutSession } from '../api/auth'
import type { MenuNode, UserProfile } from '../types/auth'
import { readStorage, readStorageJson, readStorageNumber, removeStorage, writeStorage } from '../utils/storage'

const ACCESS_TOKEN_KEY = 'amu-admin-access-token'
const REFRESH_TOKEN_KEY = 'amu-admin-refresh-token'
const ACCESS_EXPIRES_AT_KEY = 'amu-admin-access-expires-at'
const USER_KEY = 'amu-admin-user'
const PERMISSION_KEY = 'amu-admin-permissions'
const MENU_KEY = 'amu-admin-menus'

const isUserProfile = (value: unknown): value is UserProfile => {
  if (!value || typeof value !== 'object') return false

  const candidate = value as { id?: unknown; username?: unknown; role?: unknown }
  return typeof candidate.id === 'string'
    && typeof candidate.username === 'string'
    && candidate.username.length > 0
    && typeof candidate.role === 'string'
}

const isStringArray = (value: unknown): value is string[] => {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

const isMenuNodeArray = (value: unknown): value is MenuNode[] => {
  return Array.isArray(value)
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>(readStorage(ACCESS_TOKEN_KEY))
  const refreshTokenValue = ref<string>(readStorage(REFRESH_TOKEN_KEY))
  const accessTokenExpiresAt = ref<number>(readStorageNumber(ACCESS_EXPIRES_AT_KEY, 0))
  const user = ref<UserProfile | null>(readStorageJson<UserProfile | null>(USER_KEY, (value): value is UserProfile | null => value === null || isUserProfile(value), null))
  const permissions = ref<string[]>(readStorageJson<string[]>(PERMISSION_KEY, isStringArray, []))
  const menus = ref<MenuNode[]>(readStorageJson<MenuNode[]>(MENU_KEY, isMenuNodeArray, []))
  const hydrated = ref(false)

  const isAuthenticated = computed(() => Boolean(token.value && refreshTokenValue.value && user.value))

  const shouldRefreshSoon = (windowMs = 60 * 1000) => {
    if (!token.value || !accessTokenExpiresAt.value) return false
    return accessTokenExpiresAt.value - Date.now() <= windowMs
  }

  const hasPermission = (required?: string | string[]) => {
    if (!required) return true
    if (permissions.value.includes('*')) return true
    const requiredList = Array.isArray(required) ? required : [required]
    return requiredList.every((item) => permissions.value.includes(item))
  }

  const applySession = (payload: {
    accessToken: string
    refreshToken: string
    expiresAt: number
    currentUser: UserProfile & { permissions: string[] }
    menus: MenuNode[]
  }) => {
    setAuthTokens(payload.accessToken, payload.refreshToken, payload.expiresAt)
    user.value = payload.currentUser
    permissions.value = payload.currentUser.permissions
    menus.value = payload.menus

    writeStorage(USER_KEY, JSON.stringify(payload.currentUser))
    writeStorage(PERMISSION_KEY, JSON.stringify(payload.currentUser.permissions))
    writeStorage(MENU_KEY, JSON.stringify(payload.menus))
  }

  const login = async (username: string, password: string) => {
    const session = await loginByPassword(username, password)
    applySession({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      expiresAt: Date.now() + session.expiresIn * 1000,
      currentUser: session.currentUser,
      menus: session.menus
    })
    return true
  }

  const fetchProfile = async () => {
    const profile = await fetchAuthProfile()
    if (!token.value || !refreshTokenValue.value) {
      return profile
    }

    user.value = profile.currentUser
    permissions.value = profile.currentUser.permissions
    menus.value = profile.menus
    writeStorage(USER_KEY, JSON.stringify(profile.currentUser))
    writeStorage(PERMISSION_KEY, JSON.stringify(profile.currentUser.permissions))
    writeStorage(MENU_KEY, JSON.stringify(profile.menus))
    return profile
  }

  const setToken = (nextToken: string, expiresAt = Date.now() + 5 * 60 * 1000) => {
    token.value = nextToken
    accessTokenExpiresAt.value = expiresAt
    writeStorage(ACCESS_TOKEN_KEY, nextToken)
    writeStorage(ACCESS_EXPIRES_AT_KEY, String(expiresAt))
  }

  const setRefreshToken = (nextRefreshToken: string) => {
    refreshTokenValue.value = nextRefreshToken
    writeStorage(REFRESH_TOKEN_KEY, nextRefreshToken)
  }

  const setAuthTokens = (nextAccessToken: string, nextRefreshToken: string, expiresAt: number) => {
    setToken(nextAccessToken, expiresAt)
    setRefreshToken(nextRefreshToken)
  }

  const applyRefreshResult = (nextAccessToken: string, nextRefreshToken: string, expiresAt: number) => {
    setAuthTokens(nextAccessToken, nextRefreshToken, expiresAt)
  }

  const logout = async (shouldRequest = false) => {
    if (shouldRequest && token.value) {
      await logoutSession().catch(() => undefined)
    }
    token.value = ''
    refreshTokenValue.value = ''
    accessTokenExpiresAt.value = 0
    user.value = null
    permissions.value = []
    menus.value = []
    hydrated.value = true
    removeStorage(ACCESS_TOKEN_KEY)
    removeStorage(REFRESH_TOKEN_KEY)
    removeStorage(ACCESS_EXPIRES_AT_KEY)
    removeStorage(USER_KEY)
    removeStorage(PERMISSION_KEY)
    removeStorage(MENU_KEY)
  }

  const hydrateSession = async () => {
    if (hydrated.value) return

    if (!token.value || !refreshTokenValue.value) {
      hydrated.value = true
      return
    }

    try {
      await fetchProfile()
    } catch {
      await logout()
    } finally {
      hydrated.value = true
    }
  }

  return {
    token,
    refreshTokenValue,
    accessTokenExpiresAt,
    user,
    permissions,
    menus,
    hydrated,
    isAuthenticated,
    shouldRefreshSoon,
    hasPermission,
    applySession,
    fetchProfile,
    hydrateSession,
    login,
    setToken,
    setRefreshToken,
    setAuthTokens,
    applyRefreshResult,
    logout
  }
})
