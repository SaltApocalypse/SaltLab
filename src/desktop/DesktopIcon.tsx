import { useNavigate } from '@tanstack/react-router'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../theme/ThemeProvider'
import { usePointerDrag } from '../hooks/usePointerDrag'
import { useDesktopBounds } from './desktopContext'
import { useDesktopStore } from './desktopStore'
import { clampToBounds, ICON_HEIGHT, ICON_WIDTH } from './grid'
import type { DesktopIconData, Position } from './types'

const DRAG_THRESHOLD = 6
const DOUBLE_CLICK_MS = 300

/**
 * DesktopIcon —— 项目专用桌面图标组件
 *
 * 交互：
 *  - 拖拽：吸附网格移动图标（位移 > DRAG_THRESHOLD 视为拖拽）
 *  - 单击：选中（高亮 primary）
 *  - 双击：执行原有打开功能（window/route/url）
 * 视觉：图标放在当前主题的 LightButton 内，标题居中于下方；主题化（随主题切换）
 */
export function DesktopIcon({ icon }: { icon: DesktopIconData }) {
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
  const [preview, setPreview] = useState<Position>(icon.position)
  const originRef = useRef<Position>(icon.position)
  const lastClickRef = useRef(0)

  const isSelected = selectedIconId === icon.id
  const isOpen = icon.type === 'window' && windows.some((win) => win.type === icon.target)
  const highlighted = isSelected || isOpen

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
      setDragging(true)
      originRef.current = icon.position
      setPreview(icon.position)
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

  const position = dragging ? preview : icon.position

  return (
    <div
      className="absolute flex cursor-pointer touch-none select-none flex-col items-center gap-1"
      style={{ left: position.x, top: position.y, width: ICON_WIDTH, height: ICON_HEIGHT }}
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
        className={`max-w-full truncate rounded px-1 text-xs ${
          highlighted ? 'text-primary' : 'text-base-content'
        }`}
      >
        {label}
      </span>
    </div>
  )
}

export function DesktopIcons() {
  const icons = useDesktopStore((state) => state.icons)
  return (
    <>
      {icons.map((icon) => (
        <DesktopIcon key={icon.id} icon={icon} />
      ))}
    </>
  )
}
