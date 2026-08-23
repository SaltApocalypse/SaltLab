import type { LucideIcon } from 'lucide-react'
import { useTheme } from '../theme/ThemeProvider'

export interface DockItem {
  id: string
  /** 显示名（同时用作 Tooltip 与 aria-label） */
  label: string
  icon: LucideIcon
  onClick: () => void
}

/**
 * Dock —— 项目专用底部 Dock 栏（基于主题基础组件 Panel + Button + Tooltip）
 *
 * 视觉/结构：
 *  - Panel 提供 [ ] 括号边框 + 深色半透明底；宽度由内容（按钮）决定（w-fit）
 *  - 按钮：方形、仅图标，单击触发行为；hover 时 Tooltip 提示
 *  - 固定在屏幕底部，留空隙（bottom-4）
 */
export function Dock({ items }: { items: DockItem[] }) {
  const { theme } = useTheme()
  const Panel = theme.components.Panel
  const Button = theme.components.Button
  const Tooltip = theme.components.Tooltip

  return (
    <div className="fixed bottom-4 left-1/2 z-[999] -translate-x-1/2">
      <Panel className="flex w-fit items-center gap-3 p-3!">
        {items.map((item) => (
          <Tooltip key={item.id} content={item.label}>
            <Button
              className="justify-center p-0"
              style={{ width: 48, height: 48 }}
              aria-label={item.label}
              onClick={item.onClick}
            >
              <item.icon size={22} strokeWidth={1.8} />
            </Button>
          </Tooltip>
        ))}
      </Panel>
    </div>
  )
}
