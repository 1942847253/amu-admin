<template>
  <div class="page-container examples-ellipsis-view">
    <AmuRow :gutter="16">
      <AmuCol :xs="24" :xl="14">
        <AmuCard class="page-card">
          <template #title>文本省略示例</template>

          <div class="ellipsis-block">
            <div class="ellipsis-block__label">单行省略</div>
            <AmuTooltip :content="singleLineText">
              <template #reference>
                <div class="ellipsis-text ellipsis-text--single">{{ singleLineText }}</div>
              </template>
            </AmuTooltip>
          </div>

          <div class="ellipsis-block">
            <div class="ellipsis-block__label">两行省略</div>
            <AmuTooltip :content="multiLineText">
              <template #reference>
                <div class="ellipsis-text ellipsis-text--multi">{{ multiLineText }}</div>
              </template>
            </AmuTooltip>
          </div>

          <div class="ellipsis-block">
            <div class="ellipsis-block__label">表格单元格中的省略</div>
            <AmuTable :data="rows" border>
              <AmuTableColumn prop="module" label="模块" width="140" />
              <AmuTableColumn label="说明" min-width="280">
                <template #default="{ row }">
                  <AmuTooltip :content="row.description">
                    <template #reference>
                      <div class="ellipsis-text ellipsis-text--single">{{ row.description }}</div>
                    </template>
                  </AmuTooltip>
                </template>
              </AmuTableColumn>
            </AmuTable>
          </div>
        </AmuCard>
      </AmuCol>

      <AmuCol :xs="24" :xl="10">
        <AmuCard class="page-card">
          <template #title>样式规则</template>
          <AmuDescriptions :column="1" border>
            <AmuDescriptionsItem label="单行">`overflow: hidden` + `text-overflow: ellipsis` + `white-space: nowrap`</AmuDescriptionsItem>
            <AmuDescriptionsItem label="多行">推荐 `display: -webkit-box` + `-webkit-line-clamp`</AmuDescriptionsItem>
            <AmuDescriptionsItem label="交互建议">省略后优先补 Tooltip，而不是强行撑开布局</AmuDescriptionsItem>
          </AmuDescriptions>
        </AmuCard>
      </AmuCol>
    </AmuRow>
  </div>
</template>

<script setup lang="ts">
import { AmuCard } from 'amu-ui/card'
import { AmuDescriptions, AmuDescriptionsItem } from 'amu-ui/descriptions'
import { AmuRow } from 'amu-ui/row'
import { AmuCol } from 'amu-ui/col'
import { AmuTable, AmuTableColumn } from 'amu-ui/table'
import { AmuTooltip } from 'amu-ui/tooltip'

defineOptions({
  name: 'ExamplesEllipsisView'
})

const singleLineText = '这是一个用于后台模板演示的超长标题文案，用来展示列表页标题或说明文本在空间有限时如何优雅省略。'
const multiLineText = '在后台管理系统里，卡片描述、变更说明和日志摘要经常长度不稳定。如果没有统一的省略策略，页面会出现高度抖动、栅格错位和操作区被挤压等问题，所以模板里最好直接提供可复制的省略写法。'

const rows = [
  { module: '发布中心', description: '统一管理多环境部署、审批流和回滚策略，适合长度较长的操作说明展示。' },
  { module: '审计模块', description: '需要保留足够上下文，但又不能让表格列无限拉宽，因此通常会采用单行省略并配合 Tooltip。' }
]
</script>

<style scoped>
.ellipsis-block + .ellipsis-block {
  margin-top: 24px;
}

.ellipsis-block__label {
  margin-bottom: 12px;
  color: var(--amu-color-text-secondary);
  font-size: 14px;
}

.ellipsis-text {
  color: var(--amu-color-text-default);
}

.ellipsis-text--single {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ellipsis-text--multi {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-height: 1.7;
}
</style>