<template>
  <div class="page-container">
    <AmuCard class="page-card page-card--search page-card--plain">
      <AmuForm :model="filters" layout="horizontal" label-align="left" class="search-form">
        <AmuRow :gutter="[16, 16]" class="search-row">
          <AmuCol :xs="24" :md="12" :xl="6">
            <AmuFormItem class="search-item" label="角色名称" prop="name">
              <AmuInput v-model="filters.name" placeholder="请输入角色名称" clearable />
            </AmuFormItem>
          </AmuCol>
          <AmuCol :xs="24" :md="12" :xl="6">
            <AmuFormItem class="search-item" label="角色编码" prop="code">
              <AmuInput v-model="filters.code" placeholder="请输入角色编码" clearable />
            </AmuFormItem>
          </AmuCol>
          <AmuCol :xs="24" :md="12" :xl="6">
            <AmuFormItem class="search-item" label="数据范围" prop="dataScope">
              <AmuSelect v-model="filters.dataScope" placeholder="请选择数据范围" clearable>
                <AmuOption label="全部数据" value="ALL" />
                <AmuOption label="本部门" value="DEPARTMENT" />
                <AmuOption label="本部门及子部门" value="DEPARTMENT_AND_CHILDREN" />
                <AmuOption label="仅本人" value="SELF" />
                <AmuOption label="自定义" value="CUSTOM" />
              </AmuSelect>
            </AmuFormItem>
          </AmuCol>
          <AmuCol :xs="24" :md="12" :xl="6">
            <AmuFormItem class="search-item" label="角色说明" prop="description">
              <AmuInput v-model="filters.description" placeholder="请输入角色说明" clearable />
            </AmuFormItem>
          </AmuCol>
        </AmuRow>
      </AmuForm>
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
      <template #title>角色列表</template>
      <template #extra>
        <AmuButton v-permission="'system:role:write'" type="primary" class="page-primary-action" @click="openCreateDialog">
          <template #icon>
            <AmuIcon><IconShield /></AmuIcon>
          </template>
          新建角色
        </AmuButton>
      </template>

      <AmuTable :data="pagedTableData" border>
        <AmuTableColumn prop="name" label="角色名称" />
        <AmuTableColumn prop="code" label="角色编码">
          <template #default="{ row }">
            <AmuTag type="primary">{{ row.code }}</AmuTag>
          </template>
        </AmuTableColumn>
        <AmuTableColumn prop="dataScope" label="数据权限范围" />
        <AmuTableColumn prop="description" label="角色说明" min-width="220" />
        <AmuTableColumn prop="permissionCodes" label="访问权限">
          <template #default="{ row }">
            <AmuSpace wrap>
              <AmuTag v-for="permission in row.permissionCodes.slice(0, 3)" :key="permission">{{ permission }}</AmuTag>
              <AmuTag v-if="row.permissionCodes.length > 3" type="warning">+{{ row.permissionCodes.length - 3 }}</AmuTag>
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
              <AmuPopconfirm title="确认删除该角色？" @confirm="handleDeleteRole(row)">
                <template #reference>
                  <AmuButton v-permission="'system:role:write'" type="text" size="small" status="danger">
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
      title="角色配置"
      placement="right"
      size="680px"
      :min-size="520"
      :max-size="960"
      resizable
      body-scrollable
    >
      <div class="editor-grid">
        <div class="editor-item">
          <label class="editor-label">角色编码</label>
          <AmuInput v-model="form.code" placeholder="请输入角色编码" />
        </div>
        <div class="editor-item">
          <label class="editor-label">角色名称</label>
          <AmuInput v-model="form.name" placeholder="请输入角色名称" />
        </div>
        <div class="editor-item editor-item--full">
          <label class="editor-label">角色说明</label>
          <AmuInput v-model="form.description" placeholder="请输入角色说明" />
        </div>
        <div class="editor-item">
          <label class="editor-label">数据范围</label>
          <AmuSelect v-model="form.dataScope" placeholder="请选择数据范围">
            <AmuOption label="全部数据" value="ALL" />
            <AmuOption label="本部门" value="DEPARTMENT" />
            <AmuOption label="本部门及子部门" value="DEPARTMENT_AND_CHILDREN" />
            <AmuOption label="仅本人" value="SELF" />
            <AmuOption label="自定义" value="CUSTOM" />
          </AmuSelect>
        </div>
        <div class="editor-item editor-item--full">
          <label class="editor-label">访问权限</label>
          <div class="permission-tree-panel">
            <AmuTree
              :key="permissionTreeSeed"
              :data="permissionTreeData"
              :default-expanded-keys="permissionExpandedKeys"
              :default-checked-keys="form.permissionCodes"
              checkable
              show-line
              :check-on-click-node="true"
              @update:checked-keys="handlePermissionTreeChange"
            />
          </div>
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
import { AmuForm, AmuFormItem } from 'amu-ui/form'
import { AmuIcon } from 'amu-ui/icon'
import { AmuInput } from 'amu-ui/input'
import { AmuMessage } from 'amu-ui/message'
import { AmuPagination } from 'amu-ui/pagination'
import { AmuPopconfirm } from 'amu-ui/popconfirm'
import { AmuRow } from 'amu-ui/row'
import { AmuCol } from 'amu-ui/col'
import { AmuOption, AmuSelect } from 'amu-ui/select'
import { AmuSpace } from 'amu-ui/space'
import { AmuTable, AmuTableColumn } from 'amu-ui/table'
import { AmuTag } from 'amu-ui/tag'
import { AmuTree, type TreeKey } from 'amu-ui/tree'
import { IconEdit, IconRotateCcw, IconSave, IconSearch, IconShield, IconTrash2, IconX } from '@amu-ui/icons'
import { computed, onMounted, reactive, ref } from 'vue'
import { createRole, deleteRole, fetchPermissions, fetchRoles, updateRole, type AccessPermissionRow, type AccessRoleRow } from '../api/access-control'
import { buildPermissionTree, collectExpandedKeys, pickPermissionCodes } from '../utils/permission-tree'

