<template>
  <div class="profile-container">
    <AmuRow :gutter="16">
      
      <!-- 左侧：用户信息与导航 -->
      <AmuCol :span="6" :lg="6" :md="8" :sm="24" :xs="24">
        <AmuCard class="profile-side-card" :bordered="false" shadow="never">
          <div class="profile-user">
            <div class="profile-avatar-box">
              <img :src="profileAvatar" class="profile-avatar-img" :alt="profileName" />
              <div class="avatar-edit-mask">
                <AmuIcon><IconCamera /></AmuIcon>
              </div>
            </div>
            <div class="profile-name">{{ profileName }}</div>
            <div class="profile-role">{{ profileRole }}</div>
            
            <div class="profile-meta">
              <div class="meta-item">
                <AmuIcon><IconMapPin /></AmuIcon>
                <span>{{ profileDepartment }}</span>
              </div>
              <div class="meta-item">
                <AmuIcon><IconMail /></AmuIcon>
                <span>{{ profileEmail }}</span>
              </div>
            </div>
          </div>

          <div class="divider"></div>

          <div class="side-menu">
            <div 
              v-for="item in menuItems" 
              :key="item.key"
              class="menu-item"
              :class="{ 'is-active': activeTab === item.key }"
              @click="activeTab = item.key"
            >
              <div class="menu-item-left">
                <AmuIcon class="menu-icon"><component :is="item.icon" /></AmuIcon>
                <span class="menu-label">{{ item.label }}</span>
              </div>
              <AmuIcon v-if="activeTab === item.key" class="menu-active-icon"><IconChevronRight /></AmuIcon>
            </div>
          </div>

          <div class="divider"></div>

          <div class="side-tags">
            <div class="tags-title">标签</div>
            <div class="tags-content">
              <AmuTag v-for="tag in currentTags" :key="tag" size="small" bordered class="side-tag">{{ tag }}</AmuTag>
              <AmuTag v-if="tagsInputVisible" ref="saveTagInput" size="small" type="primary" bordered>Input...</AmuTag>
              <AmuTag v-else size="small" type="default" bordered class="tag-plus" @click="handleShowInput">+ New Tag</AmuTag>
            </div>
          </div>
        </AmuCard>
      </AmuCol>

      <!-- 右侧：详细设置面板 -->
      <AmuCol :span="18" :lg="18" :md="16" :sm="24" :xs="24">
        <AmuCard class="profile-main-card" :bordered="false" shadow="never">
          
          <div class="panel-header">
            <h2 class="panel-title">{{ currentTitle }}</h2>
          </div>

          <!-- Basic Settings -->
          <div v-show="activeTab === 'basic'" class="panel-content">
            <div class="form-item">
              <label class="form-label">邮箱</label>
              <div class="form-control">
                <AmuInput v-model="form.email" placeholder="请输入邮箱" />
              </div>
            </div>
            <div class="form-item">
              <label class="form-label">昵称</label>
              <div class="form-control">
                <AmuInput v-model="form.nickname" placeholder="请输入昵称" />
              </div>
            </div>
            <div class="form-item">
              <label class="form-label">个人简介</label>
              <div class="form-control">
                <AmuTextarea v-model="form.bio" :rows="4" placeholder="个人简介..." />
              </div>
            </div>
            <div class="form-item">
              <label class="form-label">国家/地区</label>
              <div class="form-control">
                <AmuSelect v-model="form.country" placeholder="请选择">
                  <AmuOption label="中国" value="China" />
                  <AmuOption label="美国" value="USA" />
                </AmuSelect>
              </div>
            </div>
            <div class="form-item">
              <label class="form-label">所在省市</label>
              <div class="form-control city-row">
                <AmuSelect v-model="form.province" placeholder="省份">
                  <AmuOption label="浙江省" value="Zhejiang" />
                  <AmuOption label="江苏省" value="Jiangsu" />
                </AmuSelect>
                <AmuSelect v-model="form.city" placeholder="城市">
                  <AmuOption label="杭州市" value="Hangzhou" />
                  <AmuOption label="宁波市" value="Ningbo" />
                </AmuSelect>
              </div>
            </div>
            <div class="form-item">
              <label class="form-label">联系电话</label>
              <div class="form-control phone-row">
                <AmuInput v-model="form.areaCode" style="width: 80px" placeholder="区号" />
                <AmuInput v-model="form.phone" placeholder="电话号码" />
              </div>
            </div>
            <div class="form-action">
              <AmuButton type="primary">更新基本信息</AmuButton>
            </div>
          </div>

          <!-- Security Settings -->
          <div v-show="activeTab === 'security'" class="panel-content">
            <div class="settings-list">
              <div class="settings-item">
                <div class="settings-info">
                  <div class="settings-title">账户密码</div>
                  <div class="settings-desc">当前密码强度：<span class="strong">强</span></div>
                </div>
                <AmuButton type="primary" plain size="small">修改</AmuButton>
              </div>
              <div class="settings-item">
                <div class="settings-info">
                  <div class="settings-title">密保手机</div>
                  <div class="settings-desc">已绑定手机：148****5422</div>
                </div>
                <AmuButton type="primary" plain size="small">修改</AmuButton>
              </div>
              <div class="settings-item">
                <div class="settings-info">
                  <div class="settings-title">密保问题</div>
                  <div class="settings-desc">未设置密保问题，密保问题可有效保护账户安全</div>
                </div>
                <AmuButton type="primary" plain size="small">设置</AmuButton>
              </div>
              <div class="settings-item">
                <div class="settings-info">
                  <div class="settings-title">备用邮箱</div>
                  <div class="settings-desc">已绑定邮箱：194***@qq.com</div>
                </div>
                <AmuButton type="primary" plain size="small">修改</AmuButton>
              </div>
              <div class="settings-item">
                <div class="settings-info">
                  <div class="settings-title">MFA 设备</div>
                  <div class="settings-desc">未绑定 MFA 设备，绑定后，可以进行二次确认</div>
                </div>
                <AmuButton type="primary" plain size="small">绑定</AmuButton>
              </div>
            </div>
          </div>

          <!-- Binding Settings -->
          <div v-show="activeTab === 'binding'" class="panel-content">
             <div class="settings-list">
              <div class="settings-item">
                <div class="settings-info has-icon">
                  <AmuIcon class="bind-icon alipay"><IconAlipay /></AmuIcon>
                  <div>
                    <div class="settings-title">绑定淘宝</div>
                    <div class="settings-desc">当前未绑定淘宝账号</div>
                  </div>
                </div>
                <AmuButton plain size="small">绑定</AmuButton>
              </div>
              <div class="settings-item">
                <div class="settings-info has-icon">
                  <AmuIcon class="bind-icon dingding"><IconDingding /></AmuIcon>
                  <div>
                    <div class="settings-title">绑定钉钉</div>
                    <div class="settings-desc">当前未绑定钉钉账号</div>
                  </div>
                </div>
                <AmuButton plain size="small">绑定</AmuButton>
              </div>
              <div class="settings-item">
                <div class="settings-info has-icon">
                  <AmuIcon class="bind-icon github"><IconGithub /></AmuIcon>
                  <div>
                    <div class="settings-title">绑定 Github</div>
                    <div class="settings-desc">当前未绑定 Github 账号</div>
                  </div>
                </div>
                <AmuButton plain size="small">绑定</AmuButton>
              </div>
            </div>
          </div>

          <!-- Notification Settings -->
          <div v-show="activeTab === 'notification'" class="panel-content">
             <div class="settings-list">
              <div class="settings-item">
                <div class="settings-info">
                  <div class="settings-title">账户密码</div>
                  <div class="settings-desc">其他用户的消息将以站内信的形式通知</div>
                </div>
                <AmuSwitch v-model="notify.messages" />
              </div>
              <div class="settings-item">
                <div class="settings-info">
                  <div class="settings-title">系统消息</div>
                  <div class="settings-desc">系统消息将以站内信的形式通知</div>
                </div>
                <AmuSwitch v-model="notify.system" />
              </div>
              <div class="settings-item">
                <div class="settings-info">
                  <div class="settings-title">待办任务</div>
                  <div class="settings-desc">待办任务将以站内信的形式通知</div>
                </div>
                <AmuSwitch v-model="notify.todo" />
              </div>
            </div>
          </div>
        </AmuCard>
      </AmuCol>
    </AmuRow>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { AmuCard } from 'amu-ui/card'
