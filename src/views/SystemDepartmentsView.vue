<template>
  <div class="page-container">
    <AmuCard class="page-card page-card--search page-card--plain">
      <AmuForm :model="filters" layout="horizontal" label-align="left" class="search-form">
        <AmuRow :gutter="[16, 16]" class="search-row">
          <AmuCol :xs="24" :md="12" :xl="6">
            <AmuFormItem class="search-item" label="部门名称" prop="name">
              <AmuInput v-model="filters.name" placeholder="请输入部门名称" clearable />
            </AmuFormItem>
          </AmuCol>
          <AmuCol :xs="24" :md="12" :xl="6">
            <AmuFormItem class="search-item" label="部门编码" prop="id">
              <AmuInput v-model="filters.id" placeholder="请输入部门编码" clearable />
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
      <template #title>部门列表</template>
      <template #extra>
        <AmuButton v-permission="'system:department:write'" type="primary" class="page-primary-action" @click="openCreateDialog()">
          <template #icon>
            <AmuIcon><IconPlus /></AmuIcon>
          </template>
          新建部门
        </AmuButton>
      </template>

      <AmuTable :data="pagedTableData" border stripe row-key="id">
        <AmuTableColumn label="部门名称" min-width="280">
          <template #default="{ row }">
            <div class="department-title-cell" :style="{ paddingLeft: `${row.level * 22}px` }">
              <button
                v-if="row.children?.length"
                type="button"
                class="department-title-cell__toggle"
                @click="toggleExpanded(row.id)"
              >
                <AmuIcon class="department-title-cell__icon"><component :is="isExpanded(row.id) ? IconChevronDown : IconChevronRight" /></AmuIcon>
              </button>
              <span v-else class="department-title-cell__spacer"></span>
              <AmuIcon class="department-title-cell__icon department-title-cell__icon--node"><IconGitBranch /></AmuIcon>
              <span class="department-title-cell__text" :class="{ 'is-root': !row.parentId }">{{ row.name }}</span>
            </div>
          </template>
        </AmuTableColumn>
        <AmuTableColumn prop="id" label="部门编码" min-width="180" />
        <AmuTableColumn label="上级部门" min-width="180">
          <template #default="{ row }">
            <span class="department-parent-text">{{ row.parentId ? departmentNameMap.get(row.parentId) || '-' : '顶级部门' }}</span>
          </template>
        </AmuTableColumn>
        <AmuTableColumn label="操作" width="260" align="right">
          <template #default="{ row }">
            <AmuSpace class="table-actions" :size="4">
              <AmuButton v-permission="'system:department:write'" type="text" size="small" @click="openCreateDialog(row)">
                <template #icon>
                  <AmuIcon><IconPlus /></AmuIcon>
                </template>
                新增下级
              </AmuButton>
              <AmuButton v-permission="'system:department:write'" type="text" size="small" @click="openEditDialog(row)">
                <template #icon>
                  <AmuIcon><IconEdit /></AmuIcon>
                </template>
                编辑
              </AmuButton>
              <AmuPopconfirm title="确认删除该部门？" @confirm="handleDeleteDepartment(row)">
                <template #reference>
                  <AmuButton v-permission="'system:department:write'" type="text" size="small" status="danger">
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

    <AmuDrawer v-model="dialogVisible" title="部门配置" placement="right" size="640px" :min-size="520" :max-size="960" resizable body-scrollable>
      <div class="editor-grid">
        <div class="editor-item editor-item--full">
          <label class="editor-label">父级部门</label>
          <AmuSelect v-model="form.parentId" placeholder="顶级部门" filterable>
            <AmuOption label="顶级部门" value="" />
            <AmuOption v-for="item in parentOptions" :key="item.id" :label="item.label" :value="item.id" />
          </AmuSelect>
        </div>
        <div class="editor-item">
          <label class="editor-label">部门编码</label>
          <AmuInput v-model="form.id" :disabled="Boolean(editingId)" placeholder="例如 platform" />
        </div>
        <div class="editor-item">
          <label class="editor-label">部门名称</label>
          <AmuInput v-model="form.name" placeholder="请输入部门名称" />
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
import { IconChevronDown, IconChevronRight, IconEdit, IconGitBranch, IconPlus, IconRotateCcw, IconSave, IconSearch, IconTrash2, IconX } from '@amu-ui/icons'
import { computed, onMounted, reactive, ref } from 'vue'
import { createDepartment, deleteDepartment, fetchDepartmentCatalog, updateDepartment, type AccessDepartmentRow } from '../api/access-control'

