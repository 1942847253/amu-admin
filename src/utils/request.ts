export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

export interface HttpResponseLike {
  status: number
  json: <T = unknown>() => Promise<T>
}

export interface RequestConfig {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  params?: Record<string, string | number | boolean | undefined>
  data?: unknown
  headers?: Record<string, string>
  timeout?: number
  retry?: number
  requestKey?: string
  cancelPrevious?: boolean
  silentCancel?: boolean
}

export interface ResolvedRequestConfig extends Required<Omit<RequestConfig, 'params' | 'data' | 'headers'>> {
  params: Record<string, string | number | boolean | undefined>
  data: unknown
  headers: Record<string, string>
  signal?: AbortSignal
}

export class HttpError extends Error {
  status?: number
  code?: number

  constructor(message: string, status?: number, code?: number) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.code = code
  }
}

export class RequestCanceledError extends HttpError {
  constructor(message = '请求已取消') {
    super(message)
    this.name = 'RequestCanceledError'
  }
}

type RequestInterceptor = (config: ResolvedRequestConfig) => ResolvedRequestConfig | Promise<ResolvedRequestConfig>
type ResponseInterceptor = (payload: ApiResponse<unknown>) => ApiResponse<unknown> | Promise<ApiResponse<unknown>>
type ErrorInterceptor = (error: unknown, config: ResolvedRequestConfig) => unknown

type HttpAdapter = (config: ResolvedRequestConfig) => Promise<HttpResponseLike>

const defaultErrorMessageMap: Record<number, string> = {
  401: '登录状态失效，请重新登录',
  403: '没有访问权限',
  404: '请求资源不存在',
  408: '请求超时，请稍后重试',
  500: '服务器繁忙，请稍后重试'
}

const resolveApiBaseUrl = () => {
  const nextValue = import.meta.env.VITE_API_BASE_URL?.trim()
  if (!nextValue) return ''
  return nextValue.replace(/\/+$/g, '')
}

const joinUrl = (baseUrl: string, requestUrl: string) => {
  if (!baseUrl) return requestUrl
  const normalizedPath = requestUrl.startsWith('/') ? requestUrl : `/${requestUrl}`
  return `${baseUrl}${normalizedPath}`
}

const buildUrl = (url: string, params: ResolvedRequestConfig['params']) => {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return
    search.append(key, String(value))
  })
  const query = search.toString()
  const requestUrl = /^https?:\/\//.test(url) ? url : joinUrl(resolveApiBaseUrl(), url)
  const nextUrl = query ? `${requestUrl}${requestUrl.includes('?') ? '&' : '?'}${query}` : requestUrl
  if (/^https?:\/\//.test(nextUrl)) return nextUrl

  const fallbackOrigin = typeof window !== 'undefined' && window.location?.origin
    ? window.location.origin
    : 'http://localhost'
  return new URL(nextUrl, fallbackOrigin).toString()
}

const defaultAdapter: HttpAdapter = async (config) => {
  const timeoutController = new AbortController()
  const timer = setTimeout(() => timeoutController.abort(), config.timeout)

  const requestController = new AbortController()
  const abortByOutside = () => requestController.abort()
  const timeoutSignal = timeoutController.signal
  const externalSignal = config.signal

  if (externalSignal) {
    if (externalSignal.aborted) {
      clearTimeout(timer)
      throw new RequestCanceledError()
    }
    externalSignal.addEventListener('abort', abortByOutside, { once: true })
  }
  timeoutSignal.addEventListener('abort', abortByOutside, { once: true })

  try {
    const response = await fetch(buildUrl(config.url, config.params), {
      method: config.method,
      headers: config.headers,
      body: config.method === 'GET' ? undefined : JSON.stringify(config.data),
      signal: requestController.signal
    })

    return {
      status: response.status,
      json: async <T>() => (await response.json()) as T
    }
  } catch (error) {
    const domError = error as { name?: string }
    if (domError?.name === 'AbortError') {
      throw new RequestCanceledError()
    }
    throw error
  } finally {
    clearTimeout(timer)
    if (externalSignal) {
      externalSignal.removeEventListener('abort', abortByOutside)
    }
    timeoutSignal.removeEventListener('abort', abortByOutside)
  }
}

const createRequestKey = (config: ResolvedRequestConfig) => {
  if (config.requestKey) return config.requestKey
  return `${config.method}:${config.url}`
}

