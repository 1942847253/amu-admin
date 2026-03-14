<template>
  <div class="login-container" :class="[`is-layout-${loginLayout}`]">
    <div class="login-toolbar">
      <AmuDropdown trigger="click" placement="bottom-end">
        <template #trigger>
          <button type="button" class="login-toolbar__item is-active" :title="tx('主题色', 'Theme Color')">
            <span class="login-toolbar__glyph login-toolbar__glyph--palette"></span>
          </button>
        </template>
        <template #overlay>
          <div class="login-toolbar__panel">
            <div class="login-toolbar__panel-title">{{ tx('主题色', 'Theme Color') }}</div>
            <div class="login-toolbar__color-list">
              <button
                v-for="color in colorPresets"
                :key="color"
                type="button"
                class="login-toolbar__color-dot"
                :class="{ 'is-active': appStore.primaryColor === color }"
                :style="{ background: color }"
                @click="appStore.primaryColor = color"
              ></button>
            </div>
          </div>
        </template>
      </AmuDropdown>

      <span class="login-toolbar__divider"></span>

      <AmuDropdown trigger="click" placement="bottom-end">
        <template #trigger>
          <button type="button" class="login-toolbar__item" :title="tx('布局模式', 'Layout Mode')">
            <span class="login-toolbar__glyph login-toolbar__glyph--layout"></span>
          </button>
        </template>
        <template #overlay>
          <div class="login-toolbar__panel login-toolbar__panel--menu">
            <div class="login-toolbar__panel-title">{{ tx('布局模式', 'Layout Mode') }}</div>
            <button
              v-for="item in layoutOptions"
              :key="item.value"
              type="button"
              class="login-toolbar__menu-item"
              :class="{ 'is-active': loginLayout === item.value }"
              @click="setLoginLayout(item.value)"
            >
              <AmuIcon :class="{ 'is-mirrored': item.value === 'right' }">
                <component :is="item.icon" />
              </AmuIcon>
              <span>{{ item.label }}</span>
            </button>
          </div>
        </template>
      </AmuDropdown>

      <span class="login-toolbar__divider"></span>

      <button
        type="button"
        class="login-toolbar__item"
        :title="tx('切换语言', 'Switch Language')"
        @click="toggleLanguage"
      >
        <span class="login-toolbar__glyph login-toolbar__glyph--translate"></span>
      </button>

      <span class="login-toolbar__divider"></span>

      <button
        type="button"
        class="login-toolbar__item"
        :class="{ 'is-active': appStore.isDark }"
        :title="tx('切换明暗模式', 'Toggle Color Mode')"
        @click="appStore.toggleDark()"
      >
        <AmuIcon class="login-toolbar__icon-mode">
          <component :is="appStore.isDark ? IconSun : IconMoon" />
        </AmuIcon>
      </button>
    </div>

    <div class="logo-area">
      <div class="logo-icon">{{ logoMark }}</div>
      <h1 class="logo-text">{{ APP_META.name }}</h1>
    </div>

    <!-- 左侧品牌展示区 -->
    <div class="login-branding">
      <div class="branding-content">
        <div class="illustration">
          <!-- 抽象科技感 SVG 插画 (适配浅色背景) -->
          <svg viewBox="0 0 500 400" xmlns="http://www.w3.org/2000/svg" class="feature-svg">
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#409eff" stop-opacity="0.2" />
                <stop offset="100%" stop-color="#409eff" stop-opacity="0.05" />
              </linearGradient>
              <linearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%">
                 <stop offset="0%" stop-color="#409eff" stop-opacity="0.8" />
                 <stop offset="100%" stop-color="#337 ecc" stop-opacity="1" />
              </linearGradient>
            </defs>
            <!-- 背景卡片 -->
            <rect x="50" y="100" width="300" height="200" rx="10" fill="url(#grad1)" transform="rotate(-5 200 200)" />
            <rect x="80" y="80" width="300" height="200" rx="10" fill="url(#grad1)" transform="rotate(5 230 180)" />
            
            <!-- 主卡片 -->
            <rect x="100" y="50" width="320" height="220" rx="12" fill="#fff" stroke="#dcdfe6" stroke-width="1" style="filter: drop-shadow(0 8px 24px rgba(0,0,0,0.08));"/>
            
            <!-- 数据柱状图示意 -->
            <rect x="140" y="180" width="30" height="60" rx="4" fill="url(#grad2)" opacity="0.9"/>
            <rect x="190" y="140" width="30" height="100" rx="4" fill="url(#grad2)" opacity="0.7"/>
            <rect x="240" y="160" width="30" height="80" rx="4" fill="url(#grad2)" opacity="1"/>
            <rect x="290" y="100" width="30" height="140" rx="4" fill="url(#grad2)" opacity="0.8"/>
            <rect x="340" y="130" width="30" height="110" rx="4" fill="url(#grad2)" opacity="0.6"/>

            <!-- 装饰元素 -->
            <circle cx="380" cy="80" r="30" fill="#409eff" opacity="0.1" />
            <circle cx="120" cy="280" r="15" fill="#409eff" opacity="0.2" />
          </svg>
        </div>

        <div class="branding-text">
          <h2>{{ tx('开箱即用的企业级中台前端解决方案', 'An enterprise-ready admin solution out of the box') }}</h2>
          <p>{{ tx('基于 Vue 3 + TypeScript 构建，提供丰富的组件库与最佳实践', 'Built with Vue 3 and TypeScript, with a rich component system and solid best practices') }}</p>
        </div>
      </div>
    </div>

    <!-- 右侧登录表单区 -->
    <div class="login-form-area">
      <div class="form-wrapper">
        <h2 class="welcome-title">{{ tx('欢迎登录', 'Welcome Back') }}</h2>
        <p class="welcome-desc">{{ tx('请输入您的管理员账号与密码', 'Please enter your administrator account and password') }}</p>

        <AmuForm label-position="top" class="login-form">
          <AmuFormItem :label="tx('演示账号', 'Demo Account')">
            <AmuSpace direction="vertical">
                <AmuSelect size="large" v-model="selectedDemoAccount" @change="handleDemoAccountChange">
              <AmuOption
                v-for="account in demoAccounts"
                :key="account.username"
                :label="`${account.displayName} (${account.username})`"
                :value="account.username"
              />
            </AmuSelect>
            </AmuSpace>
          
          </AmuFormItem>

          <AmuFormItem :label="tx('用户名', 'Username')">
            <AmuInput 
              v-model="username" 
              placeholder="admin" 
              size="large"
            >
              <template #prefix>
                <span class="icon-placeholder">👤</span>
              </template>
            </AmuInput>
          </AmuFormItem>
          
          <AmuFormItem :label="tx('密码', 'Password')">
            <AmuInput 
              v-model="password" 
              type="password" 
              placeholder="******" 
              size="large"
              @keyup.enter="handleLogin"
            >
              <template #prefix>
                <span class="icon-placeholder">🔒</span>
              </template>
            </AmuInput>
          </AmuFormItem>

          <div class="form-actions">
            <label class="remember-me">
              <input type="checkbox" /> {{ tx('记住我', 'Remember me') }}
            </label>
            <a href="#" class="forgot-pwd">{{ tx('忘记密码？', 'Forgot password?') }}</a>
          </div>
          
          <AmuButton 
            type="primary" 
            size="large" 
            fill 
            :loading="loading"
            class="submit-btn"
            @click="handleLogin"
          >
            {{ tx('登 录', 'Sign In') }}
          </AmuButton>
        </AmuForm>
      </div>

      <div class="copyright">
        {{ APP_META.copyright }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AmuButton } from 'amu-ui/button'
