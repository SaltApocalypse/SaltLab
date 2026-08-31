import { theme as themeInfinite } from '@salta/theme-infinite/theme'
import { theme as themePapercut } from '@salta/theme-papercut/theme'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

/**
 * SaltLab 使用的 Dropdown 选项契约（跨主题统一）。
 */
export interface DropdownOption {
  value: string
  label: string
  /** 禁用该选项（置灰、不可选中） */
  disabled?: boolean
}

/**
 * SaltLab 使用的 Panel 跨主题契约。
 * 各主题包的 Panel 通过该契约提供窗体/ Dock 所需的可选布局 props（fill/tape/tilt 等）。
 */
export interface PanelProps {
  children?: ReactNode
  /** 附加类名（定位/尺寸/布局等） */
  className?: string
  /** 焦点/高亮态 */
  active?: boolean
  /** 占满父容器（宽高）；窗体等需要铺满的场景使用 */
  fill?: boolean
  /** 顶部胶带装饰（papercut 便利贴语义） */
  tape?: boolean
  /** 轻微贴歪（便利贴语义） */
  tilt?: boolean
  /** 黑色后层纸片 */
  layered?: boolean
  /** 强调：纸面染主色淡底 */
  highlight?: boolean
  /** 内边距档位 */
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

/**
 * SaltLab 使用的 LightButton 跨主题契约。
 * size 仅对支持尺寸档位的主题（papercut）生效；不支持的主题（infinite）会自动忽略该 prop。
 */
export interface LightButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode
  /** 尺寸档位（papercut 生效；infinite 忽略） */
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

/**
 * SaltLab 使用的 Alert（顶部 Toast）跨主题契约。
 * 两主题均已按此契约实现；variant 语义与 daisyUI alert 一致。
 */
export interface AlertProps {
  children?: ReactNode
  /** 附加类名 */
  className?: string
  /** 变体：info（默认）/ success / warning / error */
  variant?: 'info' | 'success' | 'warning' | 'error'
  /** 显示时长（ms）后自动淡化消失，缺省 2500 */
  duration?: number
  /** 淡出结束后回调（调用方据此卸载） */
  onClose?: () => void
}

/**
 * 主题能力：主题相关的设置项据此显隐/生效。
 */
export interface ThemeCapabilities {
  /** 支持日/夜间双模式（夜间时 data-theme 切换为 `${id}-dark`），如 papercut */
  dark: boolean
  /** 窗体遮罩（实色底）视觉效果可用，如 infinite */
  windowMask: boolean
}

/**
 * 主题注册表：应用层可用的主题集合。
 *
 * 约定（与 @salta/theme-xxx 统一出口一致）：
 *   - 每个主题包导出 { id, name, components: { 基础组件集 } }
 *   - 应用层可附加元信息（capabilities：该主题支持的能力，主题相关设置据此显隐）
 *   - 新增主题时在此登记，并在 src/index.css 中引入对应主题包的 CSS
 */
export const themes = {
  infinite: { ...themeInfinite, capabilities: { dark: false, windowMask: true } },
  papercut: { ...themePapercut, capabilities: { dark: true, windowMask: false } },
} as const

export type Theme = (typeof themes)[keyof typeof themes]
export type ThemeId = keyof typeof themes

export const DEFAULT_THEME_ID: ThemeId = 'infinite'
export const THEME_STORAGE_KEY = 'saltlab:theme'
export const DARK_STORAGE_KEY = 'saltlab:dark'

/** 从 localStorage 恢复主题选择；无记录或无效时回退到默认主题 */
export function getInitialThemeId(): ThemeId {
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  return stored && stored in themes ? (stored as ThemeId) : DEFAULT_THEME_ID
}

/** 从 localStorage 恢复夜间模式；默认关闭 */
export function getInitialDarkMode(): boolean {
  return localStorage.getItem(DARK_STORAGE_KEY) === '1'
}
