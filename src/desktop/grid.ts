import type { Bounds, Position, Size } from './types'

export const ICON_SLOT = 116
export const DESKTOP_PADDING = 24
export const ICON_WIDTH = 88
export const ICON_HEIGHT = 96

export interface GridCell {
  col: number
  row: number
}

export function gridCell(col: number, row: number): Position {
  return {
    x: DESKTOP_PADDING + col * ICON_SLOT,
    y: DESKTOP_PADDING + row * ICON_SLOT,
  }
}

/** 桌面网格的列/行数 */
export function gridSize(bounds: Bounds): { cols: number; rows: number } {
  return {
    cols: Math.max(1, Math.floor((bounds.width - DESKTOP_PADDING * 2) / ICON_SLOT)),
    rows: Math.max(1, Math.floor((bounds.height - DESKTOP_PADDING * 2) / ICON_SLOT)),
  }
}

/** 坐标 → 最近的网格单元 */
export function cellOf(x: number, y: number, bounds: Bounds): GridCell {
  const { cols, rows } = gridSize(bounds)
  return {
    col: clamp(Math.round((x - DESKTOP_PADDING) / ICON_SLOT), 0, cols - 1),
    row: clamp(Math.round((y - DESKTOP_PADDING) / ICON_SLOT), 0, rows - 1),
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
