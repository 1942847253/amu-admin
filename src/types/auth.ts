export type UserRole = 'admin' | 'operator' | 'auditor' | 'security'

export interface DepartmentPathItem {
  id: string
  name: string
  parentId?: string
}

export interface MenuNode {
  key: string
  title: string
  icon?: string
  permission?: string | string[]
  children?: MenuNode[]
}

export interface UserProfile {
  id: string
  username: string
  role: UserRole
  displayName: string
  email: string
  department: string
  title: string
  avatarSeed: string
}

export interface AuthSessionPayload {
  accessToken: string
  refreshToken: string
  expiresIn: number
  currentUser: UserProfile & {
    permissions: string[]
    dataScope?: string
  }
  menus: MenuNode[]
}

export interface AccessOverviewPayload {
  currentUser: UserProfile & {
    permissions: string[]
    dataScope?: string
  }
  menus: MenuNode[]
  departments?: DepartmentPathItem[]
}
