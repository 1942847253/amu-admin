<template>
  <div class="page-container">
    <AmuCard >
      <AmuForm :model="filters" layout="horizontal" label-align="left" class="search-form">
        <AmuRow :gutter="[16, 16]" class="search-row">
          <AmuCol :xs="24" :md="12" :xl="6">
            <AmuFormItem class="search-item" label="姓名" prop="displayName">
              <AmuInput v-model="filters.displayName" placeholder="请输入姓名" clearable />
            </AmuFormItem>
          </AmuCol>
          <AmuCol :xs="24" :md="12" :xl="6">
            <AmuFormItem class="search-item" label="账号" prop="username">
              <AmuInput v-model="filters.username" placeholder="请输入账号" clearable />
            </AmuFormItem>
          </AmuCol>
          <AmuCol :xs="24" :md="12" :xl="6">
            <AmuFormItem class="search-item" label="邮箱" prop="email">
              <AmuInput v-model="filters.email" placeholder="请输入邮箱" clearable />
            </AmuFormItem>
          </AmuCol>
          <AmuCol :xs="24" :md="12" :xl="6">
            <AmuFormItem class="search-item" label="状态" prop="status">
              <AmuSelect v-model="filters.status" placeholder="请选择状态" clearable>
                <AmuOption label="启用" value="ACTIVE" />
                <AmuOption label="锁定" value="LOCKED" />
              </AmuSelect>
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
      <template #title>用户列表</template>
      <template #extra>
        <AmuButton v-permission="'system:user:write'" type="primary" class="page-primary-action" @click="openCreateDialog">
          <template #icon>
            <AmuIcon><IconPlus /></AmuIcon>
          </template>
          新建用户
        </AmuButton>
      </template>
      <AmuTable :data="pagedTableData" border stripe>
        <AmuTableColumn prop="displayName" label="姓名" min-width="120" />
        <AmuTableColumn prop="username" label="账号" min-width="120" />
        <AmuTableColumn prop="department" label="部门" min-width="140" />
        <AmuTableColumn prop="title" label="岗位" min-width="140" />
        <AmuTableColumn prop="roleCodes" label="角色">
          <template #default="{ row }">
            <AmuSpace wrap>
              <AmuTag v-for="role in row.roleCodes" :key="role" type="primary">{{ role }}</AmuTag>
            </AmuSpace>
          </template>
        </AmuTableColumn>
        <AmuTableColumn prop="status" label="状态">
          <template #default="{ row }">
            <AmuTag :type="row.status === 'ACTIVE' ? 'success' : 'danger'">{{ row.status === 'ACTIVE' ? '启用' : '锁定' }}
            </AmuTag>
          </template>
        </AmuTableColumn>
        <AmuTableColumn prop="email" label="邮箱" min-width="220" />
        <AmuTableColumn label="操作" width="320" align="right">
          <template #default="{ row }">
            <AmuSpace wrap class="table-actions" :size="4">
              <AmuButton type="text" size="small" @click="openEditDialog(row)">
                <template #icon>
                  <AmuIcon><IconEdit /></AmuIcon>
                </template>
                编辑
              </AmuButton>
              <AmuPopconfirm :title="row.status === 'ACTIVE' ? '确认锁定该用户？' : '确认启用该用户？'"
                @confirm="handleStatusToggle(row)">
                <template #reference>
                  <AmuButton v-permission="'system:user:write'" type="text" size="small"
                    :status="row.status === 'ACTIVE' ? 'warning' : 'success'">
                    <template #icon>
                      <AmuIcon><component :is="row.status === 'ACTIVE' ? IconLock : IconCheck" /></AmuIcon>
                    </template>
                    {{ row.status === 'ACTIVE' ? '锁定' : '启用' }}
                  </AmuButton>
                </template>
              </AmuPopconfirm>
              <AmuPopconfirm title="确认将该用户密码重置为 123456 吗？" @confirm="handleResetPassword(row)">
                <template #reference>
                  <AmuButton v-permission="'system:user:write'" type="text" size="small">
                    <template #icon>
                      <AmuIcon><IconKey /></AmuIcon>
                    </template>
                    重置密码
                  </AmuButton>
                </template>
              </AmuPopconfirm>
              <AmuPopconfirm title="确认删除该用户？" @confirm="handleDeleteUser(row)">
                <template #reference>
                  <AmuButton v-permission="'system:user:write'" type="text" size="small" status="danger">
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
        <AmuPagination v-model="currentPage" :page-size="pageSize" :total="filteredTableData.length"
          :show-size-changer="true" :page-size-options="[10, 20, 50, 100]" :show-total="showPaginationTotal"
          @update:page-size="handlePageSizeChange" />
      </div>
    </AmuCard>

    <AmuDrawer v-model="dialogVisible" title="用户配置" placement="right" size="760px" :min-size="560" :max-size="1080"
      resizable body-scrollable>
      <div class="editor-grid">
        <div class="editor-item">
          <label class="editor-label">账号</label>
          <AmuInput v-model="form.username" placeholder="请输入账号" />
        </div>
        <div class="editor-item">
          <label class="editor-label">姓名</label>
          <AmuInput v-model="form.displayName" placeholder="请输入姓名" />
        </div>
        <div class="editor-item">
          <label class="editor-label">邮箱</label>
          <AmuInput v-model="form.email" placeholder="请输入邮箱" />
        </div>
        <div class="editor-item">
          <label class="editor-label">岗位</label>
          <AmuInput v-model="form.title" placeholder="请输入岗位" />
        </div>
        <div class="editor-item">
          <label class="editor-label">部门</label>
          <AmuSelect v-model="form.departmentId" placeholder="请选择部门">
            <AmuOption v-for="department in departments" :key="department.id" :label="department.name"
              :value="department.id" />
          </AmuSelect>
        </div>
        <div class="editor-item">
          <label class="editor-label">密码</label>
          <AmuInput v-model="form.password" type="password" :placeholder="editingId ? '留空则不修改密码' : '请输入初始密码'" />
        </div>
        <div class="editor-item editor-item--full">
          <label class="editor-label">角色</label>
          <AmuCheckboxGroup v-model="form.roleCodes" :options="roleOptions" />
        </div>
        <div v-if="canReadPermissions" class="editor-item editor-item--full">
          <label class="editor-label">直授权限</label>
          <div class="permission-tree-panel">
            <AmuTree :key="permissionTreeSeed" :data="permissionTreeData"
              :default-expanded-keys="permissionExpandedKeys" :default-checked-keys="form.directPermissionCodes"
              checkable show-line :check-on-click-node="true" @update:checked-keys="handlePermissionTreeChange" />
          </div>
        </div>
        <div class="editor-item">
          <label class="editor-label">状态</label>
          <div class="editor-switch">
            <AmuSwitch v-model="statusEnabled" />
            <span>{{ statusEnabled ? '启用' : '锁定' }}</span>
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
import { AmuCheckboxGroup } from 'amu-ui/checkbox'
import { AmuDrawer } from 'amu-ui/drawer'
import { AmuForm, AmuFormItem } from 'amu-ui/form'
import { AmuIcon } from 'amu-ui/icon'
import { AmuInput } from 'amu-ui/input'
import { AmuPagination } from 'amu-ui/pagination'
import { AmuRow } from 'amu-ui/row'
import { AmuCol } from 'amu-ui/col'
import { AmuOption, AmuSelect } from 'amu-ui/select'
import { AmuPopconfirm } from 'amu-ui/popconfirm'
import { AmuSpace } from 'amu-ui/space'
import { AmuSwitch } from 'amu-ui/switch'
import { AmuTable, AmuTableColumn } from 'amu-ui/table'
import { AmuTag } from 'amu-ui/tag'
import { AmuTree, type TreeKey } from 'amu-ui/tree'
import { AmuMessage } from 'amu-ui/message'
import { IconCheck, IconEdit, IconKey, IconLock, IconPlus, IconRotateCcw, IconSave, IconSearch, IconTrash2, IconX } from '@amu-ui/icons'
import { computed, onMounted, reactive, ref } from 'vue'
import { createUser, deleteUser, fetchDepartments, fetchPermissions, fetchRoles, fetchUsers, resetUserPassword, setUserStatus, updateUser, type AccessDepartmentRow, type AccessPermissionRow, type AccessRoleRow, type AccessUserRow } from '../api/access-control'
import { useAuthStore } from '../store/auth'
import { buildPermissionTree, collectExpandedKeys, pickPermissionCodes } from '../utils/permission-tree'

