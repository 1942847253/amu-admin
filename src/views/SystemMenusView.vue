<template>
  <div class="page-container">
    <AmuCard class="page-card page-card--search page-card--plain">
      <AmuForm :model="filters" layout="horizontal" label-align="left" class="search-form">
        <AmuRow :gutter="[16, 16]" class="search-row">
          <AmuCol :xs="24" :md="12" :xl="6">
            <AmuFormItem class="search-item" label="菜单名称" prop="title">
              <AmuInput v-model="filters.title" placeholder="请输入菜单名称" clearable />
            </AmuFormItem>
          </AmuCol>
          <AmuCol :xs="24" :md="12" :xl="6">
            <AmuFormItem class="search-item" label="路由地址" prop="key">
              <AmuInput v-model="filters.key" placeholder="请输入路由地址" clearable />
            </AmuFormItem>
          </AmuCol>
          <AmuCol :xs="24" :md="12" :xl="6">
            <AmuFormItem class="search-item" label="图标名称" prop="icon">
              <AmuInput v-model="filters.icon" placeholder="请输入图标名称" clearable />
            </AmuFormItem>
          </AmuCol>
          <AmuCol :xs="24" :md="12" :xl="6">
            <AmuFormItem class="search-item" label="权限编码" prop="permissionCode">
              <AmuInput v-model="filters.permissionCode" placeholder="请输入权限编码" clearable />
            </AmuFormItem>
          </AmuCol>
          <AmuCol :xs="24" :md="12" :xl="6">
            <AmuFormItem class="search-item" label="菜单类型" prop="menuType">
              <AmuSelect v-model="filters.menuType" placeholder="请选择菜单类型" clearable>
                <AmuOption label="目录" value="DIRECTORY" />
                <AmuOption label="菜单" value="MENU" />
              </AmuSelect>
            </AmuFormItem>
          </AmuCol>
          <AmuCol :xs="24" :md="12" :xl="6">
            <AmuFormItem class="search-item" label="状态" prop="status">
              <AmuSelect v-model="filters.status" placeholder="请选择状态" clearable>
                <AmuOption label="启用" value="ACTIVE" />
                <AmuOption label="停用" value="DISABLED" />
              </AmuSelect>
            </AmuFormItem>
          </AmuCol>
        </AmuRow>
      </AmuForm>
      <div class="search-helper-text">
        支持按菜单名称、路由地址、图标名、访问权限编码筛选；命中子菜单时会保留上级节点，便于查看层级关系。
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
      <template #title>菜单列表</template>
      <template #extra>
        <AmuButton v-permission="'system:menu:write'" type="primary" class="page-primary-action" @click="openCreateDialog()">
          <template #icon>
            <AmuIcon><IconPlus /></AmuIcon>
          </template>
          新建菜单
        </AmuButton>
      </template>

      <AmuTable :data="pagedTableData" border stripe row-key="id">
        <template #empty>
          <div class="table-empty-state">
            <AmuEmpty :description="menuEmptyDescription">
              <AmuButton v-if="hasActiveFilters" @click="resetFilters">
                <template #icon>
                  <AmuIcon><IconRotateCcw /></AmuIcon>
                </template>
                清空筛选条件
              </AmuButton>
              <AmuButton v-else v-permission="'system:menu:write'" type="primary" @click="openCreateDialog()">
                <template #icon>
                  <AmuIcon><IconPlus /></AmuIcon>
                </template>
                新建第一条菜单
              </AmuButton>
            </AmuEmpty>
          </div>
        </template>
        <AmuTableColumn label="菜单名称" min-width="260">
          <template #default="{ row }">
            <div class="menu-title-cell" :style="{ paddingLeft: `${row.level * 22}px` }">
              <button
                v-if="row.children?.length"
                type="button"
                class="menu-title-cell__toggle"
                @click="toggleExpanded(row.id)"
              >
                <AmuIcon class="menu-title-cell__icon"><component :is="isExpanded(row.id) ? IconChevronDown : IconChevronRight" /></AmuIcon>
              </button>
              <span v-else class="menu-title-cell__spacer"></span>
              <AmuIcon class="menu-title-cell__icon menu-title-cell__icon--node">
                <component :is="resolveCatalogIcon(row.icon) || (row.menuType === 'DIRECTORY' ? IconMenu : IconFileText)" />
              </AmuIcon>
              <span class="menu-title-cell__text" :class="{ 'is-directory': row.menuType === 'DIRECTORY' }">{{ row.title }}</span>
            </div>
          </template>
        </AmuTableColumn>
        <AmuTableColumn prop="key" label="路由地址" min-width="220" />
        <AmuTableColumn label="类型" width="100" align="center">
          <template #default="{ row }">
            <AmuTag :type="row.menuType === 'DIRECTORY' ? 'warning' : 'primary'">{{ row.menuType === 'DIRECTORY' ? '目录' : '菜单' }}</AmuTag>
          </template>
        </AmuTableColumn>
        <AmuTableColumn prop="componentPath" label="页面组件" min-width="220">
          <template #default="{ row }">
            <span class="menu-component-text">{{ row.componentPath || '-' }}</span>
          </template>
        </AmuTableColumn>
        <AmuTableColumn prop="icon" label="图标" min-width="140">
          <template #default="{ row }">
            <div class="menu-icon-cell">
              <span v-if="resolveCatalogIcon(row.icon)" class="menu-icon-cell__preview">
                <AmuIcon><component :is="resolveCatalogIcon(row.icon)" /></AmuIcon>
              </span>
              <AmuTag>{{ row.icon }}</AmuTag>
            </div>
          </template>
        </AmuTableColumn>
        <AmuTableColumn prop="sortOrder" label="排序" width="100" align="center" />
        <AmuTableColumn label="状态" width="100" align="center">
          <template #default="{ row }">
            <AmuTag :type="row.status === 'ACTIVE' ? 'success' : 'danger'">{{ row.status === 'ACTIVE' ? '启用' : '停用' }}</AmuTag>
          </template>
        </AmuTableColumn>
        <AmuTableColumn label="访问权限" min-width="260">
          <template #default="{ row }">
            <AmuSpace wrap>
              <AmuTag v-for="code in row.permissionCodes.slice(0, 2)" :key="code" type="primary">{{ resolvePermissionLabel(code) }}</AmuTag>
              <AmuTag v-if="row.permissionCodes.length > 2" type="warning">+{{ row.permissionCodes.length - 2 }}</AmuTag>
              <span v-if="row.permissionCodes.length === 0" class="menu-empty-text">未绑定</span>
            </AmuSpace>
          </template>
        </AmuTableColumn>
        <AmuTableColumn label="操作" width="300" align="right">
          <template #default="{ row }">
            <AmuSpace class="table-actions" :size="4">
              <AmuButton v-permission="'system:menu:write'" type="text" size="small" @click="openCreateDialog(row)">
                <template #icon>
                  <AmuIcon><IconPlus /></AmuIcon>
                </template>
                新增下级
              </AmuButton>
              <AmuButton v-permission="'system:menu:write'" type="text" size="small" @click="openEditDialog(row)">
                <template #icon>
                  <AmuIcon><IconEdit /></AmuIcon>
                </template>
                编辑
              </AmuButton>
              <AmuPopconfirm title="确认删除该菜单？" @confirm="handleDeleteMenu(row)">
                <template #reference>
                  <AmuButton v-permission="'system:menu:write'" type="text" size="small" status="danger">
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

    <AmuDrawer v-model="dialogVisible" title="菜单配置" placement="right" size="720px" :min-size="560" :max-size="1024" resizable body-scrollable>
      <div class="editor-banner">
        <div class="editor-banner__title">配置说明</div>
        <div class="editor-banner__text">目录用于承载分组导航，菜单用于承载具体页面。停用后该节点不会出现在运行时导航中。</div>
      </div>
      <div class="editor-grid">
        <div class="editor-item editor-item--full">
          <label class="editor-label">父级菜单</label>
          <AmuSelect v-model="form.parentId" placeholder="顶级菜单">
            <AmuOption label="顶级菜单" value="" />
            <AmuOption v-for="item in parentOptions" :key="item.id" :label="item.label" :value="item.id" />
          </AmuSelect>
          <div class="editor-help-text">未选择时会作为顶级导航展示；选择父级后会自动挂到对应目录下面。</div>
        </div>
        <div class="editor-item">
          <label class="editor-label">菜单名称</label>
          <AmuInput v-model="form.title" placeholder="请输入菜单名称" />
          <div class="editor-help-text">用于侧边栏、顶部导航和搜索面板展示，建议与页面标题保持一致。</div>
        </div>
        <div class="editor-item">
          <label class="editor-label">路由地址</label>
          <AmuInput v-model="form.key" placeholder="例如 /system/menus" />
          <div class="editor-help-text">建议使用完整页面路由。目录一般使用分组路径，菜单使用实际访问路径。</div>
        </div>
        <div class="editor-item">
          <label class="editor-label">图标名称</label>
          <AmuSelect v-model="form.icon" placeholder="请选择图标" filterable>
            <AmuOption v-for="icon in iconOptions" :key="icon" :label="icon" :value="icon">
              <div class="menu-icon-option">
                <span v-if="resolveCatalogIcon(icon)" class="menu-icon-option__preview">
                  <AmuIcon><component :is="resolveCatalogIcon(icon)" /></AmuIcon>
                </span>
                <span>{{ icon }}</span>
              </div>
            </AmuOption>
          </AmuSelect>
          <div class="editor-help-text">支持搜索全部图标导出名，选择后会实时用于导航和搜索结果预览。</div>
        </div>
        <div class="editor-item">
          <label class="editor-label">菜单类型</label>
          <AmuSelect v-model="form.menuType" placeholder="请选择菜单类型">
            <AmuOption label="目录" value="DIRECTORY" />
            <AmuOption label="菜单" value="MENU" />
          </AmuSelect>
          <div class="editor-help-text">当前为{{ menuTypeHintLabel }}，{{ menuTypeHintText }}</div>
        </div>
        <div class="editor-item editor-item--full">
          <label class="editor-label">页面组件</label>
          <AmuInput v-model="form.componentPath" :disabled="isDirectoryMenu" placeholder="例如 views/SystemMenusView.vue" />
          <div class="editor-help-text">{{ componentPathHint }}</div>
        </div>
        <div class="editor-item">
          <label class="editor-label">排序</label>
          <AmuInput v-model="sortOrderInput" placeholder="请输入排序值" />
          <div class="editor-help-text">数字越小越靠前，同级菜单建议从 0 开始递增。</div>
        </div>
        <div class="editor-item">
          <label class="editor-label">状态</label>
          <AmuSelect v-model="form.status" placeholder="请选择状态">
            <AmuOption label="启用" value="ACTIVE" />
            <AmuOption label="停用" value="DISABLED" />
          </AmuSelect>
          <div class="editor-help-text">{{ statusHintText }}</div>
        </div>
        <div v-if="canReadPermissions" class="editor-item editor-item--full">
          <label class="editor-label">访问权限</label>
          <div class="permission-tree-panel">
            <div class="permission-tree-panel__summary">已选择 {{ form.permissionCodes.length }} 项访问权限。未绑定时，前端只按路由结构展示，是否可访问仍取决于页面自身权限校验。</div>
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
        <div v-else class="editor-item editor-item--full">
          <label class="editor-label">访问权限</label>
          <div class="permission-tree-panel permission-tree-panel--muted">当前账号没有访问权限读取能力，暂时无法为菜单绑定访问权限。</div>
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
import { AmuOption, AmuSelect } from 'amu-ui/select'
import { AmuSpace } from 'amu-ui/space'
import { AmuTable, AmuTableColumn } from 'amu-ui/table'
import { AmuTag } from 'amu-ui/tag'
import { AmuTree, type TreeKey } from 'amu-ui/tree'
import { IconChevronDown, IconChevronRight, IconEdit, IconFileText, IconMenu, IconPlus, IconRotateCcw, IconSave, IconSearch, IconTrash2, IconX } from '@amu-ui/icons'
import * as AmuIcons from '@amu-ui/icons'
import { computed, onMounted, reactive, ref, type Component } from 'vue'
import { createMenu, deleteMenu, fetchMenuCatalog, fetchPermissions, updateMenu, type AccessMenuRow, type AccessPermissionRow } from '../api/access-control'
import { useAuthStore } from '../store/auth'
import { buildPermissionTree, collectExpandedKeys, pickPermissionCodes } from '../utils/permission-tree'

