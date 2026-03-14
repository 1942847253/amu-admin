import type { App, DirectiveBinding } from 'vue'
import { useAuthStore } from '../store/auth'

const ORIGINAL_DISPLAY_KEY = 'amuPermissionOriginalDisplay'

const hideElement = (el: HTMLElement) => {
  if (!(ORIGINAL_DISPLAY_KEY in el.dataset)) {
    el.dataset[ORIGINAL_DISPLAY_KEY] = el.style.display || ''
  }

  el.style.display = 'none'
  el.setAttribute('aria-hidden', 'true')
}

const showElement = (el: HTMLElement) => {
  const originalDisplay = el.dataset[ORIGINAL_DISPLAY_KEY]
  el.style.display = originalDisplay ?? ''
  delete el.dataset[ORIGINAL_DISPLAY_KEY]
  el.removeAttribute('aria-hidden')
}

const checkAndToggleElement = (el: HTMLElement, binding: DirectiveBinding<string | string[]>) => {
  const authStore = useAuthStore()
  const required = binding.value

  if (!required) {
    showElement(el)
    return
  }

  const passed = authStore.hasPermission(required)
  if (!passed) {
    hideElement(el)
    return
  }

  showElement(el)
}

export const setupPermissionDirective = (app: App) => {
  app.directive('permission', {
    mounted(el, binding) {
      checkAndToggleElement(el as HTMLElement, binding)
    },
    updated(el, binding) {
      checkAndToggleElement(el as HTMLElement, binding)
    }
  })
}