import { AmuDropdown } from 'amu-ui/dropdown'
import { AmuForm, AmuFormItem } from 'amu-ui/form'
import { AmuIcon } from 'amu-ui/icon'
import { AmuInput } from 'amu-ui/input'
import { AmuMessage } from 'amu-ui/message'
import { AmuOption, AmuSelect } from 'amu-ui/select'
import type { SelectModelValue } from 'amu-ui/select'
import { AmuSpace } from 'amu-ui/space'
import { IconColumns, IconLayout, IconMoon, IconSidebar, IconSun } from '@amu-ui/icons'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { APP_META, DEMO_ACCOUNTS, ROLE_LABELS } from '../config/app'
import { useAppStore } from '../store/app'
import { useAuthStore } from '../store/auth'
import { usePermissionStore } from '../store/permission'
import { readStorage, writeStorage } from '../utils/storage'

type LoginLayoutMode = 'left' | 'center' | 'right'

const LOGIN_LAYOUT_KEY = 'amu-admin-login-layout'

const username = ref('admin')
const password = ref('123456')
const selectedDemoAccount = ref('admin')
const loading = ref(false)

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()
const permissionStore = usePermissionStore()
const initialLoginLayout = readStorage(LOGIN_LAYOUT_KEY)
const loginLayout = ref<LoginLayoutMode>(
  initialLoginLayout === 'left' || initialLoginLayout === 'center' || initialLoginLayout === 'right'
    ? initialLoginLayout
    : 'center'
)

