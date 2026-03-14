import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { readStorage, removeStorage, writeStorage } from '../utils/storage'

const THEME_KEY = 'amu-admin-theme'
const SIDEBAR_KEY = 'amu-admin-sidebar-collapsed'
const PREFERENCES_KEY = 'amu-admin-preferences'

export type ThemeMode = 'light' | 'dark' | 'system'
export type LayoutMode = 'vertical' | 'double-column' | 'horizontal' | 'mixed-nav' | 'mixed-column' | 'content-only'
export type ContentWidthMode = 'fluid' | 'fixed'
export type TransitionPreset = 'fade' | 'slide' | 'zoom' | 'none'

export interface AppPreferences {
  themeMode: ThemeMode
  sidebarCollapsed: boolean
  sidebarDark: boolean
  sidebarChildDark: boolean
  headerDark: boolean
  primaryColor: string
  radiusScale: number
  fontSize: number
  layoutMode: LayoutMode
  contentWidth: ContentWidthMode
  showSidebar: boolean
  sidebarAccordion: boolean
  collapseMenu: boolean
  showMixedChildMenu: boolean
  autoActivateFirstMenu: boolean
  showCollapseButton: boolean
  showPinButton: boolean
  enableShortcut: boolean
  enableSearchShortcut: boolean
  enableLogoutShortcut: boolean
  enableLockShortcut: boolean
  language: 'zh-CN' | 'en-US'
  dynamicTitle: boolean
  watermark: boolean
  autoCheckUpdates: boolean
  pageTransitionProgress: boolean
  pageLoading: boolean
  pageTransition: boolean
  transitionPreset: TransitionPreset
}

const DEFAULT_PREFERENCES: AppPreferences = {
  themeMode: 'light',
  sidebarCollapsed: false,
  sidebarDark: false,
  sidebarChildDark: false,
  headerDark: false,
  primaryColor: '#1677ff',
  radiusScale: 0.5,
  fontSize: 14,
  layoutMode: 'vertical',
  contentWidth: 'fluid',
  showSidebar: true,
  sidebarAccordion: true,
  collapseMenu: true,
  showMixedChildMenu: false,
  autoActivateFirstMenu: false,
  showCollapseButton: true,
  showPinButton: true,
  enableShortcut: true,
  enableSearchShortcut: true,
  enableLogoutShortcut: true,
  enableLockShortcut: true,
  language: 'zh-CN',
  dynamicTitle: true,
  watermark: false,
  autoCheckUpdates: true,
  pageTransitionProgress: true,
  pageLoading: true,
  pageTransition: true,
  transitionPreset: 'slide'
}

const THEME_MODES: ThemeMode[] = ['light', 'dark', 'system']
const LAYOUT_MODES: LayoutMode[] = ['vertical', 'double-column', 'horizontal', 'mixed-nav', 'mixed-column', 'content-only']
const CONTENT_WIDTH_MODES: ContentWidthMode[] = ['fluid', 'fixed']
const TRANSITION_PRESETS: TransitionPreset[] = ['fade', 'slide', 'zoom', 'none']

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

const isNumberInRange = (value: unknown, min: number, max: number) => {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max
}

