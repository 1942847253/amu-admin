import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { defineConfig } from 'vitest/config'

const createWorkspaceAliases = () => {
  return [
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
}

const workspaceEntry = resolve(__dirname, '../../packages/components/index.ts')
const useWorkspaceSource = existsSync(workspaceEntry)

export default defineConfig({
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: useWorkspaceSource ? createWorkspaceAliases() : []
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['__test__/**/*.test.ts'],
    setupFiles: ['./tests/setup.ts'],
    server: {
      deps: {
        inline: ['amu-ui', '@amu-ui/icons']
      }
    }
  }
})