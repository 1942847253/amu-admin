<template>
  <div class="page-container">
    <AmuCard class="page-card page-card--search page-card--plain">
      <AmuForm :model="filters" layout="horizontal" label-align="left" class="search-form">
        <AmuRow :gutter="[16, 16]" class="search-row">
          <AmuCol :xs="24" :md="12" :xl="8">
            <AmuFormItem class="search-item" label="权限编码" prop="code">
              <AmuInput v-model="filters.code" placeholder="请输入权限编码" clearable />
            </AmuFormItem>
          </AmuCol>
          <AmuCol :xs="24" :md="12" :xl="8">
            <AmuFormItem class="search-item" label="权限名称" prop="name">
              <AmuInput v-model="filters.name" placeholder="请输入权限名称" clearable />
            </AmuFormItem>
          </AmuCol>
          <AmuCol :xs="24" :md="12" :xl="8">
            <AmuFormItem class="search-item" label="归属模块" prop="module">
              <AmuInput v-model="filters.module" placeholder="请输入归属模块" clearable />
            </AmuFormItem>
          </AmuCol>
        </AmuRow>
      </AmuForm>
      <div class="search-helper-text">
        可按权限编码、权限名称和归属模块组合筛选；访问权限通常同时服务于页面、按钮和接口的访问控制。
      </div>
      <div class="search-actions">
        <AmuSpace class="action-group">
          <AmuButton @click="resetFilters">
            <template #icon>
              <AmuIcon><IconRotateCcw /></AmuIcon>
            </template>
            重置
          </AmuButton>
          <AmuButton type="primary" @click="applyFilters">
            <template #icon>
              <AmuIcon><IconSearch /></AmuIcon>
            </template>
            搜索
          </AmuButton>
        </AmuSpace>
      </div>
    </AmuCard>

    <AmuCard class="page-card page-card--table">
      <template #title>访问权限列表</template>
      <template #extra>
        <AmuButton v-permission="'system:permission:write'" type="primary" class="page-primary-action" @click="openCreateDialog">
          <template #icon>
            <AmuIcon><IconPlus /></AmuIcon>
          </template>
          新建访问权限
        </AmuButton>
      </template>

      <AmuTable :data="pagedTableData" border stripe>
        <template #empty>
          <div class="table-empty-state">
            <AmuEmpty :description="permissionEmptyDescription">
              <AmuButton v-if="hasActiveFilters" @click="resetFilters">
                <template #icon>
                  <AmuIcon><IconRotateCcw /></AmuIcon>
                </template>
                清空筛选条件
              </AmuButton>
              <AmuButton v-else v-permission="'system:permission:write'" type="primary" @click="openCreateDialog">
                <template #icon>
                  <AmuIcon><IconPlus /></AmuIcon>
                </template>
                新建第一条访问权限
              </AmuButton>
            </AmuEmpty>
          </div>
        </template>
        <AmuTableColumn prop="code" label="权限编码" min-width="220">
          <template #default="{ row }">
            <AmuTag type="primary">{{ row.code }}</AmuTag>
          </template>
        </AmuTableColumn>
        <AmuTableColumn prop="name" label="权限名称" min-width="180" />
        <AmuTableColumn prop="module" label="归属模块" min-width="140" />
        <AmuTableColumn prop="apiScopes" label="接口范围" min-width="320">
          <template #default="{ row }">
            <AmuSpace wrap>
              <AmuTag v-for="scope in row.apiScopes.slice(0, 2)" :key="scope">{{ scope }}</AmuTag>
              <AmuTag v-if="row.apiScopes.length > 2" type="warning">+{{ row.apiScopes.length - 2 }}</AmuTag>
            </AmuSpace>
          </template>
        </AmuTableColumn>
        <AmuTableColumn label="操作" width="200" align="right">
          <template #default="{ row }">
            <AmuSpace class="table-actions" :size="4">
              <AmuButton type="text" size="small" @click="openEditDialog(row)">
                <template #icon>
                  <AmuIcon><IconEdit /></AmuIcon>
                </template>
                编辑
              </AmuButton>
              <AmuPopconfirm title="确认删除该访问权限？" @confirm="handleDeletePermission(row)">
                <template #reference>
                  <AmuButton v-permission="'system:permission:write'" type="text" size="small" status="danger">
                    <template #icon>
                      <AmuIcon><IconTrash2 /></AmuIcon>
                    </template>
                    删除
                  </AmuButton>
                </template>
              </AmuPopconfirm>
            </AmuSpace>
          </template>
        </AmuTableColumn>
      </AmuTable>
      <div class="table-footer">
        <div class="table-footer__summary">共 {{ filteredTableData.length }} 条记录</div>
        <AmuPagination
          v-model="currentPage"
          :page-size="pageSize"
          :total="filteredTableData.length"
          :show-size-changer="true"
          :page-size-options="[10, 20, 50, 100]"
          :show-total="showPaginationTotal"
          @update:page-size="handlePageSizeChange"
        />
      </div>
    </AmuCard>

    <AmuDrawer
      v-model="dialogVisible"
      title="访问权限配置"
      placement="right"
      size="640px"
      :min-size="480"
      :max-size="920"
      resizable
      body-scrollable
    >
      <div class="editor-banner">
        <div class="editor-banner__title">填写建议</div>
        <div class="editor-banner__text">权限编码建议保持稳定，接口范围建议一行一条，便于角色分配、按钮控制和后端权限守卫统一复用。</div>
      </div>
      <div class="editor-grid">
        <div class="editor-item">
          <label class="editor-label">权限编码</label>
          <AmuInput v-model="form.code" placeholder="例如 system:user:read" />
          <div class="editor-help-text">推荐使用 模块:资源:动作 的命名方式，例如 system:menu:read。</div>
        </div>
        <div class="editor-item">
          <label class="editor-label">权限名称</label>
          <AmuInput v-model="form.name" placeholder="请输入权限名称" />
          <div class="editor-help-text">用于角色授权、菜单配置和日志展示，建议直接写成可读业务名称。</div>
        </div>
        <div class="editor-item editor-item--full">
          <label class="editor-label">归属模块</label>
          <AmuInput v-model="form.module" placeholder="例如 iam" />
          <div class="editor-help-text">建议按业务域归类，例如 iam、dashboard、security，方便在树形权限面板里集中查看。</div>
        </div>
        <div class="editor-item editor-item--full">
          <label class="editor-label">接口范围</label>
          <AmuTextarea v-model="apiScopesText" :rows="6" placeholder="每行一个接口范围，例如 GET:/api/access-control/users" />
          <div class="editor-help-text">支持换行或英文逗号分隔，当前可解析 {{ parsedApiScopes.length }} 项接口范围。</div>
        </div>
      </div>

      <template #footer>
        <AmuSpace class="drawer-actions">
          <AmuButton @click="dialogVisible = false">
            <template #icon>
              <AmuIcon><IconX /></AmuIcon>
            </template>
            取消
          </AmuButton>
          <AmuButton type="primary" :loading="submitting" @click="submitForm">
            <template #icon>
              <AmuIcon><IconSave /></AmuIcon>
            </template>
            保存
          </AmuButton>
        </AmuSpace>
      </template>
    </AmuDrawer>
  </div>