import { AmuRow } from 'amu-ui/row'
import { AmuCol } from 'amu-ui/col'
import { AmuButton } from 'amu-ui/button'
import { AmuInput } from 'amu-ui/input'
import { AmuTextarea } from 'amu-ui/textarea'
import { AmuIcon } from 'amu-ui/icon'
import { AmuTag } from 'amu-ui/tag'
import { AmuSwitch } from 'amu-ui/switch'
import { AmuSelect, AmuOption } from 'amu-ui/select'
import { 
  IconCamera,
  IconMapPin,
  IconMail,
  IconChevronRight,
  IconLink as IconAlipay,
  IconGitlab as IconGithub,
  IconMessageCircle as IconDingding,
  IconUser,
  IconShield,
  IconLink,
  IconBell
} from '@amu-ui/icons'
import { ROLE_LABELS } from '../config/app'
import { useAuthStore } from '../store/auth'
import { createAvatarDataUri } from '../utils/avatar'

defineOptions({ name: 'ProfileView' })

const authStore = useAuthStore()
const activeTab = ref('basic')
const tagsInputVisible = ref(false)
const currentTags = reactive(['吃饭', '睡觉', '打豆豆', '宅', '湖南人', 'node开发'])

const profileName = computed(() => {
  return authStore.user?.displayName || authStore.user?.username || 'Amu Admin'
})

const profileEmail = computed(() => {
  return authStore.user?.email || 'admin@amu-ui.com'
})

const profileDepartment = computed(() => {
  return authStore.user?.department || '平台架构中心'
})

const profileRole = computed(() => {
  const role = authStore.user?.role
  return role ? ROLE_LABELS[role].zh : '超级管理员'
})

