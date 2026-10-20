# AGENTS.md

SaltLab：以桌面环境（DE）为形态的个人博客。React 19 · Vite 8 · TanStack Router · Tailwind v4 + DaisyUI 5 · Zustand · i18next · pnpm。部署到 GitHub Pages（`www.salta.top`，Vite `base` 默认 `/`）。

## 命令

- `pnpm dev` 本地开发
- `pnpm build` = `pnpm generate && tsc -b && vite build`（**先生成路由树**，再类型检查/构建）
- `pnpm generate` 仅生成路由树（`tsr generate`）
- `pnpm lint` oxlint；**无测试框架**（无 `pnpm test`）
- 单独类型检查：先 `pnpm generate`，再 `pnpm exec tsc -b`

## 关键陷阱

- `src/routeTree.gen.ts` 被 `.gitignore` 忽略，由 TanStack Router 插件生成。全新克隆后直接 `tsc`/`build` 会因缺少它而失败 —— 必须先 `pnpm generate`（或 `pnpm dev`/`pnpm build`）。**不要手改该文件。**
- tsconfig 严格：`verbatimModuleSyntax`（类型导入必须 `import type`）、`noUncheckedIndexedAccess`、`noUnusedLocals`/`noUnusedParameters`、`erasableSyntaxOnly`（禁用 `enum`/`namespace`）。
- 代码注释与提交信息均为**中文**；提交格式 `emoji type(scope): 中文描述`（如 `✨ feat(settings): ...`、`🐛 fix(...)`、`🚚 chore(deps): ...`）。

## 主题系统（核心）

主题是独立 npm 包，以 git 依赖引入：`@salta/theme-infinite`、`@salta/theme-papercut`（`git+ssh://git@github.com/SaltApocalypse/salta-theme-*.git#vX`）。**主题源码不在本仓库**，勿在此修改主题组件。

- 主题包从 `@salta/theme-xxx/theme` 导出 `theme`（`{ id, name, components }`），CSS 入口为 `@salta/theme-xxx`。
- 组件经 `theme.components.*` 获取；跨主题 props 契约在 `src/theme/themes.ts`（`PanelProps` / `LightButtonProps` / `AlertProps` / `DropdownOption` / `ThemeCapabilities`）。因各主题自带类型，使用处需 `as unknown as ComponentType<XxxProps>`（见 `Window.tsx:36`）。
- `capabilities`（`src/theme/themes.ts:68`）控制设置项显隐：`dark`（夜间模式，`data-theme` 切到 `${id}-dark`）、`windowMask`。
- **新增主题必须同时**：① 加 git 依赖并提交 `pnpm-lock.yaml`；② 在 `src/theme/themes.ts` 注册（含 `capabilities`）；③ 在 `src/index.css` 加 `@import` **和** `@source "../node_modules/@salta/theme-xxx/dist"`（Tailwind 需扫描主题 dist 才能生成其类名）。
- Panel `fill` 语义：铺满**有确定高度的父容器**；在普通文档流中退化为「全宽 + 内容高」。窗体缩放手柄刻意放在窗口根节点（Panel 外），**勿移回 Panel 内**（见 `Window.tsx:151`）。

## 窗口 / 内容接线

新增窗口或桌面图标通常要改多处：`src/config/windowIcons.ts`（标题栏图标）、`src/config/windowExternalUrls.ts`（外部站点窗口）、`src/content/windowContents.tsx` + `windowContentRegistry.ts`（内容组件与注册 key）、`src/config/desktopIcons.ts`（桌面图标，位置用 `gridCell(col,row)`）、i18n 的 `windows.<type>` 与 `icons.*`。近全屏的「沉浸式」窗口类型在 `src/desktop/desktopStore.ts` 的 `IMMERSIVE_WINDOW_TYPES` 登记。

## i18n

- 语言包 `src/i18n/locales/{en,zh}.ts`；`Lang` 联合类型在 `src/i18n/index.ts`。
- 新增语言需同步 `LANGUAGES`、`getInitialLang()`、`getCurrentLang()`（后者当前把非 `zh` 一律归为 `en`）。

## 持久化键

`saltlab:theme`、`saltlab:dark`、`saltlab.lang`、`saltlab.desktop`（图标位置 + 窗体遮罩）。

## CI / 部署

- push 到 `main` 触发 `.github/workflows/deploy.yml` → GitHub Pages（`pnpm build` 后上传 `dist`）。
- CI 用 `pnpm install --frozen-lockfile`（pnpm 10 / Node 20）。主题经 lockfile 中记录的 **codeload tarball URL** 拉取，**CI 无需 SSH**；故 **`pnpm-lock.yaml` 必须提交**。
- 本地非 frozen 安装会重新解析 `git+ssh` 依赖，访问 github.com 可能偶发超时 —— 重试即可。
