<template>
  <div class="workplace">
    <!-- 头部欢迎区 -->
    <AmuCard class="workplace-banner" :body-style="{ padding: '24px' }">
      <div class="banner-content">
        <div class="banner-left">
          <img :src="currentUserAvatar" :alt="currentUserName" class="banner-avatar" />
          <div class="banner-info">
            <div class="banner-title">早安，{{ currentUserName }}，又是活力满满的一天！</div>
            <div class="banner-desc">今日晴朗，气温 18 - 26，适合编写优质的代码！</div>
          </div>
        </div>
        <div class="banner-right">
          <div class="stat-group">
            <div class="stat-item">
              <span class="stat-label">待办事项</span>
              <span class="stat-value"><strong>4</strong> / 12</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-label">参与项目</span>
              <span class="stat-value"><strong>8</strong></span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-label">团队成员</span>
              <span class="stat-value"><strong>126</strong></span>
            </div>
          </div>
        </div>
      </div>
    </AmuCard>

    <AmuRow :gutter="16" class="workplace-main">
      <!-- 左列 -->
      <AmuCol :span="16">
        <!-- 项目区块 -->
        <AmuCard title="近期项目" class="main-card">
          <template #extra>
            <AmuButton type="text" size="small">全部项目</AmuButton>
          </template>
          <div class="project-grid">
            <div class="project-card" v-for="item in projects" :key="item.id">
              <div class="project-header">
                <AmuIcon :size="24" :style="{ color: item.color }"><component :is="item.icon" /></AmuIcon>
                <span class="project-name">{{ item.name }}</span>
              </div>
              <div class="project-desc">{{ item.desc }}</div>
              <div class="project-footer">
                <span class="project-group">{{ item.group }}</span>
                <span class="project-date">{{ item.date }}</span>
              </div>
            </div>
          </div>
        </AmuCard>

        <!-- 动态区块 -->
        <AmuCard title="动态与事件" class="main-card activities-card">
          <div class="activity-list">
            <div class="activity-item" v-for="act in activities" :key="act.id">
              <img :src="resolveActivityAvatar(act.avatar, act.user)" :alt="act.user" class="activity-avatar" />
              <div class="activity-content">
                <div class="activity-text">
                  <span class="activity-user">{{ act.user }}</span>
                  <span class="activity-action">{{ act.action }}</span>
                  <span class="activity-target">{{ act.target }}</span>
                </div>
                <div class="activity-time">{{ act.time }}</div>
              </div>
            </div>
          </div>
        </AmuCard>
      </AmuCol>

      <!-- 右列 -->
      <AmuCol :span="8">
        <!-- 快捷入口 -->
        <AmuCard title="快捷入口" class="main-card">
          <div class="quick-nav-grid">
            <div class="quick-nav-item" v-for="nav in quickNavs" :key="nav.id">
              <AmuIcon :size="24" :style="{ color: nav.color }"><component :is="nav.icon" /></AmuIcon>
              <span class="quick-nav-text">{{ nav.name }}</span>
            </div>
          </div>
        </AmuCard>

        <!-- 待办任务 -->
        <AmuCard title="今日核心待办" class="main-card todo-card">
          <div class="todo-list">
            <div class="todo-item" v-for="todo in todos" :key="todo.id" :class="{ 'is-checked': todo.checked }">
              <AmuCheckbox v-model="todo.checked"></AmuCheckbox>
              <div class="todo-content">
                <div class="todo-title">{{ todo.title }}</div>
                <div class="todo-time">{{ todo.time }}</div>
              </div>
            </div>
          </div>
        </AmuCard>
      </AmuCol>
    </AmuRow>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { AmuCard } from 'amu-ui/card'
