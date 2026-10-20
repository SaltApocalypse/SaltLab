import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

/** Aura 状态切换周期（毫秒）：主题色 5s ↔ holo 5s */
const AURA_SWITCH_MS = 5000

/**
 * BrandTitle —— 状态栏品牌标题（SaltLab）
 *
 * 默认无光效；hover 时用 daisyUI Aura 包装文本：
 *  - 主题色光（aura 使用 currentColor，容器 text-primary 即主题主色）
 *  - hover 期间每 5 秒切换为 aura-holo，再 5 秒切回，循环往复；移出即停止并复位
 * 内层在不透明底色下光效才呈现为「边框光」而非透出文字。
 */
export function BrandTitle() {
  const { t } = useTranslation()
  const [hovered, setHovered] = useState(false)
  const [holo, setHolo] = useState(false)

  // 仅在 hover 期间运行 5s 循环；进入时从主题色开始
  useEffect(() => {
    if (!hovered) return
    const timer = setInterval(() => setHolo((value) => !value), AURA_SWITCH_MS)
    return () => clearInterval(timer)
  }, [hovered])

  return (
    <div
      onMouseEnter={() => {
        setHolo(false)
        setHovered(true)
      }}
      onMouseLeave={() => {
        setHovered(false)
        setHolo(false)
      }}
      className={`p-0.5 ${hovered ? `aura text-primary ${holo ? 'aura-holo' : ''}` : ''}`}
    >
      <span
        className={`rounded-md px-2 py-0.5 text-sm font-medium text-base-content transition-colors duration-300 ${
          hovered ? 'bg-base-100' : ''
        }`}
      >
        {t('icons.saltlab')}
      </span>
    </div>
  )
}
