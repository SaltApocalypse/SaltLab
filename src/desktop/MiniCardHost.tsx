import type { ComponentType } from 'react'
import { MusicMiniCard } from './MusicMiniCard'
import { useMiniCardStore } from './miniCardStore'

/** 迷你卡片注册表：新增卡片类型时在此登记 */
const miniCardRegistry: Record<string, ComponentType> = {
  music: MusicMiniCard,
}

/**
 * MiniCardHost —— 迷你卡片宿主
 *
 * 固定在桌面右上角（状态栏下方），按开启顺序自上而下垂直排列；
 * 层级高于普通窗体（窗体 z ≤ 30），低于全局 Toast（z-100）。
 */
export function MiniCardHost() {
  const cards = useMiniCardStore((state) => state.cards)
  if (cards.length === 0) return null

  return (
    <div className="pointer-events-none fixed right-4 top-12 z-50 flex flex-col gap-2">
      {cards.map((id) => {
        const Card = miniCardRegistry[id]
        return Card ? (
          <div key={id} className="pointer-events-auto">
            <Card />
          </div>
        ) : null
      })}
    </div>
  )
}