defineOptions({
  name: 'SystemDepartments'
})

type DepartmentNode = AccessDepartmentRow & { children?: DepartmentNode[] }
type DepartmentTableRow = DepartmentNode & { level: number }

const rows = ref<AccessDepartmentRow[]>([])
const dialogVisible = ref(false)
const submitting = ref(false)
const editingId = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const expandedDepartmentIds = ref<string[]>([])
const filters = reactive({
  id: '',
  name: ''
})
const form = reactive({
  id: '',
  name: '',
  parentId: ''
})

const buildDepartmentTree = (items: AccessDepartmentRow[]): DepartmentNode[] => {
  const nodes = new Map<string, DepartmentNode>()
  items.forEach((item) => {
    nodes.set(item.id, {
      ...item,
      children: []
    })
  })

  const roots: DepartmentNode[] = []
  nodes.forEach((node) => {
    if (!node.parentId) {
      roots.push(node)
      return
    }

    const parent = nodes.get(node.parentId)
    if (parent) {
      parent.children = parent.children ?? []
      parent.children.push(node)
      return
    }

    roots.push(node)
  })

  const sortNodes = (departmentNodes: DepartmentNode[]) => {
    departmentNodes.sort((left, right) => left.name.localeCompare(right.name, 'zh-CN'))
    departmentNodes.forEach((node) => {
      if (node.children?.length) {
        sortNodes(node.children)
      }
    })
  }

  sortNodes(roots)
  return roots
}

const collectExpandableIds = (items: DepartmentNode[]): string[] => {
  return items.flatMap((item) => [
    ...(item.children?.length ? [item.id, ...collectExpandableIds(item.children)] : [])
  ])
}

const flattenDepartments = (items: DepartmentNode[], level = 0): DepartmentTableRow[] => {
  return items.flatMap((item) => [
    { ...item, level },
    ...(item.children?.length ? flattenDepartments(item.children, level + 1) : [])
  ])
}

const collectDescendantIds = (items: DepartmentNode[], targetId: string): string[] => {
  const result: string[] = []
  const visit = (nodes: DepartmentNode[]) => {
    nodes.forEach((node) => {
      if (node.id === targetId) {
        const collect = (children: DepartmentNode[] = []) => {
          children.forEach((child) => {
            result.push(child.id)
            collect(child.children)
          })
        }
        collect(node.children)
      } else if (node.children?.length) {
        visit(node.children)
      }
    })
  }
  visit(items)
  return result
}

const matchesDepartment = (item: DepartmentNode) => {
  const matchesId = !filters.id.trim() || item.id.includes(filters.id.trim())
  const matchesName = !filters.name.trim() || item.name.includes(filters.name.trim())
  return matchesId && matchesName
}

const filterDepartmentTree = (items: DepartmentNode[]): DepartmentNode[] => {
  return items.reduce<DepartmentNode[]>((result, item) => {
    const children = item.children?.length ? filterDepartmentTree(item.children) : undefined
    if (!matchesDepartment(item) && (!children || children.length === 0)) {
      return result
    }

    result.push({
      ...item,
      children
    })
    return result
  }, [])
}

const flattenVisibleDepartments = (items: DepartmentNode[], level = 0): DepartmentTableRow[] => {
  return items.flatMap((item) => {
    const current: DepartmentTableRow = { ...item, level }
    if (!item.children?.length || !expandedDepartmentIds.value.includes(item.id)) {
      return [current]
    }
    return [current, ...flattenVisibleDepartments(item.children, level + 1)]
  })
}

