import { useEffect, useRef, useState } from 'react'
import { DesktopBoundsContext } from './desktopContext'
import { DesktopIcons } from './DesktopIcon'
import { useDesktopStore } from './desktopStore'
import { WindowManager } from './WindowManager'
import { MiniCardHost } from './MiniCardHost'
import { StatusBar } from './StatusBar'
import { ContextMenu } from './ContextMenu'
import type { Bounds, Position } from './types'

// 右键菜单暂时关闭（模块保留，后续改造）：置为 true 即可恢复
const CONTEXT_MENU_ENABLED = false

export function Desktop() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [bounds, setBounds] = useState<Bounds>({ width: 0, height: 0 })
  const [menu, setMenu] = useState<Position | null>(null)
  const selectIcon = useDesktopStore((state) => state.selectIcon)
  const blurWindows = useDesktopStore((state) => state.blurWindows)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => setBounds({ width: el.clientWidth, height: el.clientHeight })
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

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
          if (CONTEXT_MENU_ENABLED) {
            setMenu({ x: event.clientX, y: event.clientY })
          }
        }}
      >
        <StatusBar />
        <DesktopIcons />
        <WindowManager />
        <MiniCardHost />
        {CONTEXT_MENU_ENABLED && menu && <ContextMenu position={menu} onClose={() => setMenu(null)} />}
      </div>
    </DesktopBoundsContext.Provider>
  )
}