const colorPresets = ['#1677ff', '#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6']
const logoMark = computed(() => APP_META.shortName.slice(0, 1).toUpperCase() || 'A')

const tx = (zh: string, en: string) => {
  return appStore.language === 'zh-CN' ? zh : en
}

const toggleLanguage = () => {
  appStore.language = appStore.language === 'zh-CN' ? 'en-US' : 'zh-CN'
}

const setLoginLayout = (value: LoginLayoutMode) => {
  loginLayout.value = value
  writeStorage(LOGIN_LAYOUT_KEY, value)
}

const layoutOptions = computed<Array<{ value: LoginLayoutMode; label: string; icon: typeof IconLayout }>>(() => {
  return [
    { value: 'left', label: tx('居左', 'Left'), icon: IconSidebar },
    { value: 'center', label: tx('居中', 'Center'), icon: IconColumns },
    { value: 'right', label: tx('居右', 'Right'), icon: IconSidebar }
  ]
})

const demoAccounts = computed(() => {
  return DEMO_ACCOUNTS.map((account) => ({
    ...account,
    displayName: appStore.language === 'zh-CN' ? account.displayName : account.title,
    roleLabel: appStore.language === 'zh-CN' ? ROLE_LABELS[account.role].zh : ROLE_LABELS[account.role].en
  }))
})

const applyDemoAccount = (nextUsername: string, nextPassword: string) => {
  username.value = nextUsername
  password.value = nextPassword
  selectedDemoAccount.value = nextUsername
}

const handleDemoAccountChange = (nextUsername: SelectModelValue) => {
  if (typeof nextUsername !== 'string') return
  const targetAccount = DEMO_ACCOUNTS.find((account) => account.username === nextUsername)
  if (!targetAccount) return
  applyDemoAccount(targetAccount.username, targetAccount.password)
}

