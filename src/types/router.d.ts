import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
    permission?: string | string[]
    menu?: boolean
    keepAlive?: boolean
  }
}

export {}