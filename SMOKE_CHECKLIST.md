# amu-admin 冒烟检查清单（重构回归）

> 目标：验证布局重构后的核心能力、权限链路和关键交互是否完整可用。

## 0. 启动与准备

- [ ] 在 `templates/amu-admin` 目录执行：`pnpm dev`
- [ ] 访问本地地址（默认 `http://localhost:5174`，如已配置 `VITE_DEV_PORT` 则按实际端口访问）
- [ ] 登录默认账号：
  - 管理员：`admin / 123456`
  - 操作员：`operator / 123456`
  - 审计员：`audit / 123456`

---

## 1. 登录与路由守卫

- [ ] 未登录访问 `/dashboard` 会跳转到 `/login`
- [ ] 登录后可进入重定向页面（`redirect` 生效）
- [ ] 登录态访问 `/login` 会跳转到 `/dashboard`
- [ ] 退出登录后再次访问受保护页面会回到 `/login`

---

## 2. 布局模式（设置抽屉）

在右上角打开“个性设置”，逐项切换 `layoutMode`：

- [ ] `vertical`：左侧菜单 + 顶栏 + 标签栏正常显示
- [ ] `horizontal`：顶部菜单正常，左侧侧栏隐藏
- [ ] `double-column`：双列侧栏（一级窄列 + 子菜单列）正常
- [ ] `mixed-nav`：顶部菜单与侧栏子列联动，切换顶栏后子列同步变化
- [ ] `mixed-column`：混合双列模式可用
- [ ] `content-only`：仅内容区，侧栏与标签区隐藏逻辑正确

---

## 3. 侧栏策略开关

在“个性设置”中验证：

- [ ] `Collapse Menu` 开启后可折叠/展开侧栏
- [ ] `Collapse On Menu Select` 开启后，点菜单会自动折叠（`double-column` 除外）
- [ ] `Expand Sidebar On Hover` 开启后，折叠态悬停会临时展开
- [ ] `Sidebar Accordion` 开启后同层只保留一个展开分组
- [ ] `Auto Activate First Menu` 开启后进入分组会自动定位首个叶子菜单
- [ ] `Show Mixed Child Menu` 开关对 mixed 系列模式生效

---

## 4. 顶栏/主题联动

- [ ] `Header Dark` 开启后，顶栏与顶部菜单区域变为深色风格
- [ ] `Sidebar Dark` / `Sidebar Child Dark` 开关对菜单区域生效
- [ ] 主色预设切换后，按钮高亮/进度条/选中态同步变化
- [ ] 字号与圆角系数调整在布局中可见

---

## 5. 标签页（Tabs）

- [ ] 路由切换会自动新增/激活标签
- [ ] 标签可拖拽排序
- [ ] 右键（下拉命令）`关闭当前/左侧/右侧/其他/全部` 正常
- [ ] `Pin/Unpin` 正常（且受 `showPinButton` 开关控制）
- [ ] `Open in new window` 可以在新窗口打开当前页
- [ ] `Maximize/Restore` 正常切换全屏

---

## 6. 搜索与通知

### 全局搜索
- [ ] `Ctrl + K` 可打开搜索（启用快捷键时）
- [ ] 标题命中与路径命中分组显示正常
- [ ] 结果键盘上下选择与回车跳转正常
- [ ] 最近访问记录可持久化并展示

### 通知中心
- [ ] 未读角标数量正确
- [ ] 单条“已读”动作正常
- [ ] 筛选 `全部/未读` 正常
- [ ] `全部已读` 正常
- [ ] `清空` 正常

---

## 7. 权限与 403

### admin（`admin`）
- [ ] 可访问：`/workplace` `/dashboard` `/system/users` `/system/roles` `/system/auth-debug`

### operator（`operator`）
- [ ] 可访问：`/dashboard` `/system/users`
- [ ] 访问 `/system/roles`、`/system/auth-debug` 跳转 `/403`

### auditor（`audit`）
- [ ] 可访问：`/dashboard`
- [ ] 访问 `/system/users`、`/system/roles`、`/system/auth-debug` 跳转 `/403`

---

## 8. 鉴权链路自测页（`/system/auth-debug`）

> 建议使用 `admin` 验证。

- [ ] “发起单次业务请求”成功
- [ ] “发起 5 个并发请求”可完成
- [ ] “使 accessToken 立即过期”后请求可触发刷新并恢复
- [ ] “使 refreshToken 立即过期”后触发失效处理（回到登录流程）
- [ ] “一键脚本化回放”全流程完成且日志可读

---

## 9. 快捷键与辅助能力

- [ ] `Alt + L` 锁屏生效，`Esc` 可解锁
- [ ] `Alt + Q` 快捷登出（开关开启时）
- [ ] 页面路由切换进度条可见（开关开启时）
- [ ] 页面 loading 遮罩可见（开关开启时）
- [ ] 水印开关生效

---

## 10. 通过标准（建议）

- [ ] P0（阻塞）问题 = 0：白屏、死循环、路由错跳、无法登录、权限失效
- [ ] P1（严重）问题 <= 2：核心流程偶发失败但可恢复
- [ ] 关键路径（登录→切布局→搜路由→切页签→权限校验→退出）全通过

---

## 11. 记录模板

```
[时间] 2026-03-05 20:30
[环境] 本地 dev / Chrome 版本
[账号] admin
[模块] mixed-nav 顶栏联动
[步骤] 设置为 mixed-nav -> 点顶栏“系统管理” -> 观察侧栏子列
[结果] 通过/失败
[备注] 如失败请附报错堆栈与截图
```
