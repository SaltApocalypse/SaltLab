import { create } from 'zustand'

/**
 * 迷你卡片状态：桌面上挂载的卡片 id 列表（按插入顺序从上往下排列）。
 *
 * 卡片是「窗体的延伸」，但不拥有窗体生命周期：
 * 关闭卡片只影响自身（以及卡片自愿执行的副作用），不会关闭或卸载对应窗体。
 */
interface MiniCardStore {
  cards: string[]
  open: (id: string) => void
  close: (id: string) => void
}

export const useMiniCardStore = create<MiniCardStore>((set) => ({
  cards: [],
  open: (id) =>
    set((state) => (state.cards.includes(id) ? state : { cards: [...state.cards, id] })),
  close: (id) => set((state) => ({ cards: state.cards.filter((card) => card !== id) })),
}))