defineOptions({
  name: 'SystemUsers'
})

const authStore = useAuthStore()
const rawData = ref<AccessUserRow[]>([])
const roles = ref<AccessRoleRow[]>([])
const permissions = ref<AccessPermissionRow[]>([])
const departments = ref<AccessDepartmentRow[]>([])
const dialogVisible = ref(false)
const submitting = ref(false)
const editingId = ref('')
const statusEnabled = ref(true)
const permissionTreeSeed = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const filters = reactive({
  displayName: '',
  username: '',
  email: '',
  status: '' as '' | 'ACTIVE' | 'LOCKED'
})
const form = reactive({
  username: '',
  displayName: '',
  email: '',
  departmentId: '',
  title: '',
  roleCodes: [] as string[],
  directPermissionCodes: [] as string[],
  password: ''
})

const canReadPermissions = computed(() => authStore.hasPermission('system:permission:read'))
const roleOptions = computed(() => roles.value.map((role) => ({ label: `${role.name} (${role.code})`, value: role.code })))
const permissionTreeData = computed(() => buildPermissionTree(permissions.value))
const permissionExpandedKeys = computed(() => collectExpandedKeys(permissionTreeData.value))

const refreshPermissionTree = () => {
  permissionTreeSeed.value += 1
}

const handlePermissionTreeChange = (keys: TreeKey[]) => {
  form.directPermissionCodes = pickPermissionCodes(keys, permissions.value)
}

