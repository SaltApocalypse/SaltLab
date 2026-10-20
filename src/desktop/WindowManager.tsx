import { memo, useEffect } from 'react'
import { useDesktopStore } from './desktopStore'
import type { WindowState } from './desktopStore'
import { Window } from './Window'
import { windowContents } from '../content/windowContentRegistry'

/**
 * 窗口槽（memo 化）：store 更新时仅被操作窗口的对象引用改变，其余窗口 win 引用稳定，
 * 因此只有受影响的窗口会重渲染，避免隐藏/未变化窗口的无效协调。
 * 挂起（suspended）的窗口不渲染内容，仅保留 store 条目供桌面图标指示与恢复。
 */
const WindowSlot = memo(function WindowSlot({ win }: { win: WindowState }) {
  if (win.suspended) return null
  const Content = windowContents[win.type]
  return <Window window={win}>{Content ? <Content /> : null}</Window>
})

export function WindowManager() {
  const windows = useDesktopStore((state) => state.windows)
  const activeWindowId = useDesktopStore((state) => state.activeWindowId)
  const closeWindow = useDesktopStore((state) => state.closeWindow)

  // Esc 关闭当前焦点窗口
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && activeWindowId) {
        closeWindow(activeWindowId)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeWindowId, closeWindow])

  return (
    <>
      {windows.map((win) => (
        <WindowSlot key={win.id} win={win} />
      ))}
    </>
  )
}
