import { useNavigate } from '@tanstack/react-router'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ExternalLink } from 'lucide-react'
import { useTheme } from '../theme/ThemeProvider'
import { usePointerDrag } from '../hooks/usePointerDrag'
import { useDesktopBounds } from './desktopContext'
import { useDesktopStore } from './desktopStore'
import { clampToBounds, ICON_HEIGHT, ICON_WIDTH, layoutIconPositions } from './grid'
import type { DesktopIconData, Position } from './types'

const DRAG_THRESHOLD = 6
const DOUBLE_CLICK_MS = 300

/**
 * DesktopIcon —— 项目专用桌面图标组件
 *
 * 交互：
 *  - 拖拽：吸附网格移动图标（位移 > DRAG_THRESHOLD 视为拖拽）
 *  - 单击：选中（高亮 primary）
 *  - 双击：执行原有打开功能（window/route/url）；窗口已存在则聚焦（最小化时恢复）
 * 视觉：图标放在当前主题的 LightButton 内，标题居中于下方；主题化（随主题切换）
 *  - 运行指示：对应窗口已打开时高亮 + 底部主色圆点；最小化时圆点脉冲提示「已加载」
 */
export function DesktopIcon({
  icon,
  position,
  index,
}: {
  icon: DesktopIconData
  position: Position
  /** 入场错峰序号 */
  index: number
}) {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const IconButton = theme.components.LightButton
  const label = t(icon.titleKey)
  const openWindow = useDesktopStore((state) => state.openWindow)
  const moveIcon = useDesktopStore((state) => state.moveIcon)
  const windows = useDesktopStore((state) => state.windows)
  const selectedIconId = useDesktopStore((state) => state.selectedIconId)
  const selectIcon = useDesktopStore((state) => state.selectIcon)
  const bounds = useDesktopBounds()
  const navigate = useNavigate()

  const [dragging, setDragging] = useState(false)
  const [preview, setPreview] = useState<Position>(position)
  const originRef = useRef<Position>(position)
  const lastClickRef = useRef(0)

  const isSelected = selectedIconId === icon.id
  // 运行态：对应窗口已打开（含最小化）；最小化时图标仍显示指示，提示「已加载」
  const runningWindow = icon.type === 'window' ? windows.find((win) => win.type === icon.target) : undefined
  const isRunning = runningWindow !== undefined
  const isMinimized = runningWindow?.minimized ?? false
  const highlighted = isSelected || isRunning

  const open = () => {
    if (icon.type === 'window') {
      openWindow(icon.target, label)
    } else if (icon.type === 'route') {
      navigate({ to: icon.target })
    } else if (icon.type === 'url') {
      window.open(icon.target, '_blank', 'noopener,noreferrer')
    }
  }

  const dragHandlers = usePointerDrag({
    onStart: () => {
      // 从当前显示位置开始拖拽（窄屏折行时显示位置可能与逻辑位置不同）
      setDragging(true)
      originRef.current = position
      setPreview(position)
    },
    onMove: (_event, delta) => {
      const next = clampToBounds(originRef.current.x + delta.x, originRef.current.y + delta.y, bounds, {
        width: ICON_WIDTH,
        height: ICON_HEIGHT,
      })
      setPreview(next)
    },
    onEnd: (_event, delta) => {
      const moved = Math.abs(delta.x) + Math.abs(delta.y)
      setDragging(false)
      if (moved > DRAG_THRESHOLD) {
        // 拖拽结束：吸附网格（含碰撞规避，由 store 统一处理），不触发点击
        lastClickRef.current = 0
        moveIcon(
          icon.id,
          { x: originRef.current.x + delta.x, y: originRef.current.y + delta.y },
          bounds,
        )
        return
      }
      // 单击选中，双击（间隔 DOUBLE_CLICK_MS 内第二次点击）执行
      const now = Date.now()
      if (now - lastClickRef.current < DOUBLE_CLICK_MS) {
        lastClickRef.current = 0
        open()
      } else {
        lastClickRef.current = now
        selectIcon(icon.id)
      }
    },
  })

  const renderPosition = dragging ? preview : position

  return (
    <div
      className={`absolute flex cursor-pointer touch-none select-none flex-col items-center gap-1 motion-safe:animate-icon-in motion-safe:transition-transform motion-safe:duration-200 ${
        dragging ? '' : 'motion-safe:hover:-translate-y-0.5'
      }`}
      style={{
        left: renderPosition.x,
        top: renderPosition.y,
        width: ICON_WIDTH,
        height: ICON_HEIGHT,
        // 入场错峰：每项延迟 40ms
        animationDelay: `${index * 40}ms`,
      }}
      {...dragHandlers}
      title={label}
    >
      <IconButton
        className={`h-14 w-14 justify-center p-0 ${
          highlighted ? 'bg-primary/15 text-primary ring-1 ring-primary' : ''
        }`}
        aria-label={label}
        aria-selected={isSelected}
      >
        <icon.icon size={28} strokeWidth={1.8} />
      </IconButton>
      <span
        className={`max-w-full break-words rounded px-1 text-center text-xs leading-tight ${
          highlighted ? 'text-primary' : 'text-base-content'
        }`}
      >
        {/* 运行指示：窗口已打开时在文本前显示主色圆点；最小化时脉冲提示「仍在运行」 */}
        {isRunning && (
          <span
            aria-hidden="true"
            className={`mr-1 inline-block h-1.5 w-1.5 rounded-full bg-primary align-middle ${
              isMinimized ? 'animate-pulse' : ''
            }`}
          />
        )}
        {label}
        {/* url 类型：文本右侧的 external-link 图标提示（新标签页打开） */}
        {icon.type === 'url' && <ExternalLink size={10} className="ml-0.5 inline-block" />}
      </span>
    </div>
  )
}

export function DesktopIcons() {
  const icons = useDesktopStore((state) => state.icons)
  const bounds = useDesktopBounds()
  // 仅计算显示位置（纯函数，不写回 store）：窄屏折行、恢复宽度后自动复原逻辑布局
  const displayPositions = layoutIconPositions(
    icons.map((icon) => icon.position),
    bounds,
  )
  return (
    <>
      {icons.map((icon, index) => (
        <DesktopIcon
          key={icon.id}
          icon={icon}
          position={displayPositions[index] ?? icon.position}
          index={index}
        />
      ))}
    </>
  )
}
