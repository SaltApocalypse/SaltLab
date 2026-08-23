import { useRef } from 'react'
import { SquareArrowOutUpRight, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { windowExternalUrls } from '../config/windowExternalUrls'
import { windowIcons } from '../config/windowIcons'
import { useTheme } from '../theme/ThemeProvider'
import { usePointerDrag } from '../hooks/usePointerDrag'
import { useDesktopBounds } from './desktopContext'
import { useDesktopStore } from './desktopStore'
import type { WindowState } from './desktopStore'
import { clampToBounds } from './grid'

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
  const Panel = theme.components.Panel
  const CloseButton = theme.components.LightButton
  // 标题按窗口类型实时取翻译（语言切换时已打开窗口同步更新），未知类型回退到存储标题
  const title = t(`windows.${win.type}`, { defaultValue: win.title })
  const activeWindowId = useDesktopStore((state) => state.activeWindowId)
  const focusWindow = useDesktopStore((state) => state.focusWindow)
  const closeWindow = useDesktopStore((state) => state.closeWindow)
  const moveWindow = useDesktopStore((state) => state.moveWindow)
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
        className={`flex h-full flex-col ${masked ? 'bg-base-200!' : ''}`}
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
                className="justify-center px-2"
                aria-label={t('window.openExternal')}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => window.open(externalUrl, '_blank', 'noopener,noreferrer')}
              >
                <SquareArrowOutUpRight size={14} />
              </CloseButton>
            )}
            <CloseButton
              className="justify-center px-2"
              aria-label={t('window.close')}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => closeWindow(win.id)}
            >
              <X size={14} />
            </CloseButton>
          </span>
        </div>

        {/* 分隔线 + 内容区：flex 填充剩余空间，带最低高度（标题栏分隔线保持通栏 w-full） */}
        <div className="my-3 h-px w-full bg-base-300" />
        <div className="no-scrollbar min-h-40 min-w-0 flex-1 overflow-auto">{children}</div>
      </Panel>
    </div>
  )
}