const handleLogin = async () => {
  if (!username.value || !password.value) {
    AmuMessage.warning({ message: tx('请输入完整的账号和密码', 'Please enter both username and password') })
    return
  }
  
  loading.value = true
  try {
    await authStore.login(username.value, password.value)
    
    permissionStore.reset()
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/dashboard'
    await router.replace(redirect)
  } catch (error) {
    const message = error instanceof Error ? error.message : tx('登录失败，请稍后重试', 'Login failed, please try again later')
    AmuMessage.error({ message })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  position: relative;
  min-height: 100vh;
  width: 100vw;
  display: flex;
  background: var(--amu-color-bg-fill);
  overflow: hidden;
}

.login-container.is-layout-left .login-form-area {
  order: 0;
  align-items: flex-start;
  justify-content: center;
  padding-left: clamp(64px, 7vw, 140px);
  padding-right: 40px;
}

.login-container.is-layout-left .login-branding {
  order: 1;
}

.login-container.is-layout-right .login-branding {
  order: 0;
}

.login-container.is-layout-right .login-form-area {
  order: 1;
  align-items: flex-start;
  justify-content: center;
  padding-left: clamp(64px, 6vw, 120px);
  padding-right: 40px;
}

.login-container.is-layout-center {
  background: linear-gradient(90deg, #dfeafb 0%, #dfeafb 44%, #f5f6f8 44%, #f5f6f8 100%);
}

.login-container.is-layout-center .login-branding {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 50%;
  padding: 40px;
}

.login-container.is-layout-center .branding-content {
  max-width: 520px;
  min-height: 100vh;
  align-items: center;
  text-align: center;
  padding-top: 0;
}

.login-container.is-layout-center .login-form-area {
  flex: 1;
  width: 100%;
  background: transparent;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.login-container.is-layout-center .form-wrapper {
  width: min(640px, calc(100vw - 160px));
  max-width: 640px;
  min-height: 620px;
  padding: 48px 56px 36px;
  border-radius: 24px;
  background: var(--amu-color-bg);
  box-shadow: 0 24px 64px color-mix(in srgb, var(--amu-color-text) 12%, transparent);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.login-container.is-layout-center .copyright {
  position: static;
  margin-top: 24px;
  text-align: center;
}

.login-toolbar {
  position: absolute;
  top: 24px;
  right: 28px;
  z-index: 6;
  display: inline-flex;
  align-items: center;
  gap: 0;
  padding: 4px 8px;
  border-radius: 999px;
  background: #f4f4f5;
  border: 1px solid rgba(15, 23, 42, 0.03);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.88);
}

.login-toolbar__item {
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: #4f5562;
  cursor: pointer;
  transition: color 0.2s ease, opacity 0.2s ease, background-color 0.2s ease;
}

.login-toolbar__item:hover {
  color: var(--amu-color-primary);
  background: rgba(255, 255, 255, 0.42);
}

.login-toolbar__item.is-active {
  color: var(--amu-color-primary);
}

.login-toolbar__divider {
  width: 1px;
  height: 16px;
  margin: 0 1px;
  background: #d6d7da;
}

.login-toolbar__glyph {
  position: relative;
  display: inline-block;
  width: 15px;
  height: 15px;
}

.login-toolbar__glyph--palette {
  border: 2px solid currentColor;
  border-radius: 50% 50% 46% 52%;
  transform: rotate(-16deg);
  box-sizing: border-box;
}

.login-toolbar__glyph--palette::before,
.login-toolbar__glyph--palette::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  background: currentColor;
}

.login-toolbar__glyph--palette::before {
  width: 2px;
  height: 2px;
  top: 3px;
  left: 4px;
  box-shadow: 5px -1px 0 currentColor, 1px 6px 0 currentColor, 5px 5px 0 currentColor;
}

.login-toolbar__glyph--palette::after {
  width: 5px;
  height: 5px;
  right: -1px;
  bottom: 0;
  background: #f4f4f5;
}

.login-toolbar__glyph--layout {
  width: 14px;
  height: 14px;
  border: 2px solid currentColor;
  border-radius: 2px;
  box-sizing: border-box;
}

.login-toolbar__glyph--layout::before {
  content: '';
  position: absolute;
  top: 1px;
  bottom: 1px;
  left: 50%;
  width: 2px;
  transform: translateX(-50%);
  background: currentColor;
}

.login-toolbar__glyph--translate::before,
.login-toolbar__glyph--translate::after {
  position: absolute;
  color: currentColor;
  font-weight: 600;
  line-height: 1;
}

.login-toolbar__glyph--translate::before {
  content: '文';
  left: 1px;
  top: 1px;
  font-size: 10px;
}

.login-toolbar__glyph--translate::after {
  content: 'A';
  right: 0;
  bottom: 0;
  font-size: 9px;
}

.login-toolbar__glyph--translate {
  transform: translateY(-1px);
}

.login-toolbar__icon-mode {
  font-size: 14px;
  line-height: 1;
}

.login-toolbar__panel {
  min-width: 176px;
  padding: 14px;
  border-radius: 16px;
  background: var(--amu-color-bg-elevated);
  border: 1px solid var(--amu-color-border);
  box-shadow: var(--amu-shadow-popup);
}

.login-toolbar__panel--menu {
  min-width: 196px;
}

.login-toolbar__panel-title {
  margin-bottom: 10px;
  font-size: 12px;
  font-weight: 600;
  color: var(--amu-color-text-secondary);
}

.login-toolbar__color-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.login-toolbar__color-dot {
  position: relative;
  width: 32px;
  height: 32px;
  border: 2px solid transparent;
  border-radius: 999px;
  cursor: pointer;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.28);
}

.login-toolbar__color-dot.is-active {
  border-color: transparent;
}

.login-toolbar__color-dot.is-active::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 6px;
  height: 11px;
  border-right: 2px solid #ffffff;
  border-bottom: 2px solid #ffffff;
  transform: translate(-50%, -60%) rotate(40deg);
  box-sizing: border-box;
}

