import { create } from 'zustand'
import { desktopIcons } from '../config/desktopIcons'
import {
  cellKey,
  cellOf,
  ICON_SLOT,
  nearestFreeCell,
  positionOf,
  STATUS_BAR_HEIGHT,
} from './grid'
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

/** 窗体最小尺寸（缩放下限 / 还原下限） */
export const MIN_WINDOW_SIZE: Size = { width: 280, height: 200 }

/** 最大化时与桌面四边的留白 */
export const MAXIMIZED_MARGIN = 8

/** 最小化挂起 TTL：最小化超过该时长后卸载窗口内容以释放 iframe 内存（恢复时重新加载） */
export const MINIMIZED_SUSPEND_TTL_MS = 3 * 60 * 1000

export interface WindowState {
  id: string
  title: string
  type: string
  position: Position
  size: Size
  zIndex: number
  /** 已最小化：窗口隐藏（display:none），桌面图标显示运行指示 */
  minimized: boolean
  /** 最小化时刻（用于超时挂起），非最小化时为 null */
  minimizedAt: number | null
  /** 已挂起：最小化超时后内容已卸载（释放 iframe/组件内存），窗口条目保留供图标指示与恢复 */
  suspended: boolean
  /** 已最大化：铺满桌面（留 MAXIMIZED_MARGIN 边距） */
  maximized: boolean
  /** 最大化前的几何，用于还原 */
  restoreBounds: { position: Position; size: Size } | null
}

// 最小化超时挂起定时器（窗口 id → timeout）
const suspendTimers = new Map<string, ReturnType<typeof setTimeout>>()

/** 清除某窗口的挂起定时器 */
function clearSuspendTimer(id: string) {
  const timer = suspendTimers.get(id)
  if (timer !== undefined) {
    clearTimeout(timer)
    suspendTimers.delete(id)
  }
}

/**
 * 不参与「最小化超时挂起」的窗口：音乐窗体由全局播放器的「暂停计时」负责释放，
 * 播放中不应因窗体最小化/关闭而被挂起。
 */
const NO_SUSPEND_WINDOW_TYPES: ReadonlySet<string> = new Set(['music'])

/** 安排某窗口在挂起 TTL 后自动挂起 */
function scheduleSuspend(id: string) {
  if (NO_SUSPEND_WINDOW_TYPES.has(id)) return
  clearSuspendTimer(id)
  suspendTimers.set(
    id,
    setTimeout(() => {
      suspendTimers.delete(id)
      useDesktopStore.getState().suspendWindow(id)
    }, MINIMIZED_SUSPEND_TTL_MS),
  )
}

/** 取未最小化窗口中 zIndex 最高者的 id（关闭/最小化焦点窗口后的焦点回落） */
function topVisibleWindowId(windows: WindowState[]): string | null {
  const top = windows
    .filter((win) => !win.minimized)
    .reduce<WindowState | null>(
      (acc, win) => (acc === null || win.zIndex > acc.zIndex ? win : acc),
      null,
    )
  return top?.id ?? null
}

/**
 * 窗口层级上限：必须低于状态栏(z-40)、右键菜单(z-50)与 Toast(z-100)，
 * 否则交互次数累积后窗口会盖住全局 UI（原 zCounter 无限增长的隐患）。
 */
const MAX_WINDOW_Z = 30

/** 当前最高窗口层级 */
function topZ(windows: WindowState[]): number {
  return windows.reduce((max, win) => Math.max(max, win.zIndex), 0)
}

/**
 * 将指定窗口置顶；若层级超过上限，则按当前顺序整体归一化为 1..N，
 * 保证窗口层级始终有界、不会越过全局 UI。
 */
function raiseWindow(windows: WindowState[], id: string): WindowState[] {
  const next = windows.map((win) => (win.id === id ? { ...win, zIndex: topZ(windows) + 1 } : win))
  if (topZ(next) <= MAX_WINDOW_Z) return next
  const order = [...next].sort((a, b) => a.zIndex - b.zIndex)
  const rank = new Map(order.map((win, index) => [win.id, index + 1]))
  return next.map((win) => {
    const zIndex = rank.get(win.id) ?? win.zIndex
    return win.zIndex === zIndex ? win : { ...win, zIndex }
  })
}

interface DesktopStore {
  icons: DesktopIconData[]
  windows: WindowState[]
  activeWindowId: string | null
  selectedIconId: string | null
  /** 窗体遮罩（实色底）模式，默认仅焦点 */
  windowMaskMode: WindowMaskMode
  openWindow: (type: string, title: string) => void
  closeWindow: (id: string) => void
  focusWindow: (id: string) => void
  /** 最小化：隐藏窗口；若为焦点窗口则焦点让给下一个可见窗口 */
  minimizeWindow: (id: string) => void
  /** 从最小化恢复（并聚焦）；若已挂起则重新挂载内容 */
  restoreWindow: (id: string) => void
  /** 挂起最小化窗口的内容（释放内存）；仅在仍处于最小化时生效 */
  suspendWindow: (id: string) => void
  /** 最大化 / 还原切换 */
  toggleMaximize: (id: string, bounds: Bounds) => void
  /** 取消最大化并定位到指定位置（拖拽最大化窗口标题栏时用，同 Windows 拖拽还原） */
  unmaximizeWindow: (id: string, position: Position) => void
  /** 所有窗口失去焦点（点击桌面空白处时） */
  blurWindows: () => void
  moveWindow: (id: string, position: Position) => void
  resizeWindow: (id: string, size: Size) => void
  moveIcon: (id: string, position: Position, bounds: Bounds) => void
  selectIcon: (id: string | null) => void
  setWindowMaskMode: (mode: WindowMaskMode) => void
  /** 恢复默认桌面布局（图标位置重置为配置默认） */
  resetIconPositions: () => void
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
  windowMaskMode: storedDesktop.windowMaskMode ?? 'focus',