export class HttpClient {
  private requestInterceptors: RequestInterceptor[] = []
  private responseInterceptors: ResponseInterceptor[] = []
  private errorInterceptors: ErrorInterceptor[] = []
  private adapter: HttpAdapter
  private errorMessageMap: Record<number, string>
  private pendingControllers = new Map<string, AbortController>()
  private waitingResolvers: Array<() => void> = []
  private activeCount = 0
  private maxConcurrent: number

  constructor(adapter: HttpAdapter = defaultAdapter, errorMessageMap: Record<number, string> = {}, maxConcurrent = 8) {
    this.adapter = adapter
    this.errorMessageMap = {
      ...defaultErrorMessageMap,
      ...errorMessageMap
    }
    this.maxConcurrent = maxConcurrent
  }

  useRequestInterceptor(interceptor: RequestInterceptor) {
    this.requestInterceptors.push(interceptor)
  }

  useResponseInterceptor(interceptor: ResponseInterceptor) {
    this.responseInterceptors.push(interceptor)
  }

  useErrorInterceptor(interceptor: ErrorInterceptor) {
    this.errorInterceptors.push(interceptor)
  }

  cancel(requestKey: string) {
    const controller = this.pendingControllers.get(requestKey)
    if (controller) {
      controller.abort()
      this.pendingControllers.delete(requestKey)
    }
  }

  private async acquireSlot() {
    if (this.activeCount < this.maxConcurrent) {
      this.activeCount += 1
      return
    }

    await new Promise<void>((resolve) => {
      this.waitingResolvers.push(() => {
        this.activeCount += 1
        resolve()
      })
    })
  }

  private releaseSlot() {
    this.activeCount = Math.max(0, this.activeCount - 1)
    const next = this.waitingResolvers.shift()
    if (next) next()
  }

  async request<T = unknown>(config: RequestConfig): Promise<T> {
    const resolved: ResolvedRequestConfig = {
      url: config.url,
      method: config.method ?? 'GET',
      params: config.params ?? {},
      data: config.data ?? null,
      headers: {
        'Content-Type': 'application/json',
        ...(config.headers ?? {})
      },
      timeout: config.timeout ?? 10000,
      retry: config.retry ?? 0,
      requestKey: config.requestKey ?? '',
      cancelPrevious: config.cancelPrevious ?? false,
      silentCancel: config.silentCancel ?? true
    }

    let finalConfig = resolved
    for (const interceptor of this.requestInterceptors) {
      finalConfig = await interceptor(finalConfig)
    }

    await this.acquireSlot()

    const requestKey = createRequestKey(finalConfig)
    if (finalConfig.cancelPrevious) {
      this.cancel(requestKey)
    }

    const controller = new AbortController()
    finalConfig.signal = controller.signal
    this.pendingControllers.set(requestKey, controller)

    let lastError: unknown

    try {
      for (let count = 0; count <= finalConfig.retry; count += 1) {
        try {
          const response = await this.adapter(finalConfig)
          const payload = await response.json<ApiResponse<T>>()

          let finalPayload: ApiResponse<unknown> = payload
          for (const interceptor of this.responseInterceptors) {
            finalPayload = await interceptor(finalPayload)
          }

          if (response.status >= 400) {
            throw new HttpError(this.errorMessageMap[response.status] ?? `请求失败(${response.status})`, response.status)
          }

          if (finalPayload.code !== 0) {
            const mappedMessage = this.errorMessageMap[finalPayload.code]
            const businessMessage = mappedMessage ?? finalPayload.message ?? '业务处理失败'
            throw new HttpError(businessMessage, response.status, finalPayload.code)
          }

          return finalPayload.data as T
        } catch (error) {
          if (error instanceof RequestCanceledError) {
            throw error
          }
          lastError = error
        }
      }

      let finalError = lastError
      for (const interceptor of this.errorInterceptors) {
        finalError = interceptor(finalError, finalConfig)
      }
      throw finalError
    } finally {
      this.pendingControllers.delete(requestKey)
      this.releaseSlot()
    }
  }

  get<T = unknown>(config: Omit<RequestConfig, 'method'>) {
    return this.request<T>({ ...config, method: 'GET' })
  }

  post<T = unknown>(config: Omit<RequestConfig, 'method'>) {
    return this.request<T>({ ...config, method: 'POST' })
  }

  put<T = unknown>(config: Omit<RequestConfig, 'method'>) {
    return this.request<T>({ ...config, method: 'PUT' })
  }

  delete<T = unknown>(config: Omit<RequestConfig, 'method'>) {
    return this.request<T>({ ...config, method: 'DELETE' })
  }
}
