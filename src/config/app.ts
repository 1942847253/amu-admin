import type { UserProfile, UserRole } from '../types/auth'

const resolveEnvText = (value: string | undefined, fallback: string) => {
  const nextValue = value?.trim()
  return nextValue ? nextValue : fallback
}

export interface DemoAccountRecord extends UserProfile {
  password: string
}

export const APP_META = {
  name: resolveEnvText(import.meta.env.VITE_APP_NAME, 'Amu Admin'),
  shortName: resolveEnvText(import.meta.env.VITE_APP_SHORT_NAME, 'AM'),
  title: resolveEnvText(import.meta.env.VITE_APP_TITLE, '企业级后台管理系统模板'),
  description: resolveEnvText(import.meta.env.VITE_APP_DESCRIPTION, '面向大型业务系统的前端基础底座，内置权限、路由、主题、标签页与请求链路最佳实践。'),
  copyright: resolveEnvText(import.meta.env.VITE_APP_COPYRIGHT, 'Copyright © 2026 Amu UI Team.'),
  repositoryUrl: resolveEnvText(import.meta.env.VITE_APP_REPOSITORY_URL, 'https://github.com/1942847253/amu-ui')
} as const

export const DEMO_ACCOUNTS: DemoAccountRecord[] = [
  {
    id: 'user-admin',
    username: 'admin',
    password: '123456',
    role: 'admin',
    displayName: '系统管理员',
    email: 'admin@amu-ui.com',
    department: '平台架构中心',
    title: 'Platform Owner',
    avatarSeed: 'admin-core'
  },
  {
    id: 'user-operator',
    username: 'operator',
    password: '123456',
    role: 'operator',
    displayName: '运营负责人',
    email: 'operator@amu-ui.com',
    department: '业务运营中心',
    title: 'Operations Lead',
    avatarSeed: 'operator-main'
  },
  {
    id: 'user-audit',
    username: 'audit',
    password: '123456',
    role: 'auditor',
    displayName: '审计专员',
    email: 'audit@amu-ui.com',
    department: '安全与合规中心',
    title: 'Security Auditor',
    avatarSeed: 'audit-watch'
  },
  {
    id: 'user-security',
    username: 'security',
    password: '123456',
    role: 'security',
    displayName: '安全管理员',
    email: 'security@amu-ui.com',
    department: '安全与合规中心',
    title: 'Security Officer',
    avatarSeed: 'security-guard'
  }
] satisfies DemoAccountRecord[]

export const ROLE_LABELS: Record<UserRole, { zh: string; en: string }> = {
  admin: { zh: '超级管理员', en: 'Administrator' },
  operator: { zh: '运营角色', en: 'Operator' },
  auditor: { zh: '审计角色', en: 'Auditor' },
  security: { zh: '安全角色', en: 'Security' }
}

export const getDemoAccountByUsername = (username: string) => {
  const normalized = username.trim().toLowerCase()
  return DEMO_ACCOUNTS.find((account) => account.username === normalized) ?? null
}
