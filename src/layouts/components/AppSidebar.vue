<template>
    <div class="app-sidebar-content">
        <div class="admin-layout__logo">
            <div class="admin-layout__logo-mark">{{ logoMark }}</div>
            <span v-show="!collapsed" class="admin-layout__logo-text">{{ APP_META.name }}</span>
        </div>

        <AmuMenu
            class="app-sidebar-content__menu"
            mode="vertical"
            :theme="appStore.isDark || appStore.sidebarDark || appStore.sidebarChildDark ? 'dark' : 'light'"
            surface="elevated"
            scrollable
            trigger="click"
            :show-collapse-button="false"
            :collapsed="collapsed"
            :selected-keys="[activeKey]"
            :open-keys="openKeys"
            @update:collapsed="handleCollapsedChange"
            @update:open-keys="handleOpenKeysChange"
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
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AmuMenu } from 'amu-ui/menu'
import { APP_META } from '../../config/app'
import { usePermissionStore } from '../../store/permission'
import { useAppStore } from '../../store/app'
import { collectAncestorKeys, containsMenuKey, findMenuNode, normalizeAccordionKeys, resolveFirstLeafKey } from '../../utils/menu-tree'
import { useLayout } from '../composables/useLayout'
import MenuTreeNode from './MenuTreeNode.vue'

const props = defineProps<{
    collapsed?: boolean
}>()

const emit = defineEmits<{
    (e: 'update:collapsed', value: boolean): void
    (e: 'menu-select'): void
}>()

const router = useRouter()
const route = useRoute()
const permissionStore = usePermissionStore()
const appStore = useAppStore()
const { resolveMenuIcon, translateRouteTitle } = useLayout()

const logoMark = computed(() => APP_META.shortName.slice(0, 1).toUpperCase() || 'A')

const activeKey = computed(() => route.path)
const openKeys = ref<string[]>([])
const hasInitializedOpenKeys = ref(false)

watch(
    () => route.path,
    (path) => {
        const ancestors = collectAncestorKeys(permissionStore.menuTree, path)
        if (ancestors.length > 0) {
            if (!hasInitializedOpenKeys.value) {
                openKeys.value = ancestors
                hasInitializedOpenKeys.value = true
                return
            }

            const mergedKeys = new Set(openKeys.value)
            ancestors.forEach((key) => mergedKeys.add(key))
            openKeys.value = Array.from(mergedKeys)
            return
        }

        if (hasInitializedOpenKeys.value) {
            return
        }

        const firstGroup = permissionStore.menuTree.find((item) => item.children?.length)
        openKeys.value = firstGroup ? [firstGroup.key] : []
        hasInitializedOpenKeys.value = true
    },
    { immediate: true }
)

const resolveFirstLeafPath = () => {
    const queue = [...permissionStore.menuTree]
    while (queue.length > 0) {
        const current = queue.shift()
        if (!current) continue
        if (current.children?.length) {
            queue.unshift(...current.children)
            continue
        }
        return current.key
    }
    return ''
}

watch(
    () => [permissionStore.menuTree, appStore.autoActivateFirstMenu, route.path] as const,
    () => {
        if (!appStore.autoActivateFirstMenu) return
        if (containsMenuKey(permissionStore.menuTree, route.path)) return

        const firstLeaf = resolveFirstLeafPath()
        if (firstLeaf) {
            router.replace(firstLeaf)
        }
    },
    { immediate: true }
)

const handleCollapsedChange = (value: boolean) => {
    emit('update:collapsed', value)
}

const handleOpenKeysChange = (keys: string[]) => {
    if (appStore.sidebarAccordion && keys.length > 1) {
        openKeys.value = normalizeAccordionKeys(keys)
        return
    }

    openKeys.value = keys
}

const resolveFirstLeafByKey = (key: string) => {
    return resolveFirstLeafKey(findMenuNode(permissionStore.menuTree, key))
}

const handleMenuSelect = (key: string) => {
    if (!key.startsWith('/')) return

    const firstLeaf = resolveFirstLeafByKey(key)
    router.push(firstLeaf || key)
    if (!props.collapsed) {
        emit('menu-select')
    }
}
</script>

<style scoped lang="less">
.app-sidebar-content {
    height: 100%;
    display: flex;
    flex-direction: column;
    min-height: 0;
    background: transparent;
}

.app-sidebar-content__menu {
    flex: 1;
    min-height: 0;
}

:deep(.amu-menu--vertical, .amu-menu--inline) {
    border-right: none !important;
}

:deep(.amu-menu--inline) {
    border-right: none !important;
}

:deep(.app-sidebar-content__menu.amu-menu) {
    height: 100%;
}

.admin-layout__logo {
    flex-shrink: 0;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: left;
    padding: 0 16px;
    overflow: hidden;
    white-space: nowrap;
    transition: all 0.3s;
}

.admin-layout__logo-mark {
    width: 35px;
    height: 35px;
    border-radius: 6px;
    background: var(--amu-color-primary);
    color: var(--amu-color-on-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 18px;
    margin-right: 8px;
    flex-shrink: 0;
}

:deep(.amu-layout-sider--collapsed) .admin-layout__logo-mark {
    margin-right: 0;
}

.admin-layout__logo-text {
    font-size: 18px;
    font-weight: 600;
    color: var(--amu-color-text);
    transition: opacity 0.3s;
}
</style>
