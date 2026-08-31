import { useRef } from 'react'
import { ExternalLink, X } from 'lucide-react'
import type { ComponentType, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { windowExternalUrls } from '../config/windowExternalUrls'
import { windowIcons } from '../config/windowIcons'
import { useTheme } from '../theme/ThemeProvider'
import type { LightButtonProps, PanelProps } from '../theme/themes'
import { usePointerDrag } from '../hooks/usePointerDrag'
import { useDesktopBounds } from './desktopContext'
import { useDesktopStore } from './desktopStore'
import type { WindowState } from './desktopStore'
import { clampToBounds } from './grid'
import type { Size } from './types'

/** 窗体最小尺寸（缩放下限） */
const MIN_WINDOW_SIZE: Size = { width: 280, height: 200 }

interface WindowProps {
  window: WindowState
  children: ReactNode
}

/**
 * Window —— 项目专用窗口组件（基于主题基础组件 Panel + LightButton 构建，可随主题切换）
 *
 * 结构（由 Panel 提供 [ ] 括号边框 + 深色半透明底）：
 *  - 顶部栏：左侧图标 + 窗口标题，右侧关闭按钮（主题 LightButton）
 *  - 内容区：flex 填充剩余空间，带最低高度（min-h-40），超出滚动
 * 交互：标题栏可拖拽移动窗口，点击窗口聚焦（zIndex 提升）
 */
export function Window({ window: win, children }: WindowProps) {
  const { t } = useTranslation()
  const { theme } = useTheme()
  // Panel / LightButton 跨主题契约：fill/tape/tilt 与 size 由共享 Props 提供（各主题包按需实现）
  const Panel = theme.components.Panel as unknown as ComponentType<PanelProps>
  const CloseButton = theme.components.LightButton as unknown as ComponentType<LightButtonProps>
  // 标题按窗口类型实时取翻译（语言切换时已打开窗口同步更新），未知类型回退到存储标题
  const title = t(`windows.${win.type}`, { defaultValue: win.title })
  const activeWindowId = useDesktopStore((state) => state.activeWindowId)
  const focusWindow = useDesktopStore((state) => state.focusWindow)
  const closeWindow = useDesktopStore((state) => state.closeWindow)
  const moveWindow = useDesktopStore((state) => state.moveWindow)
  const resizeWindow = useDesktopStore((state) => state.resizeWindow)
  const windowMaskMode = useDesktopStore((state) => state.windowMaskMode)
  const bounds = useDesktopBounds()
  const isActive = activeWindowId === win.id
  // 窗体遮罩：focus=仅焦点实色底，all=全部实色底，off=保持半透明
  const masked = windowMaskMode === 'all' || (windowMaskMode === 'focus' && isActive)
  const originRef = useRef(win.position)

  const size = {
    width: Math.min(win.size.width, Math.max(280, bounds.width - 16)),
    height: Math.min(win.size.height, Math.max(200, bounds.height - 16)),
  }

  const dragHandlers = usePointerDrag({
    onStart: () => {
      focusWindow(win.id)
      originRef.current = win.position
    },
    onMove: (_event, delta) => {
      moveWindow(
        win.id,
        clampToBounds(originRef.current.x + delta.x, originRef.current.y + delta.y, bounds, size),
      )
    },
  })

  // 尺寸调整：记录拖动起点尺寸，随 delta 缩放，并夹紧到最小尺寸与视口边界内
  const sizeRef = useRef(win.size)
  const resizeHandlers = usePointerDrag({
    onStart: () => {
      focusWindow(win.id)
      sizeRef.current = win.size
    },
    onMove: (_event, delta) => {
      const width = Math.min(
        Math.max(MIN_WINDOW_SIZE.width, sizeRef.current.width + delta.x),
        Math.max(MIN_WINDOW_SIZE.width, bounds.width - win.position.x),
      )
      const height = Math.min(
        Math.max(MIN_WINDOW_SIZE.height, sizeRef.current.height + delta.y),
        Math.max(MIN_WINDOW_SIZE.height, bounds.height - win.position.y),
      )
      resizeWindow(win.id, { width, height })
    },
  })

  const TitleIcon = windowIcons[win.type]
  // 外部网站窗体：标题栏提供「新标签页打开」入口
  const externalUrl = windowExternalUrls[win.type]

  return (
    <div
      className="absolute"
      style={{
        left: win.position.x,
        top: win.position.y,
        width: size.width,
        height: size.height,
        zIndex: win.zIndex,
      }}
      onPointerDown={() => focusWindow(win.id)}
    >
      <Panel
        active={isActive}
        fill
        tilt={false}
        className={`relative flex h-full flex-col ${masked ? 'bg-base-200!' : ''}`}
      >
        {/* 顶部栏：左侧图标 + 标题，右侧关闭按钮 */}
        <div
          className="flex cursor-move touch-none select-none items-center justify-between gap-2"
          {...dragHandlers}
        >
          <span className="flex min-w-0 items-center gap-2">
            {TitleIcon && <TitleIcon size={14} className="shrink-0" />}
            <span className="truncate text-sm font-medium">{title}</span>
          </span>
          {/* 右侧操作栏：外部网站入口 + 关闭 */}
          <span className="flex shrink-0 items-center gap-1">
            {externalUrl && (
              <CloseButton
                size="xs"
                className="justify-center px-2"
                aria-label={t('window.openExternal')}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => window.open(externalUrl, '_blank', 'noopener,noreferrer')}
              >
                <ExternalLink size={14} />
              </CloseButton>
            )}
            <CloseButton
              size="xs"
              className="justify-center px-2"
              aria-label={t('window.close')}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => closeWindow(win.id)}
            >
              <X size={14} />
            </CloseButton>
          </span>
        </div>

        {/* 分隔线 + 内容区：flex 填充剩余空间，带最低高度（标题栏分隔线保持通栏 w-full）
            pr-2 为右侧留出余量：避免 papercut 组件（按钮/下拉）的层叠装饰超出右缘被 overflow 裁切 */}
        <div className="my-3 h-px w-full bg-base-300" />
        <div className="no-scrollbar min-h-40 min-w-0 flex-1 overflow-auto pr-2">{children}</div>
      </Panel>
      {/* 右下角缩放手柄：斜纹装饰提示可拖拽缩放。
          置于窗口根节点（被缩放的本体）而非主题 Panel 内部，避免依赖主题 fill 结构导致的手柄错位/垂直失效 */}
      <span
        className="absolute bottom-0 right-0 z-10 flex h-6 w-6 cursor-nwse-resize touch-none select-none items-end justify-end p-1.5"
        {...resizeHandlers}
      >
        <svg viewBox="0 0 10 10" className="h-2.5 w-2.5" fill="none" aria-hidden="true">
          <path d="M10 0v10H0" stroke="currentColor" strokeWidth="1.4" opacity="0.6" className="text-base-content/60" />
          <path d="M10 5v5H5" stroke="currentColor" strokeWidth="1.4" opacity="0.35" className="text-base-content/35" />
        </svg>
      </span>
    </div>
  )
}
