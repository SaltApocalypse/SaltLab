/**
 * PlayingBars —— 「播放中」均衡器指示
 *
 * 4 根主色竖条，播放时以错开的 delay 做 scaleY 起伏；暂停时保持低矮静态。
 * 尊重 prefers-reduced-motion（仅通过 motion-safe 应用动画）。
 */
export function PlayingBars({ animated, className }: { animated: boolean; className?: string }) {
  return (
    <span aria-hidden="true" className={`flex h-4 items-end gap-[2px] ${className ?? ''}`}>
      {[0, 1, 2, 3].map((index) => (
        <span
          key={index}
          className={`w-0.5 rounded-full bg-primary ${animated ? 'motion-safe:animate-eq' : ''}`}
          style={{
            height: '100%',
            transformOrigin: 'bottom',
            animationDelay: `${index * 120}ms`,
            transform: animated ? undefined : 'scaleY(0.35)',
          }}
        />
      ))}
    </span>
  )
}