const profileAvatar = computed(() => {
  const seed = authStore.user?.avatarSeed || authStore.user?.username || 'profile'
  return createAvatarDataUri(seed, profileName.value)
})

const menuItems = [
  { key: 'basic', label: '基本设置', icon: IconUser },
  { key: 'security', label: '安全设置', icon: IconShield },
  { key: 'binding', label: '账号绑定', icon: IconLink },
  { key: 'notification', label: '新消息通知', icon: IconBell },
]

const currentTitle = computed(() => {
  return menuItems.find(item => item.key === activeTab.value)?.label || ''
})

const form = reactive({
  email: profileEmail.value,
  nickname: profileName.value,
  bio: '一个真正的鳗',
  country: 'China',
  province: 'Shanghai',
  city: 'Minhang',
  address: '闵行区',
  phone: '0752-268888888',
  areaCode: '086'
})

const notify = reactive({
  messages: true,
  system: true,
  todo: true
})

const handleShowInput = () => {
  tagsInputVisible.value = true
}
</script>

<style scoped>
.profile-container {
  min-height: 100%;
}

/* Common Card Styles */
.profile-side-card,
.profile-main-card {
  height: 100%;
  border-radius: 4px; /* More square for admin feel */
  background: var(--amu-color-bg-elevated);
}

/* Side Panel */
.profile-user {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
}

.profile-avatar-box {
  width: 104px;
  height: 104px;
  margin-bottom: 20px;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
  cursor: pointer;
}

.profile-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-edit-mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
  color: #fff;
  font-size: 24px;
}

.profile-avatar-box:hover .avatar-edit-mask {
  opacity: 1;
}

.profile-name {
  font-size: 20px;
  font-weight: 500;
  color: var(--amu-color-text-primary);
  margin-bottom: 4px;
  line-height: 28px;
}

.profile-role {
  font-size: 14px;
  color: var(--amu-color-text-secondary);
  margin-bottom: 24px;
}

.profile-meta {
  width: 100%;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  color: var(--amu-color-text-default);
  font-size: 14px;
}

.divider {
  border-top: 1px dashed var(--amu-color-border-light);
  margin: 12px 0;
}

/* Side Menu */
.side-menu {
  padding: 8px 0;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 24px;
  cursor: pointer;
  color: var(--amu-color-text-default);
  transition: all 0.2s;
  font-size: 14px;
}

.menu-item-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.menu-icon {
  font-size: 16px;
  opacity: 0.8;
}

.menu-active-icon {
  font-size: 14px;
}

.menu-item:hover {
  color: var(--amu-color-primary);
}

.menu-item.is-active {
  color: var(--amu-color-primary);
  background: var(--amu-color-bg-fill);
  font-weight: 500;
}

/* Side Tags */
.side-tags {
  padding: 12px 24px 24px;
}

.tags-title {
  margin-bottom: 12px;
  color: var(--amu-color-text-primary);
  font-weight: 500;
  font-size: 14px;
}

.tags-content {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-plus {
  border-style: dashed;
  cursor: pointer;
}

/* Main Panel */
.panel-header {
  padding: 24px 0 24px;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--amu-color-border-light);
}

.panel-title {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
  line-height: 28px;
  color: var(--amu-color-text-primary);
}

.panel-content {
  max-width: 600px; /* Restrict width for better readability on desktop */
}

/* Form */
.form-item {
  display: flex;
  margin-bottom: 24px;
  align-items: flex-start;
}

.form-label {
  width: 100px;
  color: var(--amu-color-text-primary);
  font-size: 14px;
  line-height: 32px; /* Match input height */
  flex-shrink: 0;
}

.form-control {
  flex: 1;
}

.city-row, .phone-row {
  display: flex;
  gap: 8px;
}

.form-action {
  margin-left: 100px;
  padding-top: 8px;
}

/* Settings List (Security / Binding / Notification) */
.settings-list {
  display: flex;
  flex-direction: column;
}

.settings-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--amu-color-border-light);
}

.settings-item:last-child {
  border-bottom: none;
}

.settings-info {
  flex: 1;
  margin-right: 24px;
}

.settings-info.has-icon {
  display: flex;
  align-items: center;
  gap: 16px;
}

.settings-title {
  font-size: 14px;
  color: var(--amu-color-text-primary);
  font-weight: 500;
  margin-bottom: 4px;
}

.settings-desc {
  font-size: 13px;
  color: var(--amu-color-text-secondary);
}

.strong {
  color: var(--amu-color-status-success);
}

.bind-icon {
  font-size: 38px;
}
.alipay { color: #1890ff; }
.dingding { color: #2eabff; }
.github { color: #333; }

/* Responsive */
@media (max-width: 768px) {
  .form-item {
    flex-direction: column;
    gap: 8px;
  }
  
  .form-label {
    width: 100%;
    line-height: 1.5;
  }
  
  .form-action {
    margin-left: 0;
  }
  
  .panel-content {
    max-width: 100%;
  }

  /* Stack side and main on mobile */
  .profile-side-card {
    margin-bottom: 16px;
  }
}
</style>