defineOptions({
  name: 'SystemRoles'
})

const rawData = ref<AccessRoleRow[]>([])
const permissions = ref<AccessPermissionRow[]>([])
const dialogVisible = ref(false)
const submitting = ref(false)
const editingId = ref('')
const permissionTreeSeed = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const filters = reactive({
  name: '',
  code: '',
  description: '',
  dataScope: '' as '' | 'ALL' | 'DEPARTMENT' | 'DEPARTMENT_AND_CHILDREN' | 'SELF' | 'CUSTOM'
})
const form = reactive({
  code: '',
  name: '',
  description: '',
  dataScope: 'SELF',
  permissionCodes: [] as string[]
})

const permissionTreeData = computed(() => buildPermissionTree(permissions.value))
const permissionExpandedKeys = computed(() => collectExpandedKeys(permissionTreeData.value))

const refreshPermissionTree = () => {
  permissionTreeSeed.value += 1
}

const handlePermissionTreeChange = (keys: TreeKey[]) => {
  form.permissionCodes = pickPermissionCodes(keys, permissions.value)
}

const resetForm = () => {
  editingId.value = ''
  form.code = ''
  form.name = ''
  form.description = ''
  form.dataScope = 'SELF'
  form.permissionCodes = []
  refreshPermissionTree()
}

const loadRoles = async () => {
  try {
    rawData.value = await fetchRoles()
    currentPage.value = 1
  } catch (error) {
    const message = error instanceof Error ? error.message : '加载角色失败'
    AmuMessage.error({ message })
  }
}

const filteredTableData = computed(() => {
  return rawData.value.filter((item) => {
    const matchesName = !filters.name.trim() || item.name.includes(filters.name.trim())
    const matchesCode = !filters.code.trim() || item.code.includes(filters.code.trim())
    const matchesDescription = !filters.description.trim() || item.description.includes(filters.description.trim())
    const matchesDataScope = !filters.dataScope || item.dataScope === filters.dataScope

    return matchesName && matchesCode && matchesDescription && matchesDataScope
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
  filters.name = ''
  filters.code = ''
  filters.description = ''
  filters.dataScope = ''
  currentPage.value = 1
}

const handlePageSizeChange = (value: number) => {
  pageSize.value = value
  currentPage.value = 1
}

const loadPermissions = async () => {
  try {
    permissions.value = await fetchPermissions()
  } catch (error) {
    const message = error instanceof Error ? error.message : '加载访问权限失败'
    AmuMessage.error({ message })
  }
}

const openCreateDialog = () => {
  resetForm()
  dialogVisible.value = true
}

const openEditDialog = (row: AccessRoleRow) => {
  editingId.value = row.id
  form.code = row.code
  form.name = row.name
  form.description = row.description
  form.dataScope = row.dataScope
  form.permissionCodes = [...row.permissionCodes]
  refreshPermissionTree()
  dialogVisible.value = true
}

const submitForm = async () => {
  if (!form.code || !form.name || !form.description) {
    AmuMessage.warning({ message: '请填写完整的角色信息' })
    return
  }

  submitting.value = true
  try {
    const payload = {
      code: form.code,
      name: form.name,
      description: form.description,
      dataScope: form.dataScope,
      permissionCodes: [...form.permissionCodes]
    }
    if (editingId.value) {
      await updateRole(editingId.value, payload)
      AmuMessage.success({ message: '角色已更新' })
    } else {
      await createRole(payload)
      AmuMessage.success({ message: '角色已创建' })
    }
    dialogVisible.value = false
    await loadRoles()
  } catch (error) {
    const message = error instanceof Error ? error.message : '保存角色失败'
    AmuMessage.error({ message })
  } finally {
    submitting.value = false
  }
}

const handleDeleteRole = async (row: AccessRoleRow) => {
  try {
    await deleteRole(row.id)
    AmuMessage.success({ message: '角色已删除' })
    await loadRoles()
  } catch (error) {
    const message = error instanceof Error ? error.message : '删除角色失败'
    AmuMessage.error({ message })
  }
}

onMounted(() => {
  void loadRoles()
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

.permission-tree-panel {
  min-height: 240px;
  padding: 12px 14px;
  border: 1px solid var(--amu-color-border-default);
  border-radius: 12px;
  background: var(--amu-color-bg-container);
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
