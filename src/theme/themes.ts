import { theme as themeInfinite } from '@salta/theme-infinite/theme'

/**
 * 主题注册表：应用层可用的主题集合。
 *
 * 约定（与 @salta/theme-xxx 统一出口一致）：
 *   - 每个主题包导出 { id, name, components: { 基础组件集 } }
 *   - 新增主题时在此登记，并在 src/index.css 中引入对应主题包的 CSS
 */
export const themes = {
  infinite: themeInfinite,
} as const

export type Theme = (typeof themes)[keyof typeof themes]
export type ThemeId = keyof typeof themes

export const DEFAULT_THEME_ID: ThemeId = 'infinite'
export const THEME_STORAGE_KEY = 'saltlab:theme'

/** 从 localStorage 恢复主题选择；无记录或无效时回退到默认主题 */
export function getInitialThemeId(): ThemeId {
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  return stored && stored in themes ? (stored as ThemeId) : DEFAULT_THEME_ID
}
