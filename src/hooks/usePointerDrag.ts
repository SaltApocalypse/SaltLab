import { useCallback, useRef } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import type { Position } from '../desktop/types'

interface PointerDragOptions {
  onStart?: (event: ReactPointerEvent<Element>) => void
  onMove?: (event: ReactPointerEvent<Element>, delta: Position) => void
  onEnd?: (event: ReactPointerEvent<Element>, delta: Position) => void
  /** 指针取消（非正常结束）时回调，用于复位交互状态 */
  onCancel?: () => void
}

export function usePointerDrag({ onStart, onMove, onEnd, onCancel }: PointerDragOptions) {
  const startRef = useRef<{ x: number; y: number } | null>(null)

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<Element>) => {
      if (event.button !== 0) return
      startRef.current = { x: event.clientX, y: event.clientY }
      event.currentTarget.setPointerCapture(event.pointerId)
      onStart?.(event)
    },
    [onStart],
  )

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<Element>) => {
      const start = startRef.current
      if (!start) return
      onMove?.(event, { x: event.clientX - start.x, y: event.clientY - start.y })
    },
    [onMove],
  )

  const handlePointerEnd = useCallback(
    (event: ReactPointerEvent<Element>) => {
      const start = startRef.current
      if (!start) return
      startRef.current = null
      onEnd?.(event, { x: event.clientX - start.x, y: event.clientY - start.y })
    },
    [onEnd],
  )

  const handlePointerCancel = useCallback(() => {
    startRef.current = null
    onCancel?.()
  }, [onCancel])

  return {
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerEnd,
    onPointerCancel: handlePointerCancel,
  }
}
