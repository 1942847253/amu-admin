/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEV_PORT?: string
  readonly VITE_API_PROXY_TARGET?: string
  readonly VITE_USE_MOCK_API?: string
  readonly VITE_API_BASE_URL?: string
  readonly VITE_USE_WORKSPACE_SOURCE?: string
  readonly VITE_APP_BASE_PATH?: string
  readonly VITE_APP_NAME?: string
  readonly VITE_APP_SHORT_NAME?: string
  readonly VITE_APP_TITLE?: string
  readonly VITE_APP_DESCRIPTION?: string
  readonly VITE_APP_COPYRIGHT?: string
  readonly VITE_APP_REPOSITORY_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}