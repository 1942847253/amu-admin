<template>
  <AmuDrawer v-model="visible" placement="right" size="360px">
    <template #title>
      <div class="settings-drawer__title">
        <AmuIcon><IconSettings /></AmuIcon>
        <span>{{ tx('个性设置', 'Preferences') }}</span>
      </div>
    </template>

    <div class="settings-drawer">
      <AmuTabs v-model="activeTab" class="settings-drawer__tabs">
        <!-- 1. 外观与主题 -->
        <AmuTabPane name="appearance" :title="tx('外观', 'Theme')">
          <div class="settings-drawer__group">
            <div class="settings-drawer__item">
              <div class="settings-drawer__label">{{ tx('主题模式', 'Theme Mode') }}</div>
              <AmuSelect v-model="appStore.themeMode" style="width: 100%">
                <AmuOption :label="tx('浅色', 'Light')" value="light" />
                <AmuOption :label="tx('深色', 'Dark')" value="dark" />
                <AmuOption :label="tx('跟随系统', 'System')" value="system" />
              </AmuSelect>
            </div>

            <div class="settings-drawer__item">
              <div class="settings-drawer__label">{{ tx('主色预设', 'Primary Color') }}</div>
              <div class="settings-drawer__color-list">
                <button
                  v-for="color in colorPresets"
                  :key="color"
                  class="settings-drawer__color-dot"
                  :class="{ 'is-active': appStore.primaryColor === color }"
                  :style="{ background: color }"
                  @click="appStore.primaryColor = color"
                ></button>
              </div>
            </div>

            <div class="settings-drawer__item">
              <div class="settings-drawer__label">{{ tx('圆角系数', 'Radius Scale') }}</div>
              <AmuSelect v-model="appStore.radiusScale" style="width: 100%">
                <AmuOption :label="tx('无', 'None')" :value="0" />
                <AmuOption :label="tx('小', 'Small')" :value="0.25" />
                <AmuOption :label="tx('中', 'Medium')" :value="0.5" />
                <AmuOption :label="tx('大', 'Large')" :value="0.75" />
                <AmuOption :label="tx('更大', 'Larger')" :value="1" />
              </AmuSelect>
            </div>

            <div class="settings-drawer__item">
              <div class="settings-drawer__label">{{ tx('字号', 'Font Size') }}</div>
              <AmuInputNumber 
                v-model="appStore.fontSize" 
                :min="12" 
                :max="20" 
                style="width: 100%" 
              />
            </div>

            <div class="settings-drawer__item">
              <div class="settings-drawer__label">{{ tx('局部深色设置', 'Partial Dark Theme') }}</div>
              <div class="settings-drawer__switch-list">
                <div class="settings-drawer__switch-row">
                  <span>{{ tx('侧栏暗色', 'Sidebar Dark') }}</span>
                  <AmuSwitch v-model="appStore.sidebarDark" />
                </div>
                <div class="settings-drawer__switch-row">
                  <span>{{ tx('子侧栏暗色', 'Sidebar Child Dark') }}</span>
                  <AmuSwitch v-model="appStore.sidebarChildDark" />
                </div>
                <div class="settings-drawer__switch-row">
                  <span>{{ tx('顶栏暗色', 'Header Dark') }}</span>
                  <AmuSwitch v-model="appStore.headerDark" />
                </div>
              </div>
            </div>
          </div>
        </AmuTabPane>

        <!-- 2. 导航与布局 -->
        <AmuTabPane name="layout" :title="tx('布局', 'Layout')">
          <div class="settings-drawer__group">
            <div class="settings-drawer__item">
              <div class="settings-drawer__label">{{ tx('布局模式', 'Layout Mode') }}</div>
              <AmuSelect v-model="appStore.layoutMode" style="width: 100%">
                <AmuOption :label="tx('经典左侧', 'Vertical')" value="vertical" />
                <AmuOption :label="tx('双列侧栏', 'Double Column')" value="double-column" />
                <AmuOption :label="tx('顶部菜单', 'Horizontal')" value="horizontal" />
                <AmuOption :label="tx('混合导航', 'Mixed Nav')" value="mixed-nav" />
                <AmuOption :label="tx('混合双列', 'Mixed Column')" value="mixed-column" />
                <AmuOption :label="tx('内容全屏', 'Content Only')" value="content-only" />
              </AmuSelect>
            </div>

            <div class="settings-drawer__item">
              <div class="settings-drawer__label">{{ tx('内容宽度', 'Content Width') }}</div>
              <AmuSelect v-model="appStore.contentWidth" style="width: 100%">
                <AmuOption :label="tx('流式', 'Fluid')" value="fluid" />
                <AmuOption :label="tx('定宽', 'Fixed')" value="fixed" />
              </AmuSelect>
            </div>

            <div class="settings-drawer__item">
              <div class="settings-drawer__label">{{ tx('布局开关', 'Layout Switches') }}</div>
              <div class="settings-drawer__switch-list">
                <div class="settings-drawer__switch-row">
                  <span>{{ tx('显示侧边栏', 'Show Sidebar') }}</span>
                  <AmuSwitch v-model="appStore.showSidebar" />
                </div>
                <div class="settings-drawer__switch-row">
                  <span>{{ tx('显示折叠按钮', 'Show Collapse Button') }}</span>
                  <AmuSwitch v-model="appStore.showCollapseButton" />
                </div>
                <div class="settings-drawer__switch-row">
                  <span>{{ tx('折叠菜单', 'Collapse Menu') }}</span>
                  <AmuSwitch v-model="appStore.collapseMenu" />
                </div>
                <div class="settings-drawer__switch-row">
                  <span>{{ tx('显示混合子菜单', 'Show Mixed Child Menu') }}</span>
                  <AmuSwitch v-model="appStore.showMixedChildMenu" :disabled="appStore.layoutMode === 'double-column'" />
                </div>
                <div class="settings-drawer__switch-row">
                  <span>{{ tx('侧栏手风琴', 'Sidebar Accordion') }}</span>
                  <AmuSwitch v-model="appStore.sidebarAccordion" />
                </div>
              </div>
            </div>
          </div>
        </AmuTabPane>

        <!-- 3. 交互与动画 -->
        <AmuTabPane name="motion" :title="tx('交互', 'Motion')">
          <div class="settings-drawer__group">
            <div class="settings-drawer__item">
              <div class="settings-drawer__label">{{ tx('动画预设', 'Transition Preset') }}</div>
              <AmuSelect v-model="appStore.transitionPreset" style="width: 100%" :disabled="!appStore.pageTransition">
                <AmuOption :label="tx('淡入', 'Fade')" value="fade" />
                <AmuOption :label="tx('滑动', 'Slide')" value="slide" />
                <AmuOption :label="tx('缩放', 'Zoom')" value="zoom" />
                <AmuOption :label="tx('无', 'None')" value="none" />
              </AmuSelect>
            </div>
            
            <div class="settings-drawer__item">
              <div class="settings-drawer__switch-list">
                <div class="settings-drawer__switch-row">
                  <span>{{ tx('自动激活首个菜单', 'Auto Activate First Menu') }}</span>
                  <AmuSwitch v-model="appStore.autoActivateFirstMenu" />
                </div>
                <div class="settings-drawer__switch-row">
                  <span>{{ tx('页面切换动画', 'Page Transition') }}</span>
                  <AmuSwitch v-model="appStore.pageTransition" />
                </div>
                <div class="settings-drawer__switch-row">
                  <span>{{ tx('路由进度条', 'Route Progress') }}</span>
                  <AmuSwitch v-model="appStore.pageTransitionProgress" />
                </div>
                <div class="settings-drawer__switch-row">
                  <span>{{ tx('页面加载遮罩', 'Page Loading') }}</span>
                  <AmuSwitch v-model="appStore.pageLoading" />
                </div>
              </div>
            </div>
          </div>
        </AmuTabPane>
        
        <!-- 4. 系统其他 -->
        <AmuTabPane name="advanced" :title="tx('高级', 'Advanced')">
          <div class="settings-drawer__group">
            <div class="settings-drawer__item">
              <div class="settings-drawer__label">{{ tx('语言', 'Language') }}</div>
              <AmuSelect v-model="appStore.language" style="width: 100%">
                <AmuOption label="简体中文" value="zh-CN" />
                <AmuOption label="English" value="en-US" />
              </AmuSelect>
            </div>

            <div class="settings-drawer__item">
              <div class="settings-drawer__switch-list">
                <div class="settings-drawer__switch-row">
                  <span>{{ tx('动态标题', 'Dynamic Title') }}</span>
                  <AmuSwitch v-model="appStore.dynamicTitle" />
                </div>
                <div class="settings-drawer__switch-row">
                  <span>{{ tx('水印', 'Watermark') }}</span>
                  <AmuSwitch v-model="appStore.watermark" />
                </div>
                <div class="settings-drawer__switch-row">
                  <span>{{ tx('自动检查更新', 'Auto Check Updates') }}</span>
                  <AmuSwitch v-model="appStore.autoCheckUpdates" />
                </div>
                <div class="settings-drawer__switch-row">
                  <span>{{ tx('启用快捷键', 'Enable Shortcut') }}</span>
                  <AmuSwitch v-model="appStore.enableShortcut" />
                </div>
                <div class="settings-drawer__switch-row">
                  <span>{{ tx('搜索快捷键', 'Search Shortcut') }}</span>
                  <AmuSwitch v-model="appStore.enableSearchShortcut" :disabled="!appStore.enableShortcut" />
                </div>
                <div class="settings-drawer__switch-row">
                  <span>{{ tx('登出快捷键', 'Logout Shortcut') }}</span>
                  <AmuSwitch v-model="appStore.enableLogoutShortcut" :disabled="!appStore.enableShortcut" />
                </div>
                <div class="settings-drawer__switch-row">
                  <span>{{ tx('锁屏快捷键', 'Lock Shortcut') }}</span>
                  <AmuSwitch v-model="appStore.enableLockShortcut" :disabled="!appStore.enableShortcut" />
                </div>
              </div>
            </div>
          </div>
        </AmuTabPane>
      </AmuTabs>

      <div class="settings-drawer__footer">
        <AmuButton type="outline" @click="handleSerialize" style="flex: 1">{{ tx('序列化', 'Serialize') }}</AmuButton>
        <AmuButton type="outline" status="danger" @click="handleReset" style="flex: 1">{{ tx('恢复', 'Reset') }}</AmuButton>
      </div>
      <div v-if="copyFeedback" class="settings-drawer__feedback">{{ copyFeedback }}</div>
    </div>
  </AmuDrawer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { AmuDrawer } from 'amu-ui/drawer'
