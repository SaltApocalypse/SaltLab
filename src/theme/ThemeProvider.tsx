import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  DARK_STORAGE_KEY,
  getInitialDarkMode,
  getInitialThemeId,
  THEME_STORAGE_KEY,
  themes,
  type Theme,
  type ThemeId,
} from './themes'

interface ThemeContextValue {
  /** 当前主题（含其组件集） */
  theme: Theme
  themeId: ThemeId
  themes: Record<ThemeId, Theme>
  setTheme: (id: ThemeId) => void
  /** 夜间模式（仅对 capabilities.dark 的主题生效；data-theme 切换为 `${id}-dark`） */
  darkMode: boolean
  setDarkMode: (enabled: boolean) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>(getInitialThemeId)
  const [darkMode, setDarkModeState] = useState<boolean>(getInitialDarkMode)

  // daisyUI 按 html[data-theme] 切换主题 token：支持双模式的主题在夜间切到 `${id}-dark`
  useEffect(() => {
    const darkCapable = themes[themeId].capabilities.dark
    document.documentElement.dataset.theme = darkCapable && darkMode ? `${themeId}-dark` : themeId
  }, [themeId, darkMode])

  const setTheme = useCallback((id: ThemeId) => {
    setThemeId(id)
    localStorage.setItem(THEME_STORAGE_KEY, id)
  }, [])

  const setDarkMode = useCallback((enabled: boolean) => {
    setDarkModeState(enabled)
    localStorage.setItem(DARK_STORAGE_KEY, enabled ? '1' : '0')
  }, [])

  const value = useMemo(
    () => ({ theme: themes[themeId], themeId, themes, setTheme, darkMode, setDarkMode }),
    [themeId, darkMode, setTheme, setDarkMode],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme 必须在 <ThemeProvider> 内使用')
  return ctx
}