.login-toolbar__menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: none;
  border-radius: 12px;
  background: transparent;
  color: var(--amu-color-text-default);
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.login-toolbar__menu-item:hover,
.login-toolbar__menu-item.is-active {
  background: var(--amu-color-bg-fill);
  color: var(--amu-color-primary);
}

.is-mirrored {
  transform: scaleX(-1);
}

/* 左侧品牌区 */
.login-branding {
  flex: 1.24;
  background: linear-gradient(135deg, #dae2f8 0%, #d6a4a4 100%); /* 兜底 */
  background: linear-gradient(135deg, #e3e8f3 0%, #cfd9e8 100%);
  /* 模拟图片中的浅色磨砂质感 */
  background: radial-gradient(circle at 10% 10%, #dbeafe 0%, #f0f2f5 60%, #ffffff 100%);
  color: var(--amu-color-text);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  overflow: hidden;
}

/* 装饰背景圆 - 调整为更柔和的装饰 */
.login-branding::before {
  content: '';
  position: absolute;
  top: -10% ;
  left: -10%;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(64, 158, 255, 0.1) 0%, transparent 70%);
  filter: blur(40px);
}

.login-branding::after {
  content: '';
  position: absolute;
  bottom: -10%;
  right: -10%;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(64, 158, 255, 0.15) 0%, transparent 70%);
  filter: blur(40px);
}


.branding-content {
  position: relative;
  z-index: 2;
  max-width: 500px;
  width: 100%;
  min-height: 640px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-top: 32px;
}

.logo-area {
  position: absolute;
  top: 26px;
  left: 18px;
  display: flex;
  align-items: center;
  margin-bottom: 0;
  z-index: 3;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--amu-color-primary) 0%, var(--amu-color-primary-dark) 100%);
  color: var(--amu-color-on-primary);
  border-radius: 8px;
  display: grid;
  place-items: center;
  font-weight: bold;
  font-size: 24px;
  margin-right: 12px;
  box-shadow: 0 4px 10px rgba(var(--amu-color-primary-rgb), 0.3);
}

.logo-text {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  letter-spacing: 1px;
  color: var(--amu-color-text);
}

.illustration {
  margin: 40px 0;
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.branding-text h2 {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 16px;
  line-height: 1.4;
  color: var(--amu-color-text);
}

.branding-text p {
  font-size: 16px;
  color: var(--amu-color-text-secondary);
  line-height: 1.6;
}

/* 右侧表单区 */
.login-form-area {
  flex: 0.76;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--amu-color-bg);
  position: relative;
  padding: 40px;
}

.form-wrapper {
  width: 100%;
  max-width: 400px;
}

.welcome-title {
  font-size: 32px;
  color: var(--amu-color-text);
  margin-bottom: 12px;
  font-weight: 700;
}

.welcome-desc {
  color: var(--amu-color-text-secondary);
  margin-bottom: 40px;
  font-size: 14px;
}

.login-form {
  --amu-form-item-margin-bottom: 24px;
}

.icon-placeholder {
  font-size: 16px;
  margin-right: 4px;
  opacity: 0.6;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  font-size: 14px;
  color: var(--amu-color-text-secondary);
}

