import { create } from 'zustand'
import { desktopIcons } from '../config/desktopIcons'
import { cellKey, cellOf, ICON_SLOT, nearestFreeCell, positionOf } from './grid'
import type { Bounds, DesktopIconData, Position, Size, WindowMaskMode } from './types'

/** 桌面持久化存储键：保存设置（窗体遮罩）与图标位置 */
const STORAGE_KEY = 'saltlab.desktop'

interface StoredDesktop {
  windowMaskMode?: WindowMaskMode
  iconPositions?: Record<string, Position>
}

/** 读取持久化的桌面设置与图标位置（容错解析） */
function loadStoredDesktop(): StoredDesktop {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Partial<StoredDesktop>
    const windowMaskMode =
      parsed.windowMaskMode === 'focus' ||
      parsed.windowMaskMode === 'all' ||
      parsed.windowMaskMode === 'off'
        ? parsed.windowMaskMode
        : undefined
    const iconPositions =
      parsed.iconPositions && typeof parsed.iconPositions === 'object'
        ? (parsed.iconPositions as Record<string, Position>)
        : undefined
    return { windowMaskMode, iconPositions }
  } catch {
    return {}
  }
}

const storedDesktop = loadStoredDesktop()

// 图标初始位置：优先持久化的位置，否则使用配置默认
const initialIcons: DesktopIconData[] = desktopIcons.map((icon) => {
  const stored = storedDesktop.iconPositions?.[icon.id]
  return stored ? { ...icon, position: stored } : icon
})

export interface WindowState {
  id: string
  title: string
  type: string
  position: Position
  size: Size
  zIndex: number
}

interface DesktopStore {
  icons: DesktopIconData[]
  windows: WindowState[]
  activeWindowId: string | null
  selectedIconId: string | null
  zCounter: number
  /** 窗体遮罩（实色底）模式，默认仅焦点 */
  windowMaskMode: WindowMaskMode
  openWindow: (type: string, title: string) => void
  closeWindow: (id: string) => void
  focusWindow: (id: string) => void
  /** 所有窗口失去焦点（点击桌面空白处时） */
  blurWindows: () => void
  moveWindow: (id: string, position: Position) => void
  resizeWindow: (id: string, size: Size) => void
  moveIcon: (id: string, position: Position, bounds: Bounds) => void
  selectIcon: (id: string | null) => void
  setWindowMaskMode: (mode: WindowMaskMode) => void
  /** 恢复默认桌面布局（图标位置重置为配置默认） */
  resetIconPositions: () => void
  fitIcons: (bounds: Bounds) => void
}

const DEFAULT_WINDOW_SIZE: Size = { width: 560, height: 400 }

// 沉浸式窗口类型：默认尺寸 = 视口四边各收缩一个图标网格距离（ICON_SLOT）
const IMMERSIVE_WINDOW_TYPES: ReadonlySet<string> = new Set(['past', 'itg', 'teririBlocks'])

/** 按窗口类型计算默认尺寸；沉浸式窗口贴近全屏，其余使用标准尺寸 */
function windowDefaultSize(type: string, viewportWidth: number, viewportHeight: number): Size {
  if (IMMERSIVE_WINDOW_TYPES.has(type)) {
    return {
      width: Math.max(280, viewportWidth - ICON_SLOT * 2),
      height: Math.max(200, viewportHeight - ICON_SLOT * 2),
    }
  }
  return {
    width: Math.min(DEFAULT_WINDOW_SIZE.width, viewportWidth - 16),
    height: Math.min(DEFAULT_WINDOW_SIZE.height, viewportHeight - 16),
  }
}

function initialWindowPosition(openCount: number, size: Size): Position {
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1280
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800
  const offset = (openCount % 5) * 28
  const x = Math.min(64 + offset, Math.max(0, viewportWidth - size.width - 16))
  const y = Math.min(48 + offset, Math.max(0, viewportHeight - size.height - 16))
  return { x, y }
}