</template>

<script setup lang="ts">
import { AmuButton } from 'amu-ui/button'
import { AmuCard } from 'amu-ui/card'
import { AmuDrawer } from 'amu-ui/drawer'
import { AmuEmpty } from 'amu-ui/empty'
import { AmuForm, AmuFormItem } from 'amu-ui/form'
import { AmuIcon } from 'amu-ui/icon'
import { AmuInput } from 'amu-ui/input'
import { AmuMessage } from 'amu-ui/message'
import { AmuPagination } from 'amu-ui/pagination'
import { AmuPopconfirm } from 'amu-ui/popconfirm'
import { AmuRow } from 'amu-ui/row'
import { AmuCol } from 'amu-ui/col'
import { AmuSpace } from 'amu-ui/space'
import { AmuTable, AmuTableColumn } from 'amu-ui/table'
import { AmuTag } from 'amu-ui/tag'
import { AmuTextarea } from 'amu-ui/textarea'
import { IconEdit, IconPlus, IconRotateCcw, IconSave, IconSearch, IconTrash2, IconX } from '@amu-ui/icons'
import { computed, onMounted, reactive, ref } from 'vue'
import { createPermission, deletePermission, fetchPermissions, updatePermission, type AccessPermissionRow } from '../api/access-control'

defineOptions({
  name: 'SystemPermissions'
})

const rows = ref<AccessPermissionRow[]>([])
const dialogVisible = ref(false)
const submitting = ref(false)
const editingCode = ref('')
const apiScopesText = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const filters = reactive({
  code: '',
  name: '',
  module: ''
})
const form = reactive({
  code: '',
  name: '',
  module: ''
})
const hasActiveFilters = computed(() => Object.values(filters).some((value) => String(value).trim() !== ''))
const permissionEmptyDescription = computed(() => {
  if (hasActiveFilters.value) {
    return '没有找到符合筛选条件的访问权限，可以清空条件后重新查看。'
  }
  return '当前还没有访问权限数据，创建后即可用于角色授权、菜单可见性和接口守卫配置。'
})
const parsedApiScopes = computed(() => {
  return apiScopesText.value.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean)
})

const loadPermissions = async () => {
  try {
    rows.value = await fetchPermissions()
    currentPage.value = 1
  } catch (error) {
    const message = error instanceof Error ? error.message : '加载访问权限失败'
    AmuMessage.error({ message })
  }
}

