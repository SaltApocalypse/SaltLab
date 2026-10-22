# SaltLab

以桌面环境（Desktop Environment）为形态的个人博客，部署在 **https://www.salta.top/**。

打开页面即可看到一个小型桌面：桌面图标、可拖拽/缩放/最小化的窗口、顶部状态栏、右上角迷你卡片，以及可切换的双主题。内容以窗口形式呈现——项目、游戏、音乐、设置与旧博客。

## 技术栈

React 19 · Vite 8 · TypeScript · TanStack Router · Tailwind CSS v4 · daisyUI 5 · Zustand · i18next · Lucide React · pnpm

## 功能

- **桌面**：图标网格（窄屏自动折行且不重叠）、单击选中 / 双击打开、拖拽吸附、窗口聚焦与 z-index 管理、Esc 关闭焦点窗口
- **窗口**：基于主题 `Panel` 的窗体；最小化 / 最大化·还原 / 关闭；标题栏拖拽（最大化时拖拽可还原，同 Windows）；右下角缩放；外部站点 iframe 窗口
- **状态栏**：品牌 logo（hover 渐变为电源图标，点击关闭页面）+ `SaltLab`（hover 展示 Aura 边框光，主题色 ↔ 全息循环）+ 设置入口 + 随语言切换的日期/时间（hover 展开完整格式）
- **主题**：`@salta/theme-infinite`（深色科技）与 `@salta/theme-papercut`（纸刻，含夜间模式）；组件与配色均来自主题包
- **迷你卡片**：桌面右上角可复用的信息卡片（与窗体风格一致、自上而下排列）；音乐卡片随播放出现，支持进度、音量、上一首/播放暂停/下一首；关闭卡片只暂停音乐，不影响窗体
- **音乐**：全局单例播放器（关闭窗体后继续播放，暂停 3 分钟后释放音频流）；静态 Apple Music 歌单（30s Preview）；进度拖动、音量调节（滑钮 Tooltip）、静音、结束后自动下一首、播放失败/无 Preview 状态
- **游戏**：特日日方块（Teriri Blocks）等
- **i18n**：中 / 英双语，浏览器语言自动识别，localStorage 持久化
- **持久化**：主题 / 夜间模式 / 语言 / 图标位置 / 窗体遮罩

## 目录结构

```text
SaltLab/
├── src/
│   ├── config/      # 图标、窗口图标/外部 URL、CDN 基址
│   ├── content/     # 窗口内容组件 + 注册表
│   ├── data/        # 音乐数据模型与静态歌单
│   ├── desktop/     # 桌面系统：Desktop / Window / 图标 / 状态栏 / 迷你卡片 / stores / grid
│   ├── hooks/       # usePointerDrag、useClock
│   ├── i18n/        # i18next 初始化与语言包
│   ├── routes/      # TanStack Router 路由
│   └── theme/       # 主题注册表与 ThemeProvider
├── scripts/         # update-music-playlist.mjs
├── public/          # favicon、图标、静态资源
├── index.html
└── src/index.css    # Tailwind + daisyUI + 主题 + 动画 token
```

## 开发

```bash
pnpm install   # 安装依赖
pnpm dev       # 本地开发（Vite）
pnpm build     # 生成路由树 + 类型检查 + 构建
pnpm lint      # oxlint
```

> 首次克隆后 `src/routeTree.gen.ts` 尚未生成，直接 `tsc` / `build` 会失败；`pnpm build` 会先执行 `pnpm generate`，开发时 `pnpm dev` 也会生成。

## 音乐数据

歌单来自 `src/data/music-playlist.json`（由公开 Apple Music 歌单解析，并用 iTunes Lookup 补齐 30s Preview 生成），运行时**不请求任何 API**。

更新歌单：

```bash
pnpm music:update                       # 默认更新当前歌单
pnpm music:update "https://music.apple.com/cn/playlist/pl.xxxx"
pnpm build
```

- 仅支持公开分享的 `pl.` 链接；资料库 `/library/playlist/p.` 需要 MusicKit 授权，脚本无法读取。
- `previewUrl` 为 Apple 提供的 30 秒试听；没有 Preview 的曲目在 UI 中显示为「无 Preview」。
- 脚本只在开发者本机联网运行，产物是静态 JSON。

## 主题系统

主题是独立的 npm 包（git 依赖）：

- `@salta/theme-infinite`
- `@salta/theme-papercut`（含 `papercut-dark`）

每个主题导出统一结构 `{ id, name, components }`，组件经 `theme.components.*` 使用；跨主题 props 契约在 `src/theme/themes.ts`。

**新增主题**需：① 添加 git 依赖并提交 `pnpm-lock.yaml`；② 在 `src/theme/themes.ts` 注册（含 `capabilities`）；③ 在 `src/index.css` 添加 `@import` 与 `@source "../node_modules/@salta/theme-xxx/dist"`。

## 部署

推送 `main` 触发 `.github/workflows/deploy.yml`：`pnpm install --frozen-lockfile` → `pnpm build` → 上传 `dist` 到 GitHub Pages。CI 通过 lockfile 中的 codeload tarball 拉取主题，无需 SSH。

## 说明

- 图标插画、logo 等 CDN 资源通过 jsDelivr 加载（`src/config/cdn.ts`）。
- 更细的仓库约定与陷阱见 `AGENTS.md`。