const treeData = computed(() => buildDepartmentTree(rows.value))
const allTableData = computed(() => flattenDepartments(treeData.value))
const filteredTreeData = computed(() => filterDepartmentTree(treeData.value))
const filteredTableData = computed(() => flattenVisibleDepartments(filteredTreeData.value))
const pagedTableData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredTableData.value.slice(start, start + pageSize.value)
})
const departmentNameMap = computed(() => {
  return new Map(rows.value.map((item) => [item.id, item.name]))
})
const parentOptions = computed(() => {
  const excludedIds = editingId.value ? [editingId.value, ...collectDescendantIds(treeData.value, editingId.value)] : []
  return allTableData.value
    .filter((item) => !excludedIds.includes(item.id))
    .map((item) => ({ id: item.id, label: `${'-- '.repeat(item.level)}${item.name}` }))
})

const showPaginationTotal = (total: number, range: [number, number]) => {
  return `第 ${range[0]}-${range[1]} 条 / 共 ${total} 条`
}

const isExpanded = (id: string) => expandedDepartmentIds.value.includes(id)

const toggleExpanded = (id: string) => {
  expandedDepartmentIds.value = expandedDepartmentIds.value.includes(id)
    ? expandedDepartmentIds.value.filter((item) => item !== id)
    : [...expandedDepartmentIds.value, id]
}

const resetForm = () => {
  editingId.value = ''
  form.id = ''
  form.name = ''
  form.parentId = ''
}

const loadDepartments = async () => {
  try {
    rows.value = await fetchDepartmentCatalog()
    expandedDepartmentIds.value = collectExpandableIds(treeData.value)
    currentPage.value = 1
  } catch (error) {
    const message = error instanceof Error ? error.message : '加载部门失败'
    AmuMessage.error({ message })
  }
}

const openCreateDialog = (parent?: AccessDepartmentRow) => {
  resetForm()
  if (parent) {
    form.parentId = parent.id
  }
  dialogVisible.value = true
}

const openEditDialog = (row: AccessDepartmentRow) => {
  editingId.value = row.id
  form.id = row.id
  form.name = row.name
  form.parentId = row.parentId || ''
  dialogVisible.value = true
}

const applyFilters = () => {
  currentPage.value = 1
}

const resetFilters = () => {
  filters.id = ''
  filters.name = ''
  currentPage.value = 1
}

const handlePageSizeChange = (value: number) => {
  pageSize.value = value
  currentPage.value = 1
}

const submitForm = async () => {
  if (!form.id.trim() || !form.name.trim()) {
    AmuMessage.warning({ message: '请填写完整的部门信息' })
    return
  }

  submitting.value = true
  try {
    const payload = {
      id: form.id.trim(),
      name: form.name.trim(),
      parentId: form.parentId || undefined
    }

    if (editingId.value) {
      await updateDepartment(editingId.value, payload)
      AmuMessage.success({ message: '部门已更新' })
    } else {
      await createDepartment(payload)
      AmuMessage.success({ message: '部门已创建' })
    }

    dialogVisible.value = false
    await loadDepartments()
  } catch (error) {
    const message = error instanceof Error ? error.message : '保存部门失败'
    AmuMessage.error({ message })
  } finally {
    submitting.value = false
  }
}

const handleDeleteDepartment = async (row: AccessDepartmentRow) => {
  try {
    await deleteDepartment(row.id)
    AmuMessage.success({ message: '部门已删除' })
    await loadDepartments()
  } catch (error) {
    const message = error instanceof Error ? error.message : '删除部门失败'
    AmuMessage.error({ message })
  }
}

onMounted(() => {
  void loadDepartments()
})
</script>

<style scoped>
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

.department-title-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.department-title-cell__toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  padding: 0;
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  border-radius: 6px;
}

.department-title-cell__toggle:hover {
  background: var(--amu-color-bg-fill);
}

.department-title-cell__spacer {
  width: 18px;
  height: 18px;
  flex: 0 0 auto;
}

.department-title-cell__icon {
  color: var(--amu-color-text-secondary);
  flex: 0 0 auto;
}

.department-title-cell__icon--node {
  color: var(--amu-color-primary);
}

.department-title-cell__text {
  min-width: 0;
}

.department-title-cell__text.is-root {
  font-weight: 600;
}

.department-parent-text {
  color: var(--amu-color-text-secondary);
}

.editor-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
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

.page-card--plain :deep(.amu-card__header) {
  display: none;
}

@media (max-width: 768px) {
  .editor-grid {
    grid-template-columns: 1fr;
  }

  .table-footer {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>