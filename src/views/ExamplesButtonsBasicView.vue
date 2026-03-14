<template>
  <div class="page-container examples-buttons-basic-view">
    <AmuRow :gutter="16">
      <AmuCol :xs="24" :xl="16">
        <AmuCard class="page-card">
          <template #title>基础按钮</template>

          <div class="button-section">
            <div class="button-section__label">按钮类型</div>
            <AmuSpace wrap>
              <AmuButton type="primary">Primary</AmuButton>
              <AmuButton>Default</AmuButton>
              <AmuButton type="dashed">Dashed</AmuButton>
              <AmuButton type="outline">Outline</AmuButton>
              <AmuButton type="text">Text</AmuButton>
            </AmuSpace>
          </div>

          <div class="button-section">
            <div class="button-section__label">状态颜色</div>
            <AmuSpace wrap>
              <AmuButton status="success">Success</AmuButton>
              <AmuButton status="warning">Warning</AmuButton>
              <AmuButton status="danger">Danger</AmuButton>
              <AmuButton type="outline" status="success">Outline Success</AmuButton>
              <AmuButton type="text" status="danger">Text Danger</AmuButton>
            </AmuSpace>
          </div>

          <div class="button-section">
            <div class="button-section__label">尺寸与形状</div>
            <AmuSpace wrap>
              <AmuButton size="mini">Mini</AmuButton>
              <AmuButton size="small">Small</AmuButton>
              <AmuButton size="medium">Medium</AmuButton>
              <AmuButton size="large">Large</AmuButton>
              <AmuButton type="primary" shape="round">Round</AmuButton>
              <AmuButton type="outline" shape="circle">+</AmuButton>
            </AmuSpace>
          </div>

          <div class="button-section">
            <div class="button-section__label">通栏主按钮</div>
            <AmuButton type="primary" fill>保存当前页面配置</AmuButton>
          </div>
        </AmuCard>
      </AmuCol>

      <AmuCol :xs="24" :xl="8">
        <AmuCard class="page-card">
          <template #title>使用建议</template>
          <AmuDescriptions :column="1" border>
            <AmuDescriptionsItem label="主按钮">一个区域通常只保留一个主操作，避免视觉竞争</AmuDescriptionsItem>
            <AmuDescriptionsItem label="文字按钮">更适合放在表格行内操作或轻量交互区</AmuDescriptionsItem>
            <AmuDescriptionsItem label="圆角按钮">适合强调型入口，但不要在同一块区域过度混用</AmuDescriptionsItem>
          </AmuDescriptions>
        </AmuCard>
      </AmuCol>
    </AmuRow>
  </div>
</template>

<script setup lang="ts">
import { AmuButton } from 'amu-ui/button'
import { AmuCard } from 'amu-ui/card'
import { AmuCol } from 'amu-ui/col'
import { AmuDescriptions, AmuDescriptionsItem } from 'amu-ui/descriptions'
import { AmuRow } from 'amu-ui/row'
import { AmuSpace } from 'amu-ui/space'

defineOptions({
  name: 'ExamplesButtonsBasicView'
})
</script>

<style scoped>
.button-section + .button-section {
  margin-top: 24px;
}

.button-section__label {
  margin-bottom: 12px;
  color: var(--amu-color-text-secondary);
  font-size: 14px;
}
</style>