const filteredTableData = computed(() => {
  return rows.value.filter((item) => {
    const matchesCode = !filters.code.trim() || item.code.includes(filters.code.trim())
    const matchesName = !filters.name.trim() || item.name.includes(filters.name.trim())
    const matchesModule = !filters.module.trim() || item.module.includes(filters.module.trim())
    return matchesCode && matchesName && matchesModule
  })
})

const pagedTableData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredTableData.value.slice(start, start + pageSize.value)
})

const showPaginationTotal = (total: number, range: [number, number]) => {
  return `第 ${range[0]}-${range[1]} 条 / 共 ${total} 条`
}

const applyFilters = () => {
  currentPage.value = 1
}

const resetFilters = () => {
  filters.code = ''
  filters.name = ''
  filters.module = ''
  currentPage.value = 1
}

const handlePageSizeChange = (value: number) => {
  pageSize.value = value
  currentPage.value = 1
}

const openCreateDialog = () => {
  editingCode.value = ''
  form.code = ''
  form.name = ''
  form.module = ''
  apiScopesText.value = ''
  dialogVisible.value = true
}

const openEditDialog = (row: AccessPermissionRow) => {
  editingCode.value = row.code
  form.code = row.code
  form.name = row.name
  form.module = row.module
  apiScopesText.value = row.apiScopes.join('\n')
  dialogVisible.value = true
}

const submitForm = async () => {
  if (!form.code || !form.name || !form.module) {
    AmuMessage.warning({ message: '请填写完整的访问权限信息' })
    return
  }

  const apiScopes = parsedApiScopes.value
  submitting.value = true
  try {
    const payload = {
      code: form.code,
      name: form.name,
      module: form.module,
      apiScopes
    }
    if (editingCode.value) {
      await updatePermission(editingCode.value, payload)
      AmuMessage.success({ message: '访问权限已更新' })
    } else {
      await createPermission(payload)
      AmuMessage.success({ message: '访问权限已创建' })
    }
    dialogVisible.value = false
    await loadPermissions()
  } catch (error) {
    const message = error instanceof Error ? error.message : '保存访问权限失败'
    AmuMessage.error({ message })
  } finally {
    submitting.value = false
  }
}

const handleDeletePermission = async (row: AccessPermissionRow) => {
  try {
    await deletePermission(row.code)
    AmuMessage.success({ message: '访问权限已删除' })
    await loadPermissions()
  } catch (error) {
    const message = error instanceof Error ? error.message : '删除访问权限失败'
    AmuMessage.error({ message })
  }
}

onMounted(() => {
  void loadPermissions()
})
</script>

<style scoped>
.editor-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.page-card--search {
  flex: 0 0 auto;
}

.page-card--table {
  flex: 1;
  min-height: 0;
}

.search-form :deep(.amu-form-item) {
  margin-bottom: 0;
}

.search-item {
  min-width: 0;
}

.search-form :deep(.amu-form-item__label) {
  width: 72px;
}

.search-row {
  width: 100%;
}

.search-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
}

.search-helper-text {
  font-size: 13px;
  line-height: 1.6;
  color: var(--amu-color-text-secondary);
  margin-top: 14px;
}

.action-group :deep(.amu-button) {
  min-width: 88px;
}

.page-primary-action {
  min-width: 112px;
}

.drawer-actions :deep(.amu-button) {
  min-width: 88px;
}

.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 16px;
}

.table-footer__summary {
  font-size: 13px;
  color: var(--amu-color-text-secondary);
}

.table-actions {
  justify-content: flex-end;
  width: 100%;
}

.table-actions :deep(.amu-button--text) {
  --amu-button-font-size: 13px;
  min-width: auto;
  padding-inline: 6px;
}

.table-actions :deep(.amu-button__icon) {
  font-size: 14px;
}

.table-empty-state {
  padding: 16px 0;
}

.editor-banner {
  margin-bottom: 16px;
  padding: 14px 16px;
  border: 1px solid var(--amu-color-border-default);
  border-radius: 14px;
  background: var(--amu-color-bg-fill);
}

.editor-banner__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--amu-color-text-default);
  margin-bottom: 4px;
}

.editor-banner__text {
  font-size: 13px;
  line-height: 1.6;
  color: var(--amu-color-text-secondary);
}

.editor-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.editor-item--full {
  grid-column: 1 / -1;
}

.editor-label {
  font-size: 13px;
  color: var(--amu-color-text-secondary);
}

.editor-help-text {
  font-size: 12px;
  line-height: 1.6;
  color: var(--amu-color-text-secondary);
}

.page-card--plain :deep(.amu-card__header) {
  display: none;
}

@media (max-width: 768px) {
  .table-footer {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>