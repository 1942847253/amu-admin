import { afterEach } from 'vitest'

// 测试环境基础兜底，避免组件和 store 在 jsdom 下缺少浏览器能力。
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false
  })
})

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = ResizeObserver

afterEach(() => {
  document.body.innerHTML = ''
})