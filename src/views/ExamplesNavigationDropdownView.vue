<template>
  <div class="page-container examples-navigation-dropdown-view">
    <AmuRow :gutter="16">
      <AmuCol :xs="24" :xl="15">
        <AmuCard class="page-card">
          <template #title>下拉菜单</template>

          <AmuSpace wrap>
            <AmuDropdown trigger="click" placement="bottom-start" @select="handleCommand">
              <AmuButton type="primary">页面操作</AmuButton>
              <template #overlay>
                <AmuDropdownMenu>
                  <AmuDropdownItem command="refresh">刷新数据</AmuDropdownItem>
                  <AmuDropdownItem command="copy">复制链接</AmuDropdownItem>
                  <AmuDropdownItem command="export">导出配置</AmuDropdownItem>
                </AmuDropdownMenu>
              </template>
            </AmuDropdown>

            <AmuDropdown trigger="click" placement="bottom-start" @select="handleCommand">
              <AmuButton>更多操作</AmuButton>
              <template #overlay>
                <AmuDropdownMenu>
                  <AmuDropdownItem command="pin">固定到快捷入口</AmuDropdownItem>
                  <AmuDropdownItem command="share">分享给同事</AmuDropdownItem>
                  <AmuDropdownItem command="delete">删除页面草稿</AmuDropdownItem>
                </AmuDropdownMenu>
              </template>
            </AmuDropdown>
          </AmuSpace>

          <div class="dropdown-result">
            <div class="dropdown-result__label">最近一次命令</div>
            <div class="dropdown-result__value">{{ lastCommand }}</div>
          </div>
        </AmuCard>
      </AmuCol>

      <AmuCol :xs="24" :xl="9">
        <AmuCard class="page-card">
          <template #title>实践建议</template>
          <AmuDescriptions :column="1" border>
            <AmuDescriptionsItem label="适用场景">把低频操作收纳起来，避免主界面按钮过多</AmuDescriptionsItem>
            <AmuDescriptionsItem label="命令设计">动作名称应直接说明结果，不要写模糊词</AmuDescriptionsItem>
            <AmuDescriptionsItem label="当前命令">{{ lastCommand }}</AmuDescriptionsItem>
          </AmuDescriptions>
        </AmuCard>
      </AmuCol>
    </AmuRow>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { AmuButton } from 'amu-ui/button'
import { AmuCard } from 'amu-ui/card'
import { AmuCol } from 'amu-ui/col'
import { AmuDescriptions, AmuDescriptionsItem } from 'amu-ui/descriptions'
import { AmuDropdown, AmuDropdownItem, AmuDropdownMenu } from 'amu-ui/dropdown'
import { AmuRow } from 'amu-ui/row'
import { AmuSpace } from 'amu-ui/space'

defineOptions({
  name: 'ExamplesNavigationDropdownView'
})

const lastCommand = ref('尚未触发命令')

const handleCommand = (command: string | number | object | undefined) => {
  lastCommand.value = `已触发 ${String(command ?? 'unknown')}`
}
</script>

<style scoped>
.dropdown-result {
  margin-top: 24px;
  padding: 16px;
  border: 1px solid var(--amu-color-border);
  border-radius: var(--amu-radius);
  background: var(--amu-color-bg-fill);
}

.dropdown-result__label {
  margin-bottom: 8px;
  color: var(--amu-color-text-secondary);
}

.dropdown-result__value {
  color: var(--amu-color-text-default);
  font-weight: 600;
}
</style>