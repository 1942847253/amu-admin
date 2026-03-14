import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const parsePort = (value: string | undefined, fallback: number) => {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

const parseBoolean = (value: string | undefined, fallback: boolean) => {
  if (value === undefined) return fallback
  const normalized = value.trim().toLowerCase()
  if (normalized === 'true' || normalized === '1') return true
  if (normalized === 'false' || normalized === '0') return false
  return fallback
}

const normalizeBasePath = (value: string | undefined, fallback = '/') => {
  const nextValue = value?.trim() || fallback
  if (nextValue === '/') return '/'

  const sanitized = nextValue.replace(/^\/+|\/+$/g, '')
  return sanitized ? `/${sanitized}/` : '/'
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '')
  const devPort = parsePort(env.VITE_DEV_PORT, 5174)
  const apiProxyTarget = env.VITE_API_PROXY_TARGET?.trim() || 'http://localhost:3000'
  const basePath = normalizeBasePath(env.VITE_APP_BASE_PATH, '/')
  const workspaceEntry = resolve(__dirname, '../../packages/components/index.ts')
  const useWorkspaceSource = parseBoolean(env.VITE_USE_WORKSPACE_SOURCE, existsSync(workspaceEntry))
  const workspaceAliases = [
    {
      find: /^amu-ui$/,
      replacement: resolve(__dirname, '../../packages/components/index.ts')
    },
    {
      find: /^amu-ui\/theme$/,
      replacement: resolve(__dirname, '../../packages/theme/index.ts')
    },
    {
      find: /^amu-ui\/(.*)$/,
      replacement: resolve(__dirname, '../../packages/components/$1/index.ts')
    },
    {
      find: '@amu-ui/hooks',
      replacement: resolve(__dirname, '../../packages/hooks/index.ts')
    },
    {
      find: '@amu-ui/locale',
      replacement: resolve(__dirname, '../../packages/locale/index.ts')
    },
    {
      find: '@amu-ui/icons',
      replacement: resolve(__dirname, '../../packages/icons/src/index.ts')
    },
    {
      find: '@amu-ui/utils',
      replacement: resolve(__dirname, '../../packages/utils/index.ts')
    }
  ]

  return {
    base: basePath,
    plugins: [vue(), vueJsx()],
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true
        }
      }
    },
    resolve: {
      alias: useWorkspaceSource ? workspaceAliases : []
    },
    server: {
      port: devPort,
      proxy: {
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true
        }
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('echarts')) return 'vendor-echarts'
              if (id.includes('vue')) return 'vendor-vue'
              if (id.includes('pinia') || id.includes('vue-router')) return 'vendor-app'
            }
            return undefined
          }
        }
      }
    }
  }
})
