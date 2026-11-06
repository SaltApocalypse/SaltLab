import type { LucideProps } from 'lucide-react'

/** Cor3 图标（public/cor3.svg，来自 cor3.gg；版权归对应权利人） */
export function Cor3Icon({ size = 24, className }: LucideProps) {
  return (
    <img
      src="/cor3.svg"
      alt=""
      width={size}
      height={size}
      className={className}
      draggable={false}
    />
  )
}
