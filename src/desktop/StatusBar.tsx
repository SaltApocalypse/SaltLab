import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getCurrentLang } from '../i18n'

/**
 * StatusBar —— 桌面四周边界装饰框 + 状态栏雏形
 *
 * 目前仅做两件事：
 *  - 沿四边渲染一圈粗描边框作为装饰（后续扩展为真正的状态栏）
 *  - 顶部线框特意下移（牺牲一点垂直桌面空间），状态数据（本地时间）放在线框上方的留白处
 * 不拦截交互（pointer-events-none），位于背景之上、桌面内容（图标/窗体）之下。
 */
export function StatusBar() {
  const { t } = useTranslation()
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const time = now.toLocaleTimeString(localeOf(getCurrentLang()), { hour: '2-digit', minute: '2-digit' })
  const date = now.toLocaleDateString(localeOf(getCurrentLang()), { month: 'long', day: 'numeric' })

  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      {/* 四周边界装饰框：粗描边，顶部线框下移留白 */}
      <div className="absolute bottom-2 left-2 right-2 top-8 border-2 border-primary/30" />
      {/* 状态栏右上角：本地日期 + 时间（位于线框上方，与线框留足间隙） */}
      <div className="absolute right-4 top-1.5 flex items-baseline gap-2">
        <span className="text-xs text-base-content/50">{t('statusBar.localTime')}</span>
        <span className="text-sm font-mono tabular-nums text-base-content/80">{date}</span>
        <span className="text-lg font-mono tabular-nums text-primary">{time}</span>
      </div>
    </div>
  )
}

/** 应用语言 → toLocale* 区域标识（日期/时间随界面语言切换） */
function localeOf(lang: ReturnType<typeof getCurrentLang>): string {
  return lang === 'zh' ? 'zh-CN' : 'en-US'
}