const resetForm = () => {
  editingId.value = ''
  form.username = ''
  form.displayName = ''
  form.email = ''
  form.departmentId = departments.value[0]?.id || ''
  form.title = ''
  form.roleCodes = []
  form.directPermissionCodes = []
  form.password = ''
  statusEnabled.value = true
  refreshPermissionTree()
}

const loadUsers = async () => {
  try {
    rawData.value = await fetchUsers()
    currentPage.value = 1
  } catch (error) {
    const message = error instanceof Error ? error.message : '加载用户失败'
    AmuMessage.error({ message })
  }
}

const loadMetadata = async () => {
  try {
    const [nextRoles, nextDepartments, nextPermissions] = await Promise.all([
      fetchRoles({ silentError: true }),
      fetchDepartments({ silentError: true }),
      canReadPermissions.value
        ? fetchPermissions({ silentError: true })
        : Promise.resolve([] as AccessPermissionRow[])
    ])
    roles.value = nextRoles
    departments.value = nextDepartments
    permissions.value = nextPermissions
    if (!form.departmentId) {
      form.departmentId = nextDepartments[0]?.id || ''
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '加载用户元数据失败'
    AmuMessage.error({ message })
  }
}

const openCreateDialog = () => {
  resetForm()
  dialogVisible.value = true
}

const openEditDialog = (row: AccessUserRow) => {
  editingId.value = row.id
  form.username = row.username
  form.displayName = row.displayName
  form.email = row.email
  form.departmentId = departments.value.find((department) => department.name === row.department)?.id || departments.value[0]?.id || ''
  form.title = row.title
  form.roleCodes = [...row.roleCodes]
  form.directPermissionCodes = [...row.directPermissionCodes]
  form.password = ''
  statusEnabled.value = row.status === 'ACTIVE'
  refreshPermissionTree()
  dialogVisible.value = true
}

const submitForm = async () => {
  if (!form.username || !form.displayName || !form.email || !form.departmentId || !form.title) {
    AmuMessage.warning({ message: '请填写完整的用户信息' })
    return
  }
  if (form.roleCodes.length === 0) {
    AmuMessage.warning({ message: '请至少分配一个角色' })
    return
  }

  submitting.value = true
  try {
    const payload = {
      username: form.username,
      displayName: form.displayName,
      email: form.email,
      departmentId: form.departmentId,
      title: form.title,
      status: statusEnabled.value ? 'ACTIVE' as const : 'LOCKED' as const,
      roleCodes: [...form.roleCodes],
      directPermissionCodes: [...form.directPermissionCodes],
      password: form.password || undefined
    }

    if (editingId.value) {
      await updateUser(editingId.value, payload)
      AmuMessage.success({ message: '用户已更新' })
    } else {
      await createUser(payload)
      AmuMessage.success({ message: '用户已创建' })
    }

    dialogVisible.value = false
    await loadUsers()
  } catch (error) {
    const message = error instanceof Error ? error.message : '保存用户失败'
    AmuMessage.error({ message })
  } finally {
    submitting.value = false
  }
}

const handleStatusToggle = async (row: AccessUserRow) => {
  try {
    await setUserStatus(row.id, row.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE')
    AmuMessage.success({ message: row.status === 'ACTIVE' ? '用户已锁定' : '用户已启用' })
    await loadUsers()
  } catch (error) {
    const message = error instanceof Error ? error.message : '更新用户状态失败'
    AmuMessage.error({ message })
  }
}

const handleResetPassword = async (row: AccessUserRow) => {
  try {
    const result = await resetUserPassword(row.id)
    AmuMessage.success({ message: `密码已重置，临时密码：${result.temporaryPassword}` })
  } catch (error) {
    const message = error instanceof Error ? error.message : '重置密码失败'
    AmuMessage.error({ message })
  }
}

const handleDeleteUser = async (row: AccessUserRow) => {
  try {
    await deleteUser(row.id)
    AmuMessage.success({ message: '用户已删除' })
    await loadUsers()
  } catch (error) {
    const message = error instanceof Error ? error.message : '删除用户失败'
    AmuMessage.error({ message })
  }
}

const filteredTableData = computed(() => {
  return rawData.value.filter((item) => {
    const matchesDisplayName = !filters.displayName.trim() || item.displayName.includes(filters.displayName.trim())
    const matchesUsername = !filters.username.trim() || item.username.includes(filters.username.trim())
    const matchesEmail = !filters.email.trim() || item.email.includes(filters.email.trim())
    const matchesStatus = !filters.status || item.status === filters.status

    return matchesDisplayName && matchesUsername && matchesEmail && matchesStatus
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
  filters.displayName = ''
  filters.username = ''
  filters.email = ''
  filters.status = ''
  currentPage.value = 1
}

const handlePageSizeChange = (value: number) => {
  pageSize.value = value
  currentPage.value = 1
}

onMounted(() => {
  void loadUsers()
  void loadMetadata()
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

.editor-switch {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 36px;
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
