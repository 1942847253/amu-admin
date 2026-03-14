# amu-admin

基于 Vue 3、TypeScript、Pinia、Vue Router 与 amu-ui 的后台管理前端模板，面向需要快速搭建权限后台、配置台、运营后台的业务系统。

这是一份独立仓库视角的 README 草案，用于从当前 monorepo 中抽离 `templates/amu-admin` 时直接改造使用。

## 特性

- RBAC 权限模型，覆盖用户、角色、权限点、菜单、部门等后台场景
- 动态路由注入与页面级权限守卫
- 指令级权限控制 `v-permission`
- 双 token 鉴权与刷新重放链路
- 标签页导航、页面缓存、布局模式切换、主题与暗黑模式
- 基于 `amu-ui` 与 `@amu-ui/icons` 的统一视觉与交互底座
- 默认对接真实后端接口，而不是本地假数据 Mock

## 环境要求

- Node.js 22+
- pnpm 10+

## 快速开始

安装依赖：

```bash
pnpm install
```

复制环境变量：

```bash
cp .env.example .env
```

启动开发环境：

```bash
pnpm dev
```

默认开发地址通常为 `http://localhost:5174`。

## 环境变量

- `VITE_DEV_PORT`：前端 dev server 端口，默认 `5174`
- `VITE_API_PROXY_TARGET`：本地开发时 `/api` 代理目标
- `VITE_USE_MOCK_API`：是否启用纯前端 Mock 演示；默认建议为 `true`
- `VITE_API_BASE_URL`：生产环境后端地址；当前端部署到 GitHub Pages、Cloudflare Pages 等静态托管平台时使用
- `VITE_USE_WORKSPACE_SOURCE`：独立仓库中建议固定为 `false`
- `VITE_APP_BASE_PATH`：前端访问基路径；GitHub Pages 默认地址通常填 `/<repo>/`
- `VITE_APP_NAME`、`VITE_APP_SHORT_NAME`：应用名称与简写
- `VITE_APP_TITLE`、`VITE_APP_DESCRIPTION`：品牌文案与页面基础说明
- `VITE_APP_COPYRIGHT`、`VITE_APP_REPOSITORY_URL`：页脚版权与仓库地址

## GitHub Pages 部署

如果你要把前端部署到 GitHub Pages，请在 `.env.production` 或构建环境变量中设置：

```bash
VITE_USE_MOCK_API=true
VITE_APP_BASE_PATH=/your-repo/
VITE_USE_WORKSPACE_SOURCE=false
```

其中：

- `VITE_USE_MOCK_API=true` 表示直接使用浏览器本地 Mock 数据运行整套后台演示
- `VITE_APP_BASE_PATH` 在默认 GitHub Pages 地址下通常等于仓库名路径
- 如果你给 GitHub Pages 绑定了自定义域名，`VITE_APP_BASE_PATH` 通常改为 `/`

如果你后续切回真实后端，再把 `VITE_USE_MOCK_API=false`，并补上：

```bash
VITE_API_BASE_URL=https://your-api.example.com
```

## 常用命令

开发：

```bash
pnpm dev
```

构建：

```bash
pnpm build
```

测试：

```bash
pnpm test
```

监听测试：

```bash
pnpm test:watch
```

类型检查：

```bash
pnpm type:check
```

## 目录结构

- `src/router`：静态路由、动态路由注入与守卫
- `src/store/auth.ts`：登录态与 token 生命周期
- `src/store/permission.ts`：权限树、菜单树、动态路由生成
- `src/api/http.ts`：请求封装、401 刷新、错误提示
- `src/layouts`：布局系统、顶栏、侧栏、标签栏与设置抽屉
- `src/views`：示例业务页面
- `__test__`：模板核心单测
- `tests/setup.ts`：Vitest jsdom 测试兜底

## 后端对接

当前模板默认假设后端提供以下能力：

- 登录、刷新、登出、用户信息接口
- 菜单与权限点返回
- 仪表盘与系统管理相关示例接口

如果你继续使用配套服务端模板，建议在独立仓库 README 中提供后端仓库地址或接口契约说明。

## 发布前检查

- `.env.example` 可直接复制为 `.env`
- `pnpm install`、`pnpm build`、`pnpm test` 全通过
- `VITE_USE_WORKSPACE_SOURCE=false` 可正常运行
- README 已改成独立仓库语义，不再出现 monorepo 命令

## License

MIT