import { AmuRow } from 'amu-ui/row'
import { AmuCol } from 'amu-ui/col'
import { AmuIcon } from 'amu-ui/icon'
import { AmuButton } from 'amu-ui/button'
import { AmuCheckbox } from 'amu-ui/checkbox'
import {
  IconGithub,
  IconMonitor,
  IconCpu,
  IconLayers,
  IconActivity,
  IconBook,
  IconHome,
  IconSettings,
  IconShield,
  IconBarChart
} from '@amu-ui/icons'
import { APP_META } from '../config/app'
import { useAuthStore } from '../store/auth'
import { createAvatarDataUri } from '../utils/avatar'

defineOptions({
  name: 'WorkplaceView'
})

const authStore = useAuthStore()

const currentUserName = computed(() => {
  return authStore.user?.displayName || authStore.user?.username || APP_META.name
})

const currentUserAvatar = computed(() => {
  const seed = authStore.user?.avatarSeed || authStore.user?.username || 'amu-admin'
  return createAvatarDataUri(seed, currentUserName.value)
})

const resolveActivityAvatar = (seed: string, label: string) => {
  return createAvatarDataUri(seed, label)
}

const projects = ref([
  { id: 1, name: 'AmuUI Components', desc: '一套基于 Vue 3 打造的企业级组件库。', group: '架构组', date: '2026-02-28', icon: IconLayers, color: '#1890ff' },
  { id: 2, name: 'Admin Template', desc: '中后台应用模板，内置完整最佳实践。', group: '前端组', date: '2026-02-27', icon: IconMonitor, color: '#52c41a' },
  { id: 3, name: 'Node.js Microservices', desc: '服务端渲染支撑设施，保障高并发请求。', group: '服务端组', date: '2026-02-24', icon: IconCpu, color: '#722ed1' },
  { id: 4, name: 'Docs Site Gen', desc: '自研的极速文档站点构建工具，基于 Vite。', group: '基建组', date: '2026-02-20', icon: IconBook, color: '#faad14' },
  { id: 5, name: 'OpenSource Community', desc: '积极参与开源建设是改变世界的良好开始。', group: '开源组', date: '2026-02-15', icon: IconGithub, color: '#262626' },
  { id: 6, name: 'Data Visualization', desc: '大屏数据展示的核心模块及各种复杂图表。', group: '算法组', date: '2026-02-12', icon: IconActivity, color: '#eb2f96' },
])

const quickNavs = ref([
  { id: 1, name: '主控台', icon: IconHome, color: '#1890ff' },
  { id: 2, name: '系统管理', icon: IconSettings, color: '#52c41a' },
  { id: 3, name: '权限管控', icon: IconShield, color: '#eb2f96' },
  { id: 4, name: '组件展示', icon: IconLayers, color: '#faad14' },
  { id: 5, name: '数据看板', icon: IconBarChart, color: '#722ed1' },
  { id: 6, name: '代码仓库', icon: IconGithub, color: '#262626' },
])

const activities = ref([
  { id: 1, avatar: 'Molly', user: '产品经理 A', action: '新建了任务', target: '审批流页面重构规划', time: '刚才' },
  { id: 2, avatar: 'Chloe', user: '设计师 B', action: '上传了设计稿', target: '数据大屏 V2.0', time: '1 小时前' },
  { id: 3, avatar: 'Felix', user: '开发工程师 C', action: '提交了核心代码', target: '前端性能优化', time: '3 小时前' },
  { id: 4, avatar: 'Chester', user: '测试工程师 D', action: '指派了 Bug 给', target: '开发组', time: '1 天前' },
  { id: 5, avatar: 'Loki', user: '运维', action: '发布了新版本', target: 'v0.5.0-beta', time: '2 天前' },
])

const todos = ref([
  { id: 1, title: '审核前端关于Amu-UI的合并请求', time: '2026-02-28 15:00:00', checked: false },
  { id: 2, title: '评估并分析新功能的 CPU 占用性能', time: '2026-02-28 17:30:00', checked: true },
  { id: 3, title: '进行项目核心安全路由拦截测试检查', time: '2026-03-01 10:00:00', checked: false },
  { id: 4, title: '全量更新工作台相关底层依赖工具包', time: '2026-03-01 14:00:00', checked: false },
  { id: 5, title: '撰写本周的开发工作进度报告', time: '2026-03-02 09:00:00', checked: false },
])
</script>

