# SaltLab

以桌面环境（Desktop Environment）为形态的个人博客，部署到 **https://www.salta.top/**。

桌面是一个 React 桌面环境：可拖拽/双击的桌面图标、可移动/聚焦/关闭的窗口、底部 Dock、右键菜单；视觉与组件均来自主题包（`@salta/theme-infinite`），支持主题切换。

## 技术栈

React 19 · Vite 8 · TypeScript · TanStack Router · Tailwind CSS v4 · DaisyUI 5 · Lucide React · Motion · Zustand · i18next · pnpm

## 特性

- **桌面**：网格对齐、图标拖拽防碰撞吸附、单击选中 / 双击打开、窗口拖动与聚焦（zIndex）、Esc 关闭焦点窗口
- **主题化**：主题注册表 + `ThemeProvider`（`html[data-theme]` 整体换肤）、全局点阵背景；基础组件均来自主题包（Panel / Button / LightButton / Dropdown / Tooltip / ThemeBackground 等）
- **窗口**：基于主题 Panel 的窗体（`[ ]` 括号边框、焦点内嵌描边）、窗体遮罩（仅焦点/全部/关）、外部站点窗口（iframe 加载 spin + 淡入，标题栏 ↗ 新标签页入口）
- **内容**：SaltLab（ITG 项目入口）、设置（主题 / 语言 / 窗体遮罩）、To-Do、旧日（旧博客 iframe）、ITG（iframe）
- **i18n**：中英双语（i18next），localStorage 持久化语言
- **持久化**：主题 / 语言 / 窗体遮罩 / 图标位置

## 目录结构

```text
SaltLab/
├── src/
│   ├── config/          # 图标 / Dock / 窗口图标与外部 URL 配置
│   ├── content/         # 窗口内容组件与注册表
│   ├── desktop/         # 桌面系统（Desktop / Window / Dock / ContextMenu / store / grid）
│   ├── hooks/           # 通用 hooks（usePointerDrag）
│   ├── i18n/            # i18next 初始化与语言包
│   ├── routes/          # TanStack Router 路由
│   └── theme/           # 主题注册表与 ThemeProvider
├── vite.config.ts       # base: '/'（自定义域根路径）
└── index.css            # Tailwind + DaisyUI + @salta/theme-infinite
```

## 主题系统

主题由独立的 `@salta/theme-xxx` 包提供（当前为 `@salta/theme-infinite`）。每个主题包导出统一结构：

```ts
{ id, name, components: { Button, LightButton, Dropdown, Input, Slider, Sidebar, Toggle, Tooltip, Panel, ThemeBackground } }
```

在 `src/theme/themes.ts` 注册即可加入切换列表（设置窗口 / 桌面右键菜单），`ThemeProvider` 负责 `data-theme` 切换与持久化。

## 开发

```bash
pnpm install   # 安装依赖
pnpm dev       # 本地开发
pnpm build     # 生成路由树 + 类型检查 + 构建
pnpm lint      # oxlint
```
