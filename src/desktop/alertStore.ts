import { create } from 'zustand'

export type AlertVariant = 'info' | 'success' | 'warning' | 'error'

interface AlertState {
  /** 当前全局提示（null 表示无）；id 用于强制重挂载以重置动画/计时 */
  alert: { id: number; message: string; variant: AlertVariant } | null
  /** 显示一条全局提示 */
  showAlert: (message: string, variant?: AlertVariant) => void
  /** 关闭当前提示（Alert 淡出结束后调用） */
  dismissAlert: () => void
}

let alertId = 0

/**
 * 全局 Toast 状态：与具体窗口/组件解耦。
 * 提示由根部 <AlertHost /> 渲染，窗体关闭不会中断提示。
 */
export const useAlertStore = create<AlertState>((set) => ({
  alert: null,
  showAlert: (message, variant = 'info') =>
    set({ alert: { id: (alertId += 1), message, variant } }),
  dismissAlert: () => set({ alert: null }),
}))
