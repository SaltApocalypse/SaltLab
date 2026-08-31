import { Power, Settings } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface DockItemData {
  id: string
  /** 标题 i18n key（Tooltip / aria-label 用） */
  titleKey: string
  icon: LucideIcon
  type: 'window' | 'route' | 'shutdown'
  target: string
}

/** Dock 栏配置：window=打开窗口，route=路由跳转，shutdown=关闭当前网页 */
export const dockItems: DockItemData[] = [
  { id: 'shutdown', titleKey: 'dock.shutdown', icon: Power, type: 'shutdown', target: '' },
  { id: 'settings', titleKey: 'dock.settings', icon: Settings, type: 'window', target: 'settings' },
]