import { AmuTabs, AmuTabPane } from 'amu-ui/tabs'
import { AmuSelect, AmuOption } from 'amu-ui/select'
import { AmuSwitch } from 'amu-ui/switch'
import { AmuButton } from 'amu-ui/button'
import { AmuInputNumber } from 'amu-ui/input-number'
import { AmuIcon } from 'amu-ui/icon'
import { IconSettings } from '@amu-ui/icons'
import { useAppStore } from '../../store/app'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const appStore = useAppStore()
const activeTab = ref('appearance')
const copyFeedback = ref('')
const colorPresets = ['#1677ff', '#722ed1', '#eb2f96', '#13c2c2', '#52c41a', '#fa8c16', '#f5222d', '#595959']

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

const handleReset = () => {
  appStore.resetPreferences()
}

const handleSerialize = async () => {
  const text = JSON.stringify(appStore.preferenceSnapshot, null, 2)
  try {
    await navigator.clipboard.writeText(text)
    copyFeedback.value = tx('已复制配置', 'Configuration copied')
  } catch {
    copyFeedback.value = tx('复制失败', 'Copy failed')
  }
  window.setTimeout(() => {
    copyFeedback.value = ''
  }, 1500)
}

const tx = (zh: string, en: string) => (appStore.language === 'zh-CN' ? zh : en)
</script>

<style scoped>
.settings-drawer {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.settings-drawer__tabs {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

:deep(.amu-tabs__content) {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
}

/* 消除 drawer body 默认 padding，由内部接管 */
:deep(.amu-drawer__body) {
  padding: 0 !important;
}

.settings-drawer__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
}

.settings-drawer__group {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.settings-drawer__item {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.settings-drawer__label {
  color: var(--amu-color-text);
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
}

.settings-drawer__switch-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.settings-drawer__switch-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--amu-color-text);
  font-size: 14px;
}

.settings-drawer__color-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.settings-drawer__color-dot {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid var(--amu-color-border);
  cursor: pointer;
  transition: transform 0.2s;
  position: relative;
}

.settings-drawer__color-dot:hover {
  transform: scale(1.1);
}

.settings-drawer__color-dot.is-active::after {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: 6px;
  border: 2px solid var(--amu-color-primary);
}

.settings-drawer__footer {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid var(--amu-color-border);
}

.settings-drawer__feedback {
  color: var(--amu-color-status-success);
  font-size: 12px;
  text-align: center;
  position: absolute;
  bottom: 60px;
  left: 0;
  right: 0;
}
</style>
