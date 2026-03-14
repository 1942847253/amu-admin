import { readStorage, writeStorage } from './storage'

const HTTP_DEBUG_KEY = 'amu-admin-http-debug'

let httpDebugEnabled = import.meta.env.DEV && readStorage(HTTP_DEBUG_KEY) === '1'

export type HttpDebugLevel = 'info' | 'warn' | 'error'

let traceSequence = 0

export const createHttpTraceId = () => {
  traceSequence += 1
  return `trace-${Date.now()}-${traceSequence}`
}

export const isHttpDebugEnabled = () => {
  return httpDebugEnabled
}

export const setHttpDebugEnabled = (enabled: boolean) => {
  if (!import.meta.env.DEV) {
    httpDebugEnabled = false
    return
  }

  httpDebugEnabled = enabled
  writeStorage(HTTP_DEBUG_KEY, enabled ? '1' : '0')
}

export const debugHttp = (event: string, payload?: Record<string, unknown>, level: HttpDebugLevel = 'info') => {
  if (!httpDebugEnabled) return

  const timestamp = new Date().toLocaleTimeString('zh-CN', { hour12: false })
  const prefix = `[amu-admin][http][${level}][${timestamp}] ${event}`

  const logger = level === 'error' ? console.error : level === 'warn' ? console.warn : console.debug

  if (payload) {
    logger(prefix, payload)
    return
  }

  logger(prefix)
}