.remember-me {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.remember-me input {
  margin-right: 6px;
}

.forgot-pwd {
  color: var(--amu-color-primary);
  text-decoration: none;
}

.forgot-pwd:hover {
  text-decoration: underline;
}

.submit-btn {
  height: 44px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(var(--amu-color-primary-rgb), 0.2);
}

.copyright {
  position: absolute;
  bottom: 24px;
  color: var(--amu-color-text-disabled);
  font-size: 12px;
}

[data-amu-theme='dark'] .login-container {
  background:
    radial-gradient(circle at 12% 18%, color-mix(in srgb, var(--amu-color-primary) 20%, transparent) 0%, transparent 26%),
    radial-gradient(circle at 82% 84%, rgba(110, 168, 255, 0.08) 0%, transparent 22%),
    linear-gradient(135deg, #0b1530 0%, #111827 48%, #16181d 100%);
}

[data-amu-theme='dark'] .login-container.is-layout-center {
  background: linear-gradient(90deg, #101a2d 0%, #101a2d 44%, #171b21 44%, #171b21 100%);
}

[data-amu-theme='dark'] .login-toolbar {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.05);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

[data-amu-theme='dark'] .login-toolbar__item {
  color: rgba(255, 255, 255, 0.78);
}

[data-amu-theme='dark'] .login-toolbar__divider {
  background: rgba(255, 255, 255, 0.14);
}

[data-amu-theme='dark'] .login-toolbar__glyph--palette::after {
  background: rgba(255, 255, 255, 0.08);
}

[data-amu-theme='dark'] .login-toolbar__glyph--moon::after {
  background: rgba(255, 255, 255, 0.08);
}

[data-amu-theme='dark'] .login-branding {
  background: linear-gradient(180deg, rgba(10, 22, 48, 0.22) 0%, rgba(12, 20, 36, 0.1) 100%);
  color: var(--amu-color-text);
  border-right: 1px solid color-mix(in srgb, var(--amu-color-border) 60%, transparent);
  backdrop-filter: blur(6px);
}

[data-amu-theme='dark'] .login-branding::before {
  background: radial-gradient(circle, color-mix(in srgb, var(--amu-color-primary) 22%, transparent) 0%, transparent 72%);
}

[data-amu-theme='dark'] .login-branding::after {
  background: radial-gradient(circle, rgba(110, 168, 255, 0.14) 0%, transparent 72%);
}

[data-amu-theme='dark'] .feature-svg {
  filter: brightness(0.82) saturate(0.9) contrast(1.04);
}

[data-amu-theme='dark'] .login-form-area {
  background: linear-gradient(180deg, rgba(18, 22, 30, 0.72) 0%, rgba(19, 19, 21, 0.84) 100%);
  backdrop-filter: blur(6px);
}

[data-amu-theme='dark'] .login-container.is-layout-center .login-form-area {
  background: transparent;
  backdrop-filter: none;
}

[data-amu-theme='dark'] .login-container.is-layout-center .form-wrapper {
  background: rgba(20, 24, 32, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 28px 70px rgba(0, 0, 0, 0.32);
}

[data-amu-theme='dark'] .login-form-area::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: -96px;
  width: 160px;
  pointer-events: none;
  background: linear-gradient(90deg, transparent 0%, rgba(18, 22, 30, 0.28) 52%, rgba(18, 22, 30, 0.72) 100%);
}

@media (max-width: 900px) {
  .login-toolbar {
    top: 18px;
    right: 18px;
    padding: 4px 8px;
  }

  .logo-area {
    top: 18px;
    left: 16px;
  }

  .login-toolbar__item {
    width: 32px;
    height: 32px;
  }

  .login-branding {
    display: none;
  }

  .login-container.is-layout-left .login-form-area,
  .login-container.is-layout-right .login-form-area,
  .login-container.is-layout-center .login-form-area {
    padding: 96px 24px 32px;
    align-items: center;
  }

  .login-container.is-layout-center .form-wrapper {
    width: min(440px, calc(100vw - 48px));
    max-width: 440px;
    min-height: auto;
    padding: 32px 24px 24px;
  }
}
</style>
