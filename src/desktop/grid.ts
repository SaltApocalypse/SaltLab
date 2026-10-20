import type { Bounds, Position, Size } from './types'

export const ICON_SLOT = 116
export const DESKTOP_PADDING = 24
export const ICON_WIDTH = 88
export const ICON_HEIGHT = 96

/** 顶部状态栏高度（与 StatusBar 组件保持一致） */
export const STATUS_BAR_HEIGHT = 40
/** 顶部留白：状态栏高度 + 与状态栏的间距（与左右留白 DESKTOP_PADDING 一致） */
export const DESKTOP_TOP_PADDING = STATUS_BAR_HEIGHT + DESKTOP_PADDING

export interface GridCell {
  col: number
  row: number
}

export function gridCell(col: number, row: number): Position {
  return {
    x: DESKTOP_PADDING + col * ICON_SLOT,
    y: DESKTOP_TOP_PADDING + row * ICON_SLOT,
  }
}

/** 桌面网格的列/行数 */
export function gridSize(bounds: Bounds): { cols: number; rows: number } {
  return {
    cols: Math.max(1, Math.floor((bounds.width - DESKTOP_PADDING * 2) / ICON_SLOT)),
    rows: Math.max(
      1,
      Math.floor((bounds.height - DESKTOP_TOP_PADDING - DESKTOP_PADDING) / ICON_SLOT),
    ),
  }
}

/** 坐标 → 最近的网格单元 */
export function cellOf(x: number, y: number, bounds: Bounds): GridCell {
  const { cols, rows } = gridSize(bounds)
  return {
    col: clamp(Math.round((x - DESKTOP_PADDING) / ICON_SLOT), 0, cols - 1),
    row: clamp(Math.round((y - DESKTOP_TOP_PADDING) / ICON_SLOT), 0, rows - 1),
  }
}

/** 网格单元 → 坐标 */
export function positionOf(cell: GridCell): Position {
  return gridCell(cell.col, cell.row)
}

export function cellKey(cell: GridCell): string {
  return `${cell.col},${cell.row}`
}

/**
 * 从 from 出发找最近的空闲单元（BFS，蛇形扩散），避免多个图标占用同一格。
 * 全部占满时回退到 from 本身。
 */
export function nearestFreeCell(from: GridCell, occupied: Set<string>, bounds: Bounds): GridCell {
  const { cols, rows } = gridSize(bounds)
  const inBounds = (col: number, row: number) => col >= 0 && col < cols && row >= 0 && row < rows
  const visited = new Set<string>()
  const queue: GridCell[] = [{ col: from.col, row: from.row }]
  const directions = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ] as const

  while (queue.length > 0) {
    const cell = queue.shift() as GridCell
    const key = cellKey(cell)
    if (visited.has(key)) continue
    visited.add(key)
    if (!occupied.has(key)) return cell
    for (const [dc, dr] of directions) {
      const next = { col: cell.col + dc, row: cell.row + dr }
      if (inBounds(next.col, next.row) && !visited.has(cellKey(next))) {
        queue.push(next)
      }
    }
  }
  return from
}

/**
 * 从 from 起按「行优先」向后查找第一个空闲单元（逐行：先右后下）。
 *
 * 与 nearestFreeCell 的区别：行数不足时向下扩展、绝不回退到已占用单元，
 * 用于 fitIcons 的自动重排——窄屏折行时保持图标的阅读顺序且不会重叠。
 */
export function firstFreeCell(from: GridCell, occupied: Set<string>, cols: number): GridCell {
  let col = from.col
  let row = from.row
  // 占用单元有限：最多扫描 occupied.size + 1 行必能遇到空闲单元
  const maxRow = from.row + occupied.size + 1
  while (row <= maxRow) {
    if (col >= cols) {
      col = 0
      row += 1
      continue
    }
    const cell = { col, row }
    if (!occupied.has(cellKey(cell))) return cell
    col += 1
  }
  return from
}

/**
 * 依据当前网格把一组「逻辑位置」映射为无重叠的显示位置（纯函数，不修改传入位置）。
 *
 * 窄屏时折行补位，宽屏恢复时自动回到原布局 —— 避免像旧 fitIcons 那样把压缩结果写回，
 * 导致打开控制台改变视口后布局被永久打乱。
 */
export function layoutIconPositions(positions: Position[], bounds: Bounds): Position[] {
  const { cols } = gridSize(bounds)
  const occupied = new Set<string>()
  return positions.map((position) => {
    const target = cellOf(position.x, position.y, bounds)
    const cell = occupied.has(cellKey(target))
      ? firstFreeCell(target, occupied, cols)
      : target
    occupied.add(cellKey(cell))
    return positionOf(cell)
  })
}

export function clampToBounds(x: number, y: number, bounds: Bounds, size: Size): Position {
  const maxX = Math.max(0, bounds.width - size.width)
  const maxY = Math.max(0, bounds.height - size.height)
  return {
    x: clamp(x, 0, maxX),
    y: clamp(y, 0, maxY),
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
