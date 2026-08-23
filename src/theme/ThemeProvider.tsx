import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
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
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>(getInitialThemeId)

  // daisyUI 按 html[data-theme] 切换主题 token，切换即整体换肤
  useEffect(() => {
    document.documentElement.dataset.theme = themeId
  }, [themeId])

  const setTheme = useCallback((id: ThemeId) => {
    setThemeId(id)
    localStorage.setItem(THEME_STORAGE_KEY, id)
  }, [])

  const value = useMemo(
    () => ({ theme: themes[themeId], themeId, themes, setTheme }),
    [themeId, setTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme 必须在 <ThemeProvider> 内使用')
  return ctx
}
