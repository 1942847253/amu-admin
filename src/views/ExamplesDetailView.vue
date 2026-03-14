<template>
  <div class="page-container examples-detail-view">
    <AmuCard class="page-card examples-detail-view__card">
      <template #title>详情展示示例</template>
      <template #extra>
        <AmuSpace>
          <AmuTag type="success">已上线</AmuTag>
          <AmuButton type="primary">发起变更</AmuButton>
        </AmuSpace>
      </template>

      <AmuDescriptions title="变更单信息" border>
        <AmuDescriptionsItem label="变更单号">CHG-20260308-001</AmuDescriptionsItem>
        <AmuDescriptionsItem label="所属系统">amu-admin</AmuDescriptionsItem>
        <AmuDescriptionsItem label="负责人">林川</AmuDescriptionsItem>
        <AmuDescriptionsItem label="创建时间">2026-03-08 10:20</AmuDescriptionsItem>
        <AmuDescriptionsItem label="发布时间" :span="2">2026-03-08 20:00</AmuDescriptionsItem>
        <AmuDescriptionsItem label="状态" :span="3">
          <AmuTag type="warning">待窗口发布</AmuTag>
        </AmuDescriptionsItem>
        <AmuDescriptionsItem label="关联模块">示例菜单、布局导航、权限种子</AmuDescriptionsItem>
        <AmuDescriptionsItem label="风险说明" :span="2">影响菜单渲染和模板初始化数据，需要前后端同步上线。</AmuDescriptionsItem>
      </AmuDescriptions>

      <div class="examples-detail-view__metrics">
        <div class="metric-card">
          <div class="metric-card__label">准备进度</div>
          <AmuProgress type="circle" :width="120" :percentage="78" />
        </div>
        <div class="metric-card">
          <div class="metric-card__label">验证进度</div>
          <AmuProgress type="dashboard" :width="120" :percentage="64" status="warning" />
        </div>
      </div>

      <AmuTabs v-model="activeTab">
        <AmuTabPane name="timeline" title="处理记录">
          <div class="detail-list">
            <div v-for="item in timeline" :key="item.time" class="detail-list__item">
              <div class="detail-list__time">{{ item.time }}</div>
              <div class="detail-list__content">
                <div class="detail-list__title">{{ item.title }}</div>
                <div class="detail-list__desc">{{ item.description }}</div>
              </div>
            </div>
          </div>
        </AmuTabPane>
        <AmuTabPane name="resources" title="关联资源">
          <AmuTable :data="resources" border>
            <AmuTableColumn prop="name" label="资源名称" min-width="220" />
            <AmuTableColumn prop="type" label="类型" width="120" />
            <AmuTableColumn prop="owner" label="负责人" width="120" />
          </AmuTable>
        </AmuTabPane>
      </AmuTabs>
    </AmuCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { AmuButton } from 'amu-ui/button'
import { AmuCard } from 'amu-ui/card'
import { AmuDescriptions, AmuDescriptionsItem } from 'amu-ui/descriptions'
import { AmuProgress } from 'amu-ui/progress'
import { AmuSpace } from 'amu-ui/space'
import { AmuTable, AmuTableColumn } from 'amu-ui/table'
import { AmuTabs, AmuTabPane } from 'amu-ui/tabs'
import { AmuTag } from 'amu-ui/tag'

defineOptions({
  name: 'ExamplesDetailView'
})

const activeTab = ref('timeline')

const timeline = [
  { time: '10:20', title: '提交变更单', description: '创建人已补充变更说明与发布窗口。' },
  { time: '13:00', title: '完成联调', description: '前后端已确认菜单、权限和页面渲染链路正常。' },
  { time: '16:30', title: '等待发布', description: '当前进入上线前最终核验阶段。' }
]

const resources = [
  { name: 'templates/amu-admin/src/router/routes.ts', type: '前端路由', owner: '前端' },
  { name: 'templates/amu-admin/src/views/ExamplesFormView.vue', type: '示例页面', owner: '前端' },
  { name: 'templates/amu-admin-server/src/access-control/access-control.seed.ts', type: '菜单种子', owner: '服务端' }
]
</script>

<style scoped>
.examples-detail-view__card {
  gap: 20px;
}

.examples-detail-view__metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin: 20px 0;
}

.metric-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 16px;
  min-width: 180px;
  border: 1px solid var(--amu-color-border);
  border-radius: var(--amu-radius);
  background: var(--amu-color-bg-fill);
}

.metric-card__label {
  color: var(--amu-color-text-secondary);
}

.detail-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-list__item {
  display: grid;
  grid-template-columns: 88px 1fr;
  gap: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--amu-color-border-light);
}

.detail-list__time {
  color: var(--amu-color-text-secondary);
}

.detail-list__title {
  color: var(--amu-color-text-default);
  font-weight: 600;
  margin-bottom: 6px;
}

.detail-list__desc {
  color: var(--amu-color-text-secondary);
  line-height: 1.6;
}
</style>