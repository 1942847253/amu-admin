<template>
  <section class="app-main">
    <AmuScrollbar height="100%" :wrap-style="{ overflowX: 'hidden' }">
      <div class="app-main__inner">
        <RouterView v-slot="{ Component, route: currentRoute }">
          <Transition :name="transitionName" mode="out-in">
            <KeepAlive :include="cachedViews">
              <component 
                :is="Component" 
                :key="`${currentRoute.fullPath}::${refreshKey}`" 
              />
            </KeepAlive>
          </Transition>
        </RouterView>
      </div>
    </AmuScrollbar>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { AmuScrollbar } from 'amu-ui/scrollbar'
import { useAppStore } from '../../store/app'
import { useTabsStore } from '../../store/tabs'

const props = defineProps<{
  refreshKey?: number
}>()

const tabsStore = useTabsStore()
const appStore = useAppStore()

const cachedViews = computed(() => {
  return tabsStore.visitedTabs
    .filter(item => item.keepAlive && item.name)
    .map(item => item.name as string)
})

const transitionName = computed(() => {
  if (!appStore.pageTransition || appStore.transitionPreset === 'none') return ''
  if (appStore.transitionPreset === 'fade') return 'fade-transition'
  if (appStore.transitionPreset === 'zoom') return 'zoom-transition'
  return 'fade-transform'
})
</script>

<style scoped lang="less">
.app-main {
  width: 100%;
  height: 100%;
  min-height: 0;
  position: relative;
  overflow: hidden;
  background-color: var(--amu-color-bg-fill);
  box-sizing: border-box;
}

[data-amu-theme='dark'] .app-main {
  background-color: var(--amu-color-bg);
}

:deep(.amu-scrollbar) {
  height: 100%;
}

:deep(.amu-scrollbar__wrap) {
  height: 100%;
  overflow: auto;
}

:deep(.amu-scrollbar__bar.is-horizontal) {
  display: none;
}

.app-main__inner {
  padding: 16px;
  width: 100%;
  max-width: 100%;
  min-height: 100%;
  overflow-x: hidden;
  box-sizing: border-box;
}

.fade-transform-leave-active,
.fade-transform-enter-active {
  transition: all 0.3s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.fade-transition-leave-active,
.fade-transition-enter-active {
  transition: opacity 0.24s ease;
}

.fade-transition-enter-from,
.fade-transition-leave-to {
  opacity: 0;
}

.zoom-transition-leave-active,
.zoom-transition-enter-active {
  transition: all 0.24s ease;
}

.zoom-transition-enter-from,
.zoom-transition-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
</style>
