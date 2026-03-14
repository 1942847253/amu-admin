<template>
  <RouterView />
</template>

<script setup lang="ts">
import { watch, onMounted } from 'vue'
import { useAppStore } from './store/app'
import { lighten, darken, hexToRgb } from './utils/color'

const appStore = useAppStore()

onMounted(() => {
  syncDocumentStyles()
})

const syncDocumentStyles = () => {
  const root = document.documentElement
  
  // Font Size
  root.style.setProperty('--amu-font-size-base', `${appStore.fontSize}px`)
  root.style.setProperty('--amu-font-size-small', `${Math.max(12, appStore.fontSize - 2)}px`)
  root.style.setProperty('--amu-font-size-large', `${appStore.fontSize + 2}px`)
  root.style.setProperty('--amu-font-size-extra-large', `${appStore.fontSize + 4}px`)
  
  // Radius based on scale (assume 4px is baseline for scale=0.5)
  const baseRadius = 8 * appStore.radiusScale // scale 0(0px), 0.5(4px), 1(8px)
  root.style.setProperty('--amu-radius-small', `${Math.max(0, baseRadius - 2)}px`)
  root.style.setProperty('--amu-radius-base', `${baseRadius}px`)
  root.style.setProperty('--amu-radius-large', `${baseRadius + 2}px`)
  root.style.setProperty('--amu-radius-round', `9999px`)
  
  // Primary color
  const primary = appStore.primaryColor
  root.style.setProperty('--amu-color-primary', primary)
  root.style.setProperty('--amu-color-primary-light', lighten(primary, 0.8))
  root.style.setProperty('--amu-color-primary-light-1', lighten(primary, 0.9))
  root.style.setProperty('--amu-color-primary-light-2', lighten(primary, 0.8))
  root.style.setProperty('--amu-color-primary-light-3', lighten(primary, 0.7))
  root.style.setProperty('--amu-color-primary-light-4', lighten(primary, 0.6))
  root.style.setProperty('--amu-color-primary-light-5', lighten(primary, 0.5))
  root.style.setProperty('--amu-color-primary-light-6', lighten(primary, 0.4))
  root.style.setProperty('--amu-color-primary-light-7', lighten(primary, 0.3))
  root.style.setProperty('--amu-color-primary-light-8', lighten(primary, 0.2))
  root.style.setProperty('--amu-color-primary-light-9', lighten(primary, 0.1))
  root.style.setProperty('--amu-color-primary-dark', darken(primary, 0.1))
  root.style.setProperty('--amu-color-primary-dark-2', darken(primary, 0.2))
  
  // Create RGB values for shadow and rgba
  const [r, g, b] = hexToRgb(primary)
  root.style.setProperty('--amu-color-primary-rgb', `${r}, ${g}, ${b}`)
  
  // Theme Mode
  if (appStore.isDark) {
    root.setAttribute('data-amu-theme', 'dark')
  } else {
    root.removeAttribute('data-amu-theme')
  }
}

watch(
  () => [appStore.primaryColor, appStore.radiusScale, appStore.fontSize, appStore.isDark],
  syncDocumentStyles,
  { deep: true }
)
</script>