defineOptions({
  name: 'SystemMenus'
})

type MenuTableRow = AccessMenuRow & { level: number }

const authStore = useAuthStore()
const rows = ref<AccessMenuRow[]>([])
const permissions = ref<AccessPermissionRow[]>([])
const dialogVisible = ref(false)
const submitting = ref(false)
const editingId = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const permissionTreeSeed = ref(0)
const expandedMenuIds = ref<string[]>([])
const sortOrderInput = ref('0')
const filters = reactive({
  title: '',
  key: '',
  icon: '',
  permissionCode: '',
  menuType: '' as '' | 'DIRECTORY' | 'MENU',
  status: '' as '' | 'ACTIVE' | 'DISABLED'
})
const form = reactive({
  parentId: '',
  key: '',
  title: '',
  icon: 'IconMenu',
  menuType: 'MENU' as 'DIRECTORY' | 'MENU',
  componentPath: '',
  status: 'ACTIVE' as 'ACTIVE' | 'DISABLED',
  permissionCodes: [] as string[],
  sortOrder: 0
})

const iconOptions = Object.keys(AmuIcons)
  .filter((iconName) => /^Icon[A-Z]/.test(iconName))
  .sort((left, right) => left.localeCompare(right))
const canReadPermissions = computed(() => authStore.hasPermission('system:permission:read'))
const hasActiveFilters = computed(() => Object.values(filters).some((value) => String(value).trim() !== ''))
const hasAnyMenus = computed(() => rows.value.length > 0)
const isDirectoryMenu = computed(() => form.menuType === 'DIRECTORY')
const permissionTreeData = computed(() => buildPermissionTree(permissions.value))
const permissionExpandedKeys = computed(() => collectExpandedKeys(permissionTreeData.value))
const permissionLabelMap = computed(() => {
  return new Map(permissions.value.map((item) => [item.code, item.name]))
})
const menuEmptyDescription = computed(() => {
  if (hasActiveFilters.value) {
    return '没有找到符合当前筛选条件的菜单，可以清空条件后重新查看。'
  }
  return '当前还没有菜单数据，创建后会自动参与导航渲染与权限过滤。'
})
const menuTypeHintLabel = computed(() => isDirectoryMenu.value ? '目录' : '菜单')
const menuTypeHintText = computed(() => isDirectoryMenu.value
  ? '只负责分组和折叠展示，不直接承载页面组件。'
  : '会作为可点击页面入口出现在导航中。')
