import { Power, Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { LOGO_URL } from '../config/cdn'
import { useClock } from '../hooks/useClock'
import { BrandTitle } from './BrandTitle'
import { useDesktopStore } from './desktopStore'
import { STATUS_BAR_HEIGHT } from './grid'

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * StatusBar —— 项目专属顶部状态栏（高 40px）
 *
 * 左：logo（hover 渐变为 power 图标，点击关闭当前页面）+ 站点标题
 * 右：settings 图标 + 日期时间（默认 MM/DD HH:mm 24 小时制，hover 渐变展开为 YYYY/MM/DD hh:mm AM/PM）
 * 容器不拦截交互（pointer-events-none），仅交互元素自身开启（pointer-events-auto）。
 */
export function StatusBar() {
  const { t } = useTranslation()
  const now = useClock()
  const openWindow = useDesktopStore((state) => state.openWindow)

  const mm = pad(now.getMonth() + 1)
  const dd = pad(now.getDate())
  const yyyy = now.getFullYear()
  const h24 = pad(now.getHours())
  const min = pad(now.getMinutes())
  const h12 = pad(now.getHours() % 12 || 12)
  const ampm = now.getHours() < 12 ? 'AM' : 'PM'
  const compact = `${mm}/${dd} ${h24}:${min}`
  const expanded = `${yyyy}/${mm}/${dd} ${h12}:${min} ${ampm}`

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-40 border-b border-base-content/10 bg-base-100/30 backdrop-blur-sm motion-safe:animate-status-in"
      style={{ height: STATUS_BAR_HEIGHT }}
    >
      <div className="flex h-full items-center justify-between px-4">
        {/* 左：logo（hover → power，点击关闭页面）+ 标题 */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.close()}
            aria-label={t('statusBar.shutdown')}
            className="group/logo relative block h-6 w-6 cursor-pointer"
          >
            <img
              src={LOGO_URL}
              alt=""
              className="h-6 w-6 object-contain transition-opacity duration-300 group-hover/logo:opacity-0"
            />
            <Power
              size={22}
              className="absolute inset-0 m-auto text-primary opacity-0 transition-opacity duration-300 group-hover/logo:opacity-100"
            />
          </button>
          <BrandTitle />
        </div>

        {/* 右：settings 图标 + 日期（hover 渐变展开） */}
        <div className="pointer-events-auto flex items-center gap-3">
          <button
            type="button"
            onClick={() => openWindow('settings', t('windows.settings'))}
            aria-label={t('icons.settings')}
            className="flex h-6 w-6 items-center justify-center text-base-content/70 transition-colors duration-300 hover:text-primary"
          >
            <Settings size={16} />
          </button>
          {/* 宽度由展开格式（最长）预先撑开，hover 仅做透明度切换，不重排 */}
          <div className="group/date relative text-xs tabular-nums text-base-content/70">
            <span className="invisible" aria-hidden="true">
              {expanded}
            </span>
            <span className="absolute inset-0 flex items-center justify-center whitespace-nowrap transition-opacity duration-300 group-hover/date:opacity-0">
              {compact}
            </span>
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center whitespace-nowrap opacity-0 transition-opacity duration-300 group-hover/date:opacity-100">
              {expanded}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
