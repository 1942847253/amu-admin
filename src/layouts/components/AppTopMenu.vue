<template>
  <div class="app-top-menu">
    <AmuMenu
      mode="horizontal"
      :theme="appStore.isDark || appStore.headerDark ? 'dark' : 'light'"
      surface="elevated"
      :selected-keys="[selectedKey]"
      @select="handleMenuSelect"
    >
      <MenuTreeNode
        v-for="item in permissionStore.menuTree"
        :key="item.key"
        :node="item"
        :translate-title="translateRouteTitle"
        :resolve-icon="resolveMenuIcon"
      />
    </AmuMenu>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  AmuMenu,
} from 'amu-ui/menu'
import { usePermissionStore } from '../../store/permission'
import { useAppStore } from '../../store/app'
import { useLayout } from '../composables/useLayout'
import MenuTreeNode from './MenuTreeNode.vue'
import { findMenuNode, findRootMenuByKey, resolveFirstLeafKey } from '../../utils/menu-tree'

const props = withDefaults(defineProps<{
  mixedNav?: boolean
  mixedRoot?: string
}>(), {
  mixedNav: false,
  mixedRoot: ''
})

const emit = defineEmits<{
  (e: 'update:mixedRoot', value: string): void
}>()

const router = useRouter()
const route = useRoute()
const permissionStore = usePermissionStore()
const appStore = useAppStore()
const { resolveMenuIcon, translateRouteTitle } = useLayout()

const selectedKey = computed(() => {
  if (props.mixedNav) {
    return props.mixedRoot || route.path
  }
  return route.path
})

const resolveFirstLeafPath = (key: string) => {
  return resolveFirstLeafKey(findMenuNode(permissionStore.menuTree, key))
}

const findRootKey = (key: string) => {
  return findRootMenuByKey(permissionStore.menuTree, key)?.key || ''
}

const handleMenuSelect = (key: string) => {
  if (!key.startsWith('/')) return

  const firstLeaf = resolveFirstLeafPath(key)
  const targetKey = firstLeaf || key

  if (!props.mixedNav) {
    router.push(targetKey)
    return
  }

  const rootKey = findRootKey(targetKey)
  if (rootKey) {
    emit('update:mixedRoot', rootKey)
  }

  if (targetKey === rootKey) {
    const rootFirstLeaf = resolveFirstLeafPath(rootKey)
    if (rootFirstLeaf) {
      router.push(rootFirstLeaf)
    }
    return
  }

  router.push(targetKey)
}
</script>

<style scoped lang="less">
.app-top-menu {
  padding: 0 16px;
  background: var(--amu-color-bg-elevated);
  border-bottom: 1px solid var(--amu-color-border);
}

:deep(.amu-menu) {
  border-bottom: none;
}
</style>