const componentPathHint = computed(() => isDirectoryMenu.value
  ? '目录类型不需要页面组件，保存时会忽略该字段。'
  : '用于标识实际承载页面的组件路径，便于后续维护与排查。')
const statusHintText = computed(() => form.status === 'ACTIVE'
  ? '启用后该菜单会参与运行时导航生成。'
  : '停用后该菜单及其子节点不会在导航中展示。')

const resolveCatalogIcon = (iconName: string): Component | null => {
  if (!iconName) return null
  const resolved = (AmuIcons as Record<string, unknown>)[iconName]
  return typeof resolved === 'object' || typeof resolved === 'function' ? (resolved as Component) : null
}

const resolvePermissionLabel = (code: string) => {
  return permissionLabelMap.value.get(code) || code
}

const refreshPermissionTree = () => {
  permissionTreeSeed.value += 1
}

const collectExpandableIds = (items: AccessMenuRow[]): string[] => {
  return items.flatMap((item) => [
    ...(item.children?.length ? [item.id, ...collectExpandableIds(item.children)] : [])
  ])
}

const flattenMenus = (items: AccessMenuRow[], level = 0): MenuTableRow[] => {
  return items.flatMap((item) => [
    { ...item, level },
    ...(item.children?.length ? flattenMenus(item.children, level + 1) : [])
  ])
}

const collectDescendantIds = (items: AccessMenuRow[], targetId: string): string[] => {
  const result: string[] = []
  const visit = (nodes: AccessMenuRow[]) => {
    nodes.forEach((node) => {
      if (node.id === targetId) {
        const collect = (children: AccessMenuRow[] = []) => {
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

const allMenuRows = computed(() => flattenMenus(rows.value))

const matchesMenu = (item: AccessMenuRow) => {
    const matchesTitle = !filters.title.trim() || item.title.includes(filters.title.trim())
    const matchesKey = !filters.key.trim() || item.key.includes(filters.key.trim())
    const matchesIcon = !filters.icon.trim() || item.icon.includes(filters.icon.trim())
    const matchesPermissionCode = !filters.permissionCode.trim() || item.permissionCodes.some((code) => code.includes(filters.permissionCode.trim()))
    const matchesMenuType = !filters.menuType || item.menuType === filters.menuType
    const matchesStatus = !filters.status || item.status === filters.status

    return matchesTitle && matchesKey && matchesIcon && matchesPermissionCode && matchesMenuType && matchesStatus
}

const filterMenuTree = (items: AccessMenuRow[]): AccessMenuRow[] => {
  return items.reduce<AccessMenuRow[]>((result, item) => {
    const children = item.children?.length ? filterMenuTree(item.children) : undefined
    if (!matchesMenu(item) && (!children || children.length === 0)) {
      return result
    }

    result.push({
      ...item,
      children
    })
    return result
  }, [])
}

const filteredTreeData = computed(() => filterMenuTree(rows.value))

const flattenVisibleMenus = (items: AccessMenuRow[], level = 0): MenuTableRow[] => {
  return items.flatMap((item) => {
    const current: MenuTableRow = { ...item, level }
    if (!item.children?.length || !expandedMenuIds.value.includes(item.id)) {
      return [current]
    }
    return [current, ...flattenVisibleMenus(item.children, level + 1)]
  })
}

const filteredTableData = computed(() => flattenVisibleMenus(filteredTreeData.value))

const pagedTableData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredTableData.value.slice(start, start + pageSize.value)
})

const parentOptions = computed(() => {
  const excludedIds = editingId.value ? [editingId.value, ...collectDescendantIds(rows.value, editingId.value)] : []
  return allMenuRows.value
    .filter((item) => !excludedIds.includes(item.id))
    .map((item) => ({ id: item.id, label: `${'-- '.repeat(item.level)}${item.title}` }))
})

const showPaginationTotal = (total: number, range: [number, number]) => {
  return `第 ${range[0]}-${range[1]} 条 / 共 ${total} 条`
}

const isExpanded = (id: string) => expandedMenuIds.value.includes(id)

const toggleExpanded = (id: string) => {
  expandedMenuIds.value = expandedMenuIds.value.includes(id)
    ? expandedMenuIds.value.filter((item) => item !== id)
    : [...expandedMenuIds.value, id]
}

const handlePermissionTreeChange = (keys: TreeKey[]) => {
  form.permissionCodes = pickPermissionCodes(keys, permissions.value)
}

const loadMenus = async () => {
  try {
    rows.value = await fetchMenuCatalog()
    expandedMenuIds.value = collectExpandableIds(rows.value)
    currentPage.value = 1
  } catch (error) {
    const message = error instanceof Error ? error.message : '加载菜单失败'
    AmuMessage.error({ message })
  }
}

const loadPermissions = async () => {
  if (!canReadPermissions.value) {
    permissions.value = []
    return
  }

  try {
    permissions.value = await fetchPermissions({ silentError: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : '加载访问权限失败'
    AmuMessage.error({ message })
  }
}

const resetForm = () => {
  editingId.value = ''
  form.parentId = ''
  form.key = ''
  form.title = ''
  form.icon = 'IconMenu'
  form.menuType = 'MENU'
  form.componentPath = ''
  form.status = 'ACTIVE'
  form.permissionCodes = []
  form.sortOrder = 0
  sortOrderInput.value = '0'
  refreshPermissionTree()
}

const openCreateDialog = (parent?: AccessMenuRow) => {
  resetForm()
  if (parent) {
    form.parentId = parent.id
    form.sortOrder = parent.children?.length ?? 0
    sortOrderInput.value = String(form.sortOrder)
  }
  dialogVisible.value = true
}

const openEditDialog = (row: AccessMenuRow) => {
  editingId.value = row.id
  form.parentId = row.parentId || ''
  form.key = row.key
  form.title = row.title
  form.icon = row.icon
  form.menuType = row.menuType
  form.componentPath = row.componentPath || ''
  form.status = row.status
  form.permissionCodes = [...row.permissionCodes]
  form.sortOrder = row.sortOrder
  sortOrderInput.value = String(row.sortOrder)
  refreshPermissionTree()
  dialogVisible.value = true
}

const applyFilters = () => {
  currentPage.value = 1
}

const resetFilters = () => {
  filters.title = ''
  filters.key = ''
  filters.icon = ''
  filters.permissionCode = ''
  filters.menuType = ''
  filters.status = ''
  currentPage.value = 1
}

const handlePageSizeChange = (value: number) => {
  pageSize.value = value
  currentPage.value = 1
}

const submitForm = async () => {
  const sortOrder = Number(sortOrderInput.value)
  if (!form.title || !form.key || !form.icon) {
    AmuMessage.warning({ message: '请填写完整的菜单信息' })
    return
  }
  if (!Number.isInteger(sortOrder) || sortOrder < 0) {
    AmuMessage.warning({ message: '排序必须是大于等于 0 的整数' })
    return
  }

  submitting.value = true
  try {
    const payload = {
      parentId: form.parentId || undefined,
      key: form.key.trim(),
      title: form.title.trim(),
      icon: form.icon.trim(),
      menuType: form.menuType,
      componentPath: form.menuType === 'DIRECTORY' ? undefined : form.componentPath.trim() || undefined,
      status: form.status,
      sortOrder,
      permissionCodes: [...form.permissionCodes]
    }

    if (editingId.value) {
      await updateMenu(editingId.value, payload)
      AmuMessage.success({ message: '菜单已更新' })
    } else {
      await createMenu(payload)
      AmuMessage.success({ message: '菜单已创建' })
    }

    dialogVisible.value = false
    await loadMenus()
  } catch (error) {
    const message = error instanceof Error ? error.message : '保存菜单失败'
    AmuMessage.error({ message })
  } finally {
    submitting.value = false
  }
}

const handleDeleteMenu = async (row: AccessMenuRow) => {
  try {
    await deleteMenu(row.id)
    AmuMessage.success({ message: '菜单已删除' })
    await loadMenus()
  } catch (error) {
    const message = error instanceof Error ? error.message : '删除菜单失败'
    AmuMessage.error({ message })
  }
}

onMounted(() => {
  void loadMenus()
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

.menu-title-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.menu-title-cell__toggle {
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

.menu-title-cell__toggle:hover {
  background: var(--amu-color-bg-fill);
}

.menu-title-cell__spacer {
  width: 18px;
  height: 18px;
  flex: 0 0 auto;
}

.menu-title-cell__icon {
  color: var(--amu-color-text-secondary);
  flex: 0 0 auto;
}

.menu-title-cell__icon--node {
  color: var(--amu-color-primary);
}

.menu-title-cell__text {
  min-width: 0;
}

.menu-title-cell__text.is-directory {
  font-weight: 600;
}

.menu-icon-cell {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.menu-icon-cell__preview,
.menu-icon-option__preview {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 8px;
  color: var(--amu-color-text-secondary);
  background: var(--amu-color-bg-fill);
}

.menu-icon-option {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.menu-empty-text {
  color: var(--amu-color-text-secondary);
  font-size: 13px;
}

.menu-component-text {
  color: var(--amu-color-text-secondary);
  font-size: 13px;
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

.permission-tree-panel {
  min-height: 240px;
  padding: 12px 14px;
  border: 1px solid var(--amu-color-border-default);
  border-radius: 12px;
  background: var(--amu-color-bg-container);
}

.permission-tree-panel__summary {
  margin-bottom: 10px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--amu-color-text-secondary);
}

.permission-tree-panel--muted {
  display: flex;
  align-items: center;
  min-height: 88px;
  font-size: 13px;
  line-height: 1.6;
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