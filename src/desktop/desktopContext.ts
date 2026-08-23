import { createContext, useContext } from 'react'
import type { Bounds } from './types'

export const DesktopBoundsContext = createContext<Bounds>({ width: 0, height: 0 })

export function useDesktopBounds(): Bounds {
  return useContext(DesktopBoundsContext)
}