const resolveDarkByMode = (mode: ThemeMode) => {
  if (mode === 'dark') return true
  if (mode === 'light') return false
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

const readPreferences = (): AppPreferences => {
  const raw = readStorage(PREFERENCES_KEY)
  if (!raw) return { ...DEFAULT_PREFERENCES }

  try {
    const parsed = JSON.parse(raw) as unknown
    if (!isRecord(parsed)) return { ...DEFAULT_PREFERENCES }

    const next: AppPreferences = { ...DEFAULT_PREFERENCES }
    if (THEME_MODES.includes(parsed.themeMode as ThemeMode)) next.themeMode = parsed.themeMode as ThemeMode
    if (typeof parsed.sidebarCollapsed === 'boolean') next.sidebarCollapsed = parsed.sidebarCollapsed
    if (typeof parsed.sidebarDark === 'boolean') next.sidebarDark = parsed.sidebarDark
    if (typeof parsed.sidebarChildDark === 'boolean') next.sidebarChildDark = parsed.sidebarChildDark
    if (typeof parsed.headerDark === 'boolean') next.headerDark = parsed.headerDark
    if (typeof parsed.primaryColor === 'string' && parsed.primaryColor.trim()) next.primaryColor = parsed.primaryColor
    if (isNumberInRange(parsed.radiusScale, 0, 1)) next.radiusScale = Number(parsed.radiusScale)
    if (isNumberInRange(parsed.fontSize, 12, 20)) next.fontSize = Number(parsed.fontSize)
    if (LAYOUT_MODES.includes(parsed.layoutMode as LayoutMode)) next.layoutMode = parsed.layoutMode as LayoutMode
    if (CONTENT_WIDTH_MODES.includes(parsed.contentWidth as ContentWidthMode)) next.contentWidth = parsed.contentWidth as ContentWidthMode
    if (typeof parsed.showSidebar === 'boolean') next.showSidebar = parsed.showSidebar
    if (typeof parsed.sidebarAccordion === 'boolean') next.sidebarAccordion = parsed.sidebarAccordion
    if (typeof parsed.collapseMenu === 'boolean') next.collapseMenu = parsed.collapseMenu
    if (typeof parsed.showMixedChildMenu === 'boolean') next.showMixedChildMenu = parsed.showMixedChildMenu
    if (typeof parsed.autoActivateFirstMenu === 'boolean') next.autoActivateFirstMenu = parsed.autoActivateFirstMenu
    if (typeof parsed.showCollapseButton === 'boolean') next.showCollapseButton = parsed.showCollapseButton
    if (typeof parsed.showPinButton === 'boolean') next.showPinButton = parsed.showPinButton
    if (typeof parsed.enableShortcut === 'boolean') next.enableShortcut = parsed.enableShortcut
    if (typeof parsed.enableSearchShortcut === 'boolean') next.enableSearchShortcut = parsed.enableSearchShortcut
    if (typeof parsed.enableLogoutShortcut === 'boolean') next.enableLogoutShortcut = parsed.enableLogoutShortcut
    if (typeof parsed.enableLockShortcut === 'boolean') next.enableLockShortcut = parsed.enableLockShortcut
    if (parsed.language === 'zh-CN' || parsed.language === 'en-US') next.language = parsed.language
    if (typeof parsed.dynamicTitle === 'boolean') next.dynamicTitle = parsed.dynamicTitle
    if (typeof parsed.watermark === 'boolean') next.watermark = parsed.watermark
    if (typeof parsed.autoCheckUpdates === 'boolean') next.autoCheckUpdates = parsed.autoCheckUpdates
    if (typeof parsed.pageTransitionProgress === 'boolean') next.pageTransitionProgress = parsed.pageTransitionProgress
    if (typeof parsed.pageLoading === 'boolean') next.pageLoading = parsed.pageLoading
    if (typeof parsed.pageTransition === 'boolean') next.pageTransition = parsed.pageTransition
    if (TRANSITION_PRESETS.includes(parsed.transitionPreset as TransitionPreset)) next.transitionPreset = parsed.transitionPreset as TransitionPreset

    return next
  } catch {
    return { ...DEFAULT_PREFERENCES }
  }
}

export const useAppStore = defineStore('app', () => {
  const legacyTheme = readStorage(THEME_KEY)
  const legacySidebar = readStorage(SIDEBAR_KEY)
  const initialPreferences = readPreferences()
  if (legacyTheme === 'dark' || legacyTheme === 'light') {
    initialPreferences.themeMode = legacyTheme
  }
  if (legacySidebar === '1' || legacySidebar === '0') {
    initialPreferences.sidebarCollapsed = legacySidebar === '1'
  }

  const themeMode = ref<ThemeMode>(initialPreferences.themeMode)
  const isDark = ref(resolveDarkByMode(initialPreferences.themeMode))
  const sidebarCollapsed = ref(initialPreferences.sidebarCollapsed)
  const sidebarDark = ref(initialPreferences.sidebarDark)
  const sidebarChildDark = ref(initialPreferences.sidebarChildDark)
  const headerDark = ref(initialPreferences.headerDark)
  const primaryColor = ref(initialPreferences.primaryColor)
  const radiusScale = ref(initialPreferences.radiusScale)
  const fontSize = ref(initialPreferences.fontSize)
  const layoutMode = ref<LayoutMode>(initialPreferences.layoutMode)
  const contentWidth = ref<ContentWidthMode>(initialPreferences.contentWidth)
  const showSidebar = ref(initialPreferences.showSidebar)
  const sidebarAccordion = ref(initialPreferences.sidebarAccordion)
  const collapseMenu = ref(initialPreferences.collapseMenu)
  const showMixedChildMenu = ref(initialPreferences.showMixedChildMenu)
  const autoActivateFirstMenu = ref(initialPreferences.autoActivateFirstMenu)
  const showCollapseButton = ref(initialPreferences.showCollapseButton)
  const showPinButton = ref(initialPreferences.showPinButton)
  const enableShortcut = ref(initialPreferences.enableShortcut)
  const enableSearchShortcut = ref(initialPreferences.enableSearchShortcut)
  const enableLogoutShortcut = ref(initialPreferences.enableLogoutShortcut)
  const enableLockShortcut = ref(initialPreferences.enableLockShortcut)
  const language = ref<'zh-CN' | 'en-US'>(initialPreferences.language)
  const dynamicTitle = ref(initialPreferences.dynamicTitle)
  const watermark = ref(initialPreferences.watermark)
  const autoCheckUpdates = ref(initialPreferences.autoCheckUpdates)
  const pageTransitionProgress = ref(initialPreferences.pageTransitionProgress)
  const pageLoading = ref(initialPreferences.pageLoading)
  const pageTransition = ref(initialPreferences.pageTransition)
  const transitionPreset = ref<TransitionPreset>(initialPreferences.transitionPreset)

  const preferenceSnapshot = computed<AppPreferences>(() => {
    return {
      themeMode: themeMode.value,
      sidebarCollapsed: sidebarCollapsed.value,
      sidebarDark: sidebarDark.value,
      sidebarChildDark: sidebarChildDark.value,
      headerDark: headerDark.value,
      primaryColor: primaryColor.value,
      radiusScale: radiusScale.value,
      fontSize: fontSize.value,
      layoutMode: layoutMode.value,
      contentWidth: contentWidth.value,
      showSidebar: showSidebar.value,
      sidebarAccordion: sidebarAccordion.value,
      collapseMenu: collapseMenu.value,
      showMixedChildMenu: showMixedChildMenu.value,
      autoActivateFirstMenu: autoActivateFirstMenu.value,
      showCollapseButton: showCollapseButton.value,
      showPinButton: showPinButton.value,
      enableShortcut: enableShortcut.value,
      enableSearchShortcut: enableSearchShortcut.value,
      enableLogoutShortcut: enableLogoutShortcut.value,
      enableLockShortcut: enableLockShortcut.value,
      language: language.value,
      dynamicTitle: dynamicTitle.value,
      watermark: watermark.value,
      autoCheckUpdates: autoCheckUpdates.value,
      pageTransitionProgress: pageTransitionProgress.value,
      pageLoading: pageLoading.value,
      pageTransition: pageTransition.value,
      transitionPreset: transitionPreset.value
    }
  })

  const persistPreferences = () => {
    writeStorage(PREFERENCES_KEY, JSON.stringify(preferenceSnapshot.value))
    writeStorage(THEME_KEY, isDark.value ? 'dark' : 'light')
    writeStorage(SIDEBAR_KEY, sidebarCollapsed.value ? '1' : '0')
  }

  const applyThemeMode = (mode: ThemeMode) => {
    themeMode.value = mode
    isDark.value = resolveDarkByMode(mode)
  }

  const toggleDark = () => {
    applyThemeMode(isDark.value ? 'light' : 'dark')
  }

  const resetPreferences = () => {
    applyThemeMode(DEFAULT_PREFERENCES.themeMode)
    sidebarCollapsed.value = DEFAULT_PREFERENCES.sidebarCollapsed
    sidebarDark.value = DEFAULT_PREFERENCES.sidebarDark
    sidebarChildDark.value = DEFAULT_PREFERENCES.sidebarChildDark
    headerDark.value = DEFAULT_PREFERENCES.headerDark
    primaryColor.value = DEFAULT_PREFERENCES.primaryColor
    radiusScale.value = DEFAULT_PREFERENCES.radiusScale
    fontSize.value = DEFAULT_PREFERENCES.fontSize
    layoutMode.value = DEFAULT_PREFERENCES.layoutMode
    contentWidth.value = DEFAULT_PREFERENCES.contentWidth
    showSidebar.value = DEFAULT_PREFERENCES.showSidebar
    sidebarAccordion.value = DEFAULT_PREFERENCES.sidebarAccordion
    collapseMenu.value = DEFAULT_PREFERENCES.collapseMenu
    showMixedChildMenu.value = DEFAULT_PREFERENCES.showMixedChildMenu
    autoActivateFirstMenu.value = DEFAULT_PREFERENCES.autoActivateFirstMenu
    showCollapseButton.value = DEFAULT_PREFERENCES.showCollapseButton
    showPinButton.value = DEFAULT_PREFERENCES.showPinButton
    enableShortcut.value = DEFAULT_PREFERENCES.enableShortcut
    enableSearchShortcut.value = DEFAULT_PREFERENCES.enableSearchShortcut
    enableLogoutShortcut.value = DEFAULT_PREFERENCES.enableLogoutShortcut
    enableLockShortcut.value = DEFAULT_PREFERENCES.enableLockShortcut
    language.value = DEFAULT_PREFERENCES.language
    dynamicTitle.value = DEFAULT_PREFERENCES.dynamicTitle
    watermark.value = DEFAULT_PREFERENCES.watermark
    autoCheckUpdates.value = DEFAULT_PREFERENCES.autoCheckUpdates
    pageTransitionProgress.value = DEFAULT_PREFERENCES.pageTransitionProgress
    pageLoading.value = DEFAULT_PREFERENCES.pageLoading
    pageTransition.value = DEFAULT_PREFERENCES.pageTransition
    transitionPreset.value = DEFAULT_PREFERENCES.transitionPreset
  }

  watch(themeMode, (value) => {
    isDark.value = resolveDarkByMode(value)
  })

  watch(
    [
      themeMode,
      sidebarCollapsed,
      sidebarDark,
      sidebarChildDark,
      headerDark,
      primaryColor,
      radiusScale,
      fontSize,
      layoutMode,
      contentWidth,
      showSidebar,
      sidebarAccordion,
      collapseMenu,
      showMixedChildMenu,
      autoActivateFirstMenu,
      showCollapseButton,
      showPinButton,
      enableShortcut,
      enableSearchShortcut,
      enableLogoutShortcut,
      enableLockShortcut,
      language,
      dynamicTitle,
      watermark,
      autoCheckUpdates,
      pageTransitionProgress,
      pageLoading,
      pageTransition,
      transitionPreset,
      isDark
    ],
    () => {
      persistPreferences()
    },
    { immediate: true }
  )

  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', () => {
      if (themeMode.value !== 'system') return
      isDark.value = mediaQuery.matches
    })
  }

  const clearPreferenceStorage = () => {
    removeStorage(PREFERENCES_KEY)
    removeStorage(THEME_KEY)
    removeStorage(SIDEBAR_KEY)
  }

  return {
    themeMode,
    isDark,
    sidebarCollapsed,
    sidebarDark,
    sidebarChildDark,
    headerDark,
    primaryColor,
    radiusScale,
    fontSize,
    layoutMode,
    contentWidth,
    showSidebar,
    sidebarAccordion,
    collapseMenu,
    showMixedChildMenu,
    autoActivateFirstMenu,
    showCollapseButton,
    showPinButton,
    enableShortcut,
    enableSearchShortcut,
    enableLogoutShortcut,
    enableLockShortcut,
    language,
    dynamicTitle,
    watermark,
    autoCheckUpdates,
    pageTransitionProgress,
    pageLoading,
    pageTransition,
    transitionPreset,
    preferenceSnapshot,
    applyThemeMode,
    toggleDark,
    resetPreferences,
    clearPreferenceStorage
  }
})
