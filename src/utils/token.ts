export interface TokenPayload {
  role: string
  expiresAt: number
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

const ACCESS_PREFIX = 'access'
const REFRESH_PREFIX = 'refresh'

const createToken = (prefix: string, role: string, expiresAt: number) => {
  return `${prefix}-${role}-${expiresAt}`
}

const parseToken = (value: string, prefix: string): TokenPayload | null => {
  const [rawPrefix, role, expiresAtRaw] = value.split('-')
  if (rawPrefix !== prefix) return null
  const expiresAt = Number(expiresAtRaw)
  if (!role || Number.isNaN(expiresAt)) return null
  return { role, expiresAt }
}

export const createAccessToken = (role: string, expiresAt: number) => {
  return createToken(ACCESS_PREFIX, role, expiresAt)
}

export const createRefreshToken = (role: string, expiresAt: number) => {
  return createToken(REFRESH_PREFIX, role, expiresAt)
}

export const parseAccessToken = (value: string) => {
  return parseToken(value, ACCESS_PREFIX)
}

export const parseRefreshToken = (value: string) => {
  return parseToken(value, REFRESH_PREFIX)
}

export const createTokenPair = (role: string, now = Date.now(), accessTtlMs = 5 * 60 * 1000, refreshTtlMs = 30 * 60 * 1000): TokenPair => {
  const expiresAt = now + accessTtlMs
  return {
    accessToken: createAccessToken(role, expiresAt),
    refreshToken: createRefreshToken(role, now + refreshTtlMs),
    expiresAt
  }
}