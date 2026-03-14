import type { AccessOverviewPayload, AuthSessionPayload } from '../types/auth'
import { requestGet, requestPost } from './http'

export const loginByPassword = (username: string, password: string) => {
  return requestPost<AuthSessionPayload>({
    url: '/api/auth/login',
    data: { username, password },
    requestKey: 'auth-login',
    retry: 0
  })
}

export const refreshSessionToken = (refreshToken: string) => {
  return requestPost<AuthSessionPayload>({
    url: '/api/auth/refresh',
    data: { refreshToken },
    requestKey: 'auth-refresh-token',
    retry: 0,
    silentCancel: true
  })
}

export const fetchAuthProfile = () => {
  return requestGet<AccessOverviewPayload>({
    url: '/api/auth/profile',
    requestKey: 'auth-profile',
    retry: 0
  })
}

export const logoutSession = () => {
  return requestPost<{ success: boolean }>({
    url: '/api/auth/logout',
    requestKey: 'auth-logout',
    retry: 0,
    silentError: true
  })
}
