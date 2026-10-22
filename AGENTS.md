# AGENTS.md

SaltLab：以桌面环境（DE）为形态的个人博客。React 19 · Vite 8 · TanStack Router · Tailwind v4 + DaisyUI 5 · Zustand · i18next · pnpm。部署到 GitHub Pages（`www.salta.top`，Vite `base` 默认 `/`）。

## 命令

- `pnpm dev` 本地开发
- `pnpm build` = `pnpm generate && tsc -b && vite build`（**先生成路由树**，再类型检查/构建）
- `pnpm generate` 仅生成路由树（`tsr generate`）
- `pnpm lint` oxlint；**无测试框架**（无 `pnpm test`）
- 单独类型检查：先 `pnpm generate`，再 `pnpm exec tsc -b`
- `pnpm music:update [playlistUrl]` 重新生成音乐歌单 JSON（见「音乐数据」）

## 关键陷阱

- `src/routeTree.gen.ts` 被 `.gitignore` 忽略，由 TanStack Router 插件生成。全新克隆后直接 `tsc`/`build` 会失败 —— 必须先 `pnpm generate`（或 `pnpm dev`/`pnpm build`）。**不要手改该文件。**
- tsconfig 严格：`verbatimModuleSyntax`（类型导入必须 `import type`）、`noUncheckedIndexedAccess`、`noUnusedLocals`/`noUnusedParameters`、`erasableSyntaxOnly`（禁用 `enum`/`namespace`）；JSON 导入已启用 `resolveJsonModule`。
- 代码注释与提交信息均为**中文**；提交格式 `emoji type(scope): 中文描述`（如 `✨ feat(settings): ...`、`🐛 fix(...)`、`🚚 chore(deps): ...`）。

## 主题系统（核心）

主题是独立 npm 包，以 git 依赖引入：`@salta/theme-infinite`、`@salta/theme-papercut`（`git+ssh://git@github.com/SaltApocalypse/salta-theme-*.git#vX`）。**主题源码不在本仓库**，勿在此修改主题组件。

- 从 `@salta/theme-xxx/theme` 导出 `theme`（`{ id, name, components }`），CSS 入口 `@salta/theme-xxx`。
- 组件经 `theme.components.*` 获取；跨主题 props 契约在 `src/theme/themes.ts`（`PanelProps` / `LightButtonProps` / `AlertProps` / `DropdownOption` / `ThemeCapabilities`）。各主题自带类型，使用处需 `as unknown as ComponentType<XxxProps>`（见 `Window.tsx`）。
- `capabilities`（`src/theme/themes.ts`）控制设置项显隐：`dark`（夜间模式，`data-theme` 切到 `${id}-dark`）、`windowMask`。
- **新增主题必须同时**：① 加 git 依赖并提交 `pnpm-lock.yaml`；② 在 `src/theme/themes.ts` 注册（含 `capabilities`）；③ 在 `src/index.css` 加 `@import` **和** `@source "../node_modules/@salta/theme-xxx/dist"`（Tailwind 需扫描主题 dist 才能生成其类名）。
- Panel `fill` 语义：铺满**有确定高度的父容器**；普通文档流中退化为「全宽 + 内容高」。窗体缩放手柄刻意放在窗口根节点（Panel 外），**勿移回 Panel 内**（`Window.tsx` 手柄注释）。
- 迷你卡片 `MiniCard` 同样使用主题 `Panel`（`padding="none"`、`tilt={false}`、`p-0!`），以保持与窗体一致的外观。

## 桌面壳层 / 状态