export const useDesktopStore = create<DesktopStore>((set) => ({
  icons: initialIcons,
  windows: [],
  activeWindowId: null,
  selectedIconId: null,
  zCounter: 0,
  windowMaskMode: storedDesktop.windowMaskMode ?? 'focus',

  openWindow: (type, title) =>
    set((state) => {
      const existing = state.windows.find((win) => win.type === type)
      if (existing) {
        const zIndex = state.zCounter + 1
        return {
          zCounter: zIndex,
          activeWindowId: existing.id,
          windows: state.windows.map((win) =>
            win.id === existing.id ? { ...win, zIndex } : win,
          ),
        }
      }

      const zIndex = state.zCounter + 1
      const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1280
      const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800
      const size: Size = windowDefaultSize(type, viewportWidth, viewportHeight)
      const newWindow: WindowState = {
        id: type,
        title,
        type,
        position: initialWindowPosition(state.windows.length, size),
        size,
        zIndex,
      }
      return {
        zCounter: zIndex,
        activeWindowId: newWindow.id,
        windows: [...state.windows, newWindow],
      }
    }),

  closeWindow: (id) =>
    set((state) => {
      const windows = state.windows.filter((win) => win.id !== id)
      const activeWindowId =
        state.activeWindowId === id ? (windows.at(-1)?.id ?? null) : state.activeWindowId
      return { windows, activeWindowId }
    }),

  focusWindow: (id) =>
    set((state) => {
      if (state.activeWindowId === id) return state
      const zIndex = state.zCounter + 1
      return {
        zCounter: zIndex,
        activeWindowId: id,
        windows: state.windows.map((win) => (win.id === id ? { ...win, zIndex } : win)),
      }
    }),

  blurWindows: () => set({ activeWindowId: null }),

  moveWindow: (id, position) =>
    set((state) => ({
      windows: state.windows.map((win) => (win.id === id ? { ...win, position } : win)),
    })),

  resizeWindow: (id, size) =>
    set((state) => ({
      windows: state.windows.map((win) => (win.id === id ? { ...win, size } : win)),
    })),

  moveIcon: (id, position, bounds) =>
    set((state) => {
      // 目标格被其他图标占用时，就近放入最近的空闲格（避免多个图标同格）
      const targetCell = cellOf(position.x, position.y, bounds)
      const occupied = new Set(
        state.icons
          .filter((icon) => icon.id !== id)
          .map((icon) => cellKey(cellOf(icon.position.x, icon.position.y, bounds))),
      )
      const cell = occupied.has(cellKey(targetCell))
        ? nearestFreeCell(targetCell, occupied, bounds)
        : targetCell
      return {
        icons: state.icons.map((icon) =>
          icon.id === id ? { ...icon, position: positionOf(cell) } : icon,
        ),
      }
    }),

  selectIcon: (id) => set({ selectedIconId: id }),

  setWindowMaskMode: (mode) => set({ windowMaskMode: mode }),

  resetIconPositions: () =>
    set((state) => ({
      icons: state.icons.map((icon) => {
        const def = desktopIcons.find((item) => item.id === icon.id)
        return def ? { ...icon, position: def.position } : icon
      }),
    })),

  fitIcons: (bounds) =>
    set((state) => {
      // 窗口尺寸变化后重新贴格；按序处理，碰撞时就近找空闲格
      const occupied = new Set<string>()
      const icons = state.icons.map((icon) => {
        const targetCell = cellOf(icon.position.x, icon.position.y, bounds)
        const cell = occupied.has(cellKey(targetCell))
          ? nearestFreeCell(targetCell, occupied, bounds)
          : targetCell
        occupied.add(cellKey(cell))
        return { ...icon, position: positionOf(cell) }
      })
      return { icons }
    }),
}))

// 持久化：窗体遮罩设置与图标位置变化时写入 localStorage
useDesktopStore.subscribe((state) => {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        windowMaskMode: state.windowMaskMode,
        iconPositions: Object.fromEntries(state.icons.map((icon) => [icon.id, icon.position])),
      }),
    )
  } catch {
    // 存储失败静默忽略
  }
})
