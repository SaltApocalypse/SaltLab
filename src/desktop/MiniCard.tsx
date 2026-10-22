import type { ComponentType, ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../theme/ThemeProvider'
import type { PanelProps } from '../theme/themes'

interface MiniCardProps {
  /** 卡片标题（如窗体名） */
  title: string
  /** 标题图标 */
  icon?: LucideIcon
  /** 关闭卡片（仅影响卡片本身，不影响对应窗体） */
  onClose: () => void
  children: ReactNode
}

/**
 * MiniCard —— 可复用迷你卡片外壳
 *
 * 使用主题 Panel 承载，边框/底面与窗体保持一致（infinite 括号边框 / papercut 纸片叠层）。
 * 统一尺寸（宽 300px、最小高 120px），内容区由各卡片自行排版；
 * 由 MiniCardHost 统一在桌面右上角自上而下堆叠。
 */
export function MiniCard({ title, icon: Icon, onClose, children }: MiniCardProps) {
  const { t } = useTranslation()
  const { theme } = useTheme()
  // 与窗体一致的跨主题 Panel 契约
  const Panel = theme.components.Panel as unknown as ComponentType<PanelProps>

  return (
    <Panel padding="none" tilt={false} className="w-[300px] p-0! text-base-content">
      <div className="flex min-h-[120px] w-full flex-col">
        <div className="flex items-center justify-between gap-2 border-b border-base-300/60 px-3 py-2">
          <span className="flex min-w-0 items-center gap-2 text-xs font-medium">
            {Icon ? <Icon size={14} className="shrink-0 text-primary" /> : null}
            <span className="truncate">{title}</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('miniCard.close')}
            className="flex h-5 w-5 shrink-0 items-center justify-center text-base-content/50 transition-colors duration-300 hover:text-primary"
          >
            <X size={14} />
          </button>
        </div>
        <div className="flex flex-1 flex-col justify-center px-3 pb-3 pt-2">{children}</div>
      </div>
    </Panel>
  )
}
