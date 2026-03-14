<template>
  <AmuSubMenu v-if="node.children?.length" :index="node.key" :title="translateTitle(node.title)">
    <template #icon>
      <AmuIcon>
        <component :is="resolveIcon(node.key, node.icon)" />
      </AmuIcon>
    </template>

    <MenuTreeNode
      v-for="child in node.children"
      :key="child.key"
      :node="child"
      :translate-title="translateTitle"
      :resolve-icon="resolveIcon"
    />
  </AmuSubMenu>

  <AmuMenuItem v-else :index="node.key">
    <template #icon>
      <AmuIcon>
        <component :is="resolveIcon(node.key, node.icon)" />
      </AmuIcon>
    </template>
    {{ translateTitle(node.title) }}
  </AmuMenuItem>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { AmuIcon } from 'amu-ui/icon'
import { AmuMenuItem, AmuSubMenu } from 'amu-ui/menu'
import type { MenuNode } from '../../store/permission'

defineOptions({
  name: 'MenuTreeNode'
})

defineProps<{
  node: MenuNode
  translateTitle: (title: string) => string
  resolveIcon: (key: string, iconName?: string) => Component
}>()
</script>