import { useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { dockItems } from '../config/dockItems'
import { DesktopBoundsContext } from './desktopContext'
import { DesktopIcons } from './DesktopIcon'
import { useDesktopStore } from './desktopStore'
import { WindowManager } from './WindowManager'
import { ContextMenu } from './ContextMenu'
import { Dock } from './Dock'
import type { DockItem } from './Dock'
import type { Bounds, Position } from './types'

export function Desktop() {
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)
  const [bounds, setBounds] = useState<Bounds>({ width: 0, height: 0 })
  const [menu, setMenu] = useState<Position | null>(null)
  const fitIcons = useDesktopStore((state) => state.fitIcons)
  const selectIcon = useDesktopStore((state) => state.selectIcon)
  const blurWindows = useDesktopStore((state) => state.blurWindows)
  const openWindow = useDesktopStore((state) => state.openWindow)
  const navigate = useNavigate()

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => setBounds({ width: el.clientWidth, height: el.clientHeight })
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (bounds.width > 0 && bounds.height > 0) fitIcons(bounds)
  }, [bounds, fitIcons])

  // Dock 项：单击触发行为（window=打开窗口，route=路由跳转）
  const dock: DockItem[] = dockItems.map((item) => ({
    id: item.id,
    label: t(item.titleKey),
    icon: item.icon,
    onClick: () => {
      if (item.type === 'route') {
        navigate({ to: item.target })
      } else {
        openWindow(item.target, t(item.titleKey))
      }
    },
  }))

  return (
    <DesktopBoundsContext.Provider value={bounds}>
      <div
        ref={containerRef}
        className="relative h-dvh w-full overflow-hidden"
        onPointerDown={(event) => {
          // 点击桌面空白处：取消图标选中，且所有窗口失去焦点
          if (event.target === event.currentTarget) {
            selectIcon(null)
            blurWindows()
          }
        }}
        onContextMenu={(event) => {
          event.preventDefault()
          setMenu({ x: event.clientX, y: event.clientY })
        }}
      >
        <DesktopIcons />
        <WindowManager />
        <Dock items={dock} />
        {menu && <ContextMenu position={menu} onClose={() => setMenu(null)} />}
      </div>
    </DesktopBoundsContext.Provider>
  )
}