<style scoped>
.workplace {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.workplace-banner {
  margin-bottom: 0px;
}

.banner-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.banner-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.banner-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: var(--amu-color-bg-fill);
  border: 1px solid var(--amu-color-border-light, #f0f0f0);
}

.banner-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--amu-color-text-default);
  margin-bottom: 8px;
}

.banner-desc {
  font-size: 14px;
  color: var(--amu-color-text-secondary);
}

.stat-group {
  display: flex;
  align-items: center;
  gap: 24px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.stat-label {
  font-size: 14px;
  color: var(--amu-color-text-secondary);
  margin-bottom: 4px;
}

.stat-value {
  font-size: 18px;
  color: var(--amu-color-text-default);
}
.stat-value strong {
  font-size: 24px;
  font-weight: 600;
}

.stat-divider {
  width: 1px;
  height: 36px;
  background-color: var(--amu-color-border-light, #f0f0f0);
}

.workplace-main {
  margin-top: 0;
}

.main-card {
  margin-bottom: 16px;
}

/* 项目区块 */
.project-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border-top: 1px solid var(--amu-color-border-light, #f0f0f0);
  border-left: 1px solid var(--amu-color-border-light, #f0f0f0);
}

.project-card {
  padding: 16px;
  border-right: 1px solid var(--amu-color-border-light, #f0f0f0);
  border-bottom: 1px solid var(--amu-color-border-light, #f0f0f0);
  transition: all 0.3s;
  cursor: pointer;
}
.project-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
  position: relative;
  background-color: var(--amu-color-bg-elevated);
  z-index: 1;
}

.project-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.project-name {
  font-size: 16px;
  font-weight: 500;
  color: var(--amu-color-text-default);
}

.project-desc {
  font-size: 13px;
  color: var(--amu-color-text-secondary);
  height: 40px;
  line-height: 1.5;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: var(--amu-color-text-placeholder);
}

/* 动态区块 */
.activities-card .activity-list {
  display: flex;
  flex-direction: column;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid var(--amu-color-border-light, #f0f0f0);
}
.activity-item:last-child {
  border-bottom: none;
}

.activity-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--amu-color-bg-fill);
}

.activity-content {
  flex: 1;
}

.activity-text {
  font-size: 14px;
  color: var(--amu-color-text-default);
  margin-bottom: 6px;
  line-height: 1.6;
}

.activity-user {
  font-weight: 500;
  margin-right: 8px;
}

.activity-action {
  color: var(--amu-color-text-secondary);
  margin-right: 8px;
}

.activity-target {
  color: var(--amu-color-primary);
  cursor: pointer;
}

.activity-time {
  font-size: 12px;
  color: var(--amu-color-text-placeholder);
}

/* 快捷入口 */
.quick-nav-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.quick-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  border-radius: 6px;
  background-color: var(--amu-color-bg-fill);
  cursor: pointer;
  transition: all 0.3s;
}

.quick-nav-item:hover {
  background-color: var(--amu-color-bg-elevated);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.quick-nav-text {
  font-size: 13px;
  color: var(--amu-color-text-default);
}

/* 待办事项 */
.todo-list {
  display: flex;
  flex-direction: column;
}

.todo-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 4px;
  transition: background-color 0.2s;
  border-bottom: 1px dashed var(--amu-color-border-light, #f0f0f0);
}
.todo-item:last-child {
  border-bottom: none;
}
.todo-item:hover {
  background-color: var(--amu-color-bg-fill);
}

.todo-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.todo-title {
  font-size: 14px;
  color: var(--amu-color-text-default);
  transition: color 0.2s;
}

.todo-time {
  font-size: 12px;
  color: var(--amu-color-text-placeholder);
}

.todo-item.is-checked .todo-title {
  text-decoration: line-through;
  color: var(--amu-color-text-placeholder);
}

@media screen and (max-width: 1200px) {
  .project-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
