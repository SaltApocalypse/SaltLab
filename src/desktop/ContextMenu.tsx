import { useEffect, useRef } from 'react'
import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../theme/ThemeProvider'
import type { ThemeId } from '../theme/themes'
import type { Position } from './types'

const MENU_WIDTH = 176

interface ContextMenuProps {
  position: Position
  onClose: () => void
}

/** 桌面右键菜单：目前仅主题切换（后续可扩展桌面操作项） */
export function ContextMenu({ position, onClose }: ContextMenuProps) {
  const { t } = useTranslation()
  const { themes, themeId, setTheme } = useTheme()
  const ref = useRef<HTMLDivElement>(null)

  // 点击菜单外 / Escape / 视口变化时关闭
  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) onClose()
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    const onViewportChange = () => onClose()
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('resize', onViewportChange)
    window.addEventListener('scroll', onViewportChange, true)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('resize', onViewportChange)
      window.removeEventListener('scroll', onViewportChange, true)
    }
  }, [onClose])

  const left = Math.min(position.x, window.innerWidth - MENU_WIDTH - 8)
  const top = Math.min(position.y, window.innerHeight - 96)

  const themeIds = Object.keys(themes) as ThemeId[]

  return (
    <div
      ref={ref}
      className="absolute z-50 w-44 bg-base-100 py-1 shadow-lg ring-1 ring-base-300"
      style={{ left, top }}
      onContextMenu={(event) => event.preventDefault()}
    >
      <div className="px-3 py-1 text-xs uppercase tracking-widest text-base-content/60">
        {t('context.theme')}
      </div>
      {themeIds.map((id) => (
        <button
          key={id}
          type="button"
          className="flex w-full items-center justify-between px-3 py-1.5 text-left text-sm text-base-content transition-colors duration-300 hover:bg-primary/10"
          onClick={() => {
            setTheme(id)
            onClose()
          }}
        >
          <span>{themes[id].name}</span>
          {id === themeId && <Check size={14} className="text-primary" />}
        </button>
      ))}
    </div>
  )
}