  openWindow: (type, title) =>
    set((state) => {
      const existing = state.windows.find((win) => win.type === type)
      if (existing) {
        // 已存在则聚焦，并取消最小化/挂起（从桌面图标再次打开 = 恢复）
        clearSuspendTimer(existing.id)
        const windows = raiseWindow(
          state.windows.map((win) =>
            win.id === existing.id
              ? { ...win, minimized: false, minimizedAt: null, suspended: false }
              : win,
          ),
          existing.id,
        )
        return { activeWindowId: existing.id, windows }
      }

      const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1280
      const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800
      const size: Size = windowDefaultSize(type, viewportWidth, viewportHeight)
      const newWindow: WindowState = {
        id: type,
        title,
        type,
        position: initialWindowPosition(state.windows.length, size),
        size,
        zIndex: 0,
        minimized: false,
        minimizedAt: null,
        suspended: false,
        maximized: false,
        restoreBounds: null,
      }
      return {
        activeWindowId: newWindow.id,
        windows: raiseWindow([...state.windows, newWindow], newWindow.id),
      }
    }),

  closeWindow: (id) => {
    clearSuspendTimer(id)
    set((state) => {
      const windows = state.windows.filter((win) => win.id !== id)
      const activeWindowId =
        state.activeWindowId === id ? topVisibleWindowId(windows) : state.activeWindowId
      return { windows, activeWindowId }
    })
  },

  focusWindow: (id) =>
    set((state) => {
      if (state.activeWindowId === id) return state
      return { activeWindowId: id, windows: raiseWindow(state.windows, id) }
    }),

  minimizeWindow: (id) => {
    // 最小化后保持挂载（Window 内 display:none），3 分钟后自动挂起以释放内存
    scheduleSuspend(id)
    set((state) => {
      const windows = state.windows.map((win) =>
        win.id === id
          ? { ...win, minimized: true, minimizedAt: Date.now(), suspended: false }
          : win,
      )
      // 最小化的是焦点窗口时，焦点让给下一个可见（未最小化）的顶层窗口
      const activeWindowId =
        state.activeWindowId === id ? topVisibleWindowId(windows) : state.activeWindowId
      return { windows, activeWindowId }
    })
  },

  restoreWindow: (id) => {
    clearSuspendTimer(id)
    set((state) => {
      const windows = raiseWindow(
        state.windows.map((win) =>
          win.id === id ? { ...win, minimized: false, minimizedAt: null, suspended: false } : win,
        ),
        id,
      )
      return { activeWindowId: id, windows }
    })
  },

  suspendWindow: (id) =>
    set((state) => ({
      // 仅当仍处于最小化时才挂起（避免与恢复操作竞争）
      windows: state.windows.map((win) =>
        win.id === id && win.minimized ? { ...win, suspended: true } : win,
      ),
    })),

  toggleMaximize: (id, bounds) =>
    set((state) => {
      const windows = raiseWindow(
        state.windows.map((win) => {
          if (win.id !== id) return win
          if (win.maximized) {
            const restore = win.restoreBounds ?? { position: win.position, size: win.size }
            return {
              ...win,
              maximized: false,
              restoreBounds: null,
              position: restore.position,
              size: restore.size,
            }
          }
          return {
            ...win,
            minimized: false,
            minimizedAt: null,
            suspended: false,
            maximized: true,
            restoreBounds: { position: win.position, size: win.size },
            // 顶部避开状态栏：状态栏位于窗体之上（z-40），否则会遮住最大化窗体的标题栏
            position: { x: MAXIMIZED_MARGIN, y: STATUS_BAR_HEIGHT + MAXIMIZED_MARGIN },
            size: {
              width: Math.max(MIN_WINDOW_SIZE.width, bounds.width - MAXIMIZED_MARGIN * 2),
              height: Math.max(
                MIN_WINDOW_SIZE.height,
                bounds.height - STATUS_BAR_HEIGHT - MAXIMIZED_MARGIN * 2,
              ),
            },
          }
        }),
        id,
      )
      return { activeWindowId: id, windows }
    }),

  unmaximizeWindow: (id, position) =>
    set((state) => {
      const windows = raiseWindow(
        state.windows.map((win) => {
          if (win.id !== id) return win
          const restore = win.restoreBounds
          return {
            ...win,
            maximized: false,
            restoreBounds: null,
            position,
            size: restore?.size ?? win.size,
          }
        }),
        id,
      )
      return { activeWindowId: id, windows }
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
