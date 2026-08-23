import type { LucideIcon } from 'lucide-react'

export interface Position {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export interface Bounds {
  width: number
  height: number
}

export type IconType = 'window' | 'route' | 'url'

/** 窗体遮罩模式：focus=仅焦点窗口实色底，all=全部实色底，off=关闭（半透明底） */
export type WindowMaskMode = 'focus' | 'all' | 'off'

export interface DesktopIconData {
  id: string
  /** 标题 i18n key */
  titleKey: string
  icon: LucideIcon
  type: IconType
  target: string
  position: Position
}
