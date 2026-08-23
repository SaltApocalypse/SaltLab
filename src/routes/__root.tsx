import { createRootRoute, Outlet } from '@tanstack/react-router'
import { useTheme } from '../theme/ThemeProvider'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  const { theme } = useTheme()
  const Background = theme.components.ThemeBackground
  return (
    <>
      {/* 全局背景：来自当前主题（深色底 + 主色点阵），置于最底层（z-0，不拦截交互） */}
      <Background />
      <Outlet />
    </>
  )
}
