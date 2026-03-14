export const readStorage = (key: string): string => {
  try {
    return localStorage.getItem(key) ?? ''
  } catch {
    return ''
  }
}

export const readStorageNumber = (key: string, fallback = 0): number => {
  const value = Number(readStorage(key))
  if (!Number.isFinite(value) || value < 0) return fallback
  return value
}

export const readStorageJson = <T>(key: string, guard: (value: unknown) => value is T, fallback: T): T => {
  const raw = readStorage(key)
  if (!raw) return fallback

  try {
    const parsed = JSON.parse(raw) as unknown
    if (!guard(parsed)) return fallback
    return parsed
  } catch {
    return fallback
  }
}

export const writeStorage = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value)
  } catch {
    return
  }
}

export const removeStorage = (key: string) => {
  try {
    localStorage.removeItem(key)
  } catch {
    return
  }
}