- 顶部状态栏高 `STATUS_BAR_HEIGHT = 40`；图标网格首行 `DESKTOP_TOP_PADDING = STATUS_BAR_HEIGHT + DESKTOP_PADDING`（`src/desktop/grid.ts`）。
- **图标布局分「逻辑位置 / 显示位置」**：store 里的 `icon.position` 是逻辑位置（配置或用户拖拽）；`layoutIconPositions()` 是纯函数，按当前 bounds 计算无重叠显示位置，**不要写回 store**（旧 `fitIcons` 会在窗口缩放/开控制台时破坏布局）。位置写入仅限 `moveIcon` 与 `resetIconPositions`。
- 窗口层级有界：`MAX_WINDOW_Z = 30`（`raiseWindow` 超限时归一化为 1..N），低于状态栏 `z-40`、迷你卡片 `z-50`、Toast `z-100`。**不要恢复无界自增的 `zCounter`。**
- 窗口：最小化 / 最大化·还原 / 关闭；最大化时拖标题栏会还原（`unmaximizeWindow`）；拖拽/缩放期间关闭几何过渡（`Window.tsx` 的 `interacting`）。
- 最小化 3 分钟后挂起（`MINIMIZED_SUSPEND_TTL_MS`）；`NO_SUSPEND_WINDOW_TYPES` 排除 `music`（音乐由播放器暂停计时管理）。

## 全局 store / 瞬态 UI

- **瞬态 UI 不要渲染在窗口内容里**（窗口关闭会卸载）。Toast 用 `alertStore` + `AlertHost`（挂在 `src/routes/__root.tsx`）。
- 音乐播放器是模块级单例 `musicStore`（`src/desktop/musicStore.ts`）：关闭音乐窗体后继续播放；暂停 3 分钟后释放音频流；`MUSIC_PLAYLIST` 也从这里导出。
- 迷你卡片：`miniCardStore` + `MiniCardHost`（右上角 `z-50`，自上而下堆叠）；卡片是窗体的延伸，关闭卡片只执行卡片自身的副作用（音乐卡片会暂停播放），**不关闭/卸载窗体**。

## 音乐数据

- 数据源 `src/data/music-playlist.json`，构建时打包；运行时**不请求任何 API**。
- 更新：`pnpm music:update ["https://music.apple.com/<cc>/playlist/pl.xxxx"]` → 重新生成 JSON → `pnpm build`。
- 脚本 `scripts/update-music-playlist.mjs`：抓公开 `pl.` 歌单页的 `serialized-server-data`，再用公开 iTunes Lookup 补 30s `previewUrl`。
- **仅支持公开 `pl.` 链接**；资料库 `/library/playlist/p.` 需要 MusicKit 授权，脚本读不到。不要伪造 preview 链接。

## 窗口 / 内容接线

新增窗口或桌面图标通常要改多处：`src/config/windowIcons.ts`（标题栏图标）、`src/config/windowExternalUrls.ts`（外部站点窗口）、`src/content/windowContents.tsx` + `windowContentRegistry.ts`（内容组件与注册 key）、`src/config/desktopIcons.ts`（桌面图标，位置用 `gridCell(col,row)`）、i18n 的 `windows.<type>` 与 `icons.*`。近全屏的「沉浸式」窗口类型在 `desktopStore.ts` 的 `IMMERSIVE_WINDOW_TYPES` 登记。

## i18n

- 语言包 `src/i18n/locales/{en,zh}.ts`；`Lang` 联合类型在 `src/i18n/index.ts`。
- 新增语言需同步 `LANGUAGES`、`getInitialLang()`、`getCurrentLang()`（后者当前把非 `zh` 一律归为 `en`）。

## 动效

- 应用层动画 token 在 `src/index.css` 的 `@theme`（`window-in` / `icon-in` / `status-in` / `eq` / `artwork-in`）；使用 `motion-safe:` 前缀尊重 `prefers-reduced-motion`。
- **不要**给窗口根节点加常驻 `transition-[left,top,...]`；拖拽/缩放期间必须禁用过渡（`Window.tsx` 的 `interacting`）。

## 持久化键

`saltlab:theme`、`saltlab:dark`、`saltlab.lang`、`saltlab.desktop`（图标位置 + 窗体遮罩）。

## CI / 部署

- push 到 `main` 触发 `.github/workflows/deploy.yml` → GitHub Pages（`pnpm build` 后上传 `dist`）。
- CI 用 `pnpm install --frozen-lockfile`（pnpm 10 / Node 20）。主题经 lockfile 中记录的 **codeload tarball URL** 拉取，**CI 无需 SSH**；故 **`pnpm-lock.yaml` 必须提交**。
- 本地非 frozen 安装会重新解析 `git+ssh` 依赖，访问 github.com 可能偶发超时 —— 重试即可；推送 TLS 失败时可尝试本机代理（`HTTPS_PROXY`）。
