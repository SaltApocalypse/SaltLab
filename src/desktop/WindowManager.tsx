import { useEffect } from 'react'
import { useDesktopStore } from './desktopStore'
import { Window } from './Window'
import { windowContents } from '../content/windowContentRegistry'

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
      {windows.map((win) => {
        const Content = windowContents[win.type]
        return (
          <Window key={win.id} window={win}>
            {Content ? <Content /> : null}
          </Window>
        )
      })}
    </>
  )
}
