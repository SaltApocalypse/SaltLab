import type { ComponentType } from 'react'
import { useTheme } from '../theme/ThemeProvider'
import type { AlertProps } from '../theme/themes'
import { useAlertStore } from './alertStore'

/**
 * AlertHost —— 全局 Toast 宿主
 *
 * 挂载于应用根部（__root），与窗口/普通组件解耦：
 * 关闭触发提示的窗口不会卸载提示，提示按自身 duration 正常淡出。
 * 主题 Alert 自身为 fixed 视口顶部（z-[100]），无需额外定位。
 */
export function AlertHost() {
  const { theme } = useTheme()
  const Alert = theme.components.Alert as unknown as ComponentType<AlertProps>
  const alert = useAlertStore((state) => state.alert)
  const dismissAlert = useAlertStore((state) => state.dismissAlert)

  if (!alert) return null

  return (
    <Alert key={alert.id} variant={alert.variant} onClose={dismissAlert}>
      {alert.message}
    </Alert>
  )
}
