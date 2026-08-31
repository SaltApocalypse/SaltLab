import { useState } from 'react'
import type { ComponentType } from 'react'
import { useTranslation } from 'react-i18next'
import { Blocks, ExternalLink } from 'lucide-react'
import { windowExternalUrls } from '../config/windowExternalUrls'
import type { AlertProps, DropdownOption } from '../theme/themes'
import { changeLanguage, getCurrentLang, LANGUAGES, type Lang } from '../i18n'
import { useTheme } from '../theme/ThemeProvider'
import type { ThemeId } from '../theme/themes'
import { useDesktopStore } from '../desktop/desktopStore'
import type { WindowMaskMode } from '../desktop/types'

export function LabContent() {
  const { t } = useTranslation()
  const openWindow = useDesktopStore((state) => state.openWindow)
  return (
    <div>
      {/* 第一行：真实内容（ITG 项目入口） */}
      <div className="flex gap-4">
        {/* 左侧插图（暂用占位，图片后续接入） */}
        <div className="skeleton h-20 w-20 shrink-0 rounded-none" />
        {/* 右侧多行文本：标题 / 正文 / 操作（窗体打开 + 新标签页打开） */}
        <div className="min-w-0 flex-1 space-y-2">
          <h3 className="text-sm font-semibold">{t('content.labList.itgTitle')}</h3>
          <p className="text-xs leading-relaxed text-base-content/70">
            {t('content.labList.itgIntro')}
          </p>
          <div className="flex items-center gap-3 text-xs">
            {/* 打开：窗体内 iframe */}
            <button
              type="button"
              onClick={() => openWindow('itg', t('content.labList.itgTitle'))}
              className="text-primary underline-offset-4 transition-colors duration-300 hover:underline"
            >
              {t('content.labList.itgOpen')}
            </button>
            {/* 在新标签页打开（图标） */}
            <a
              href={windowExternalUrls.itg}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary underline-offset-4 transition-colors duration-300 hover:underline"
            >
              {t('content.labList.itgOpenExternal')}
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ProjectsContent() {
  const { t } = useTranslation()
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">{t('content.projectsTitle')}</h2>
      <ul className="list-disc space-y-1 pl-5 text-sm text-base-content/80">
        <li>{t('content.projectsList.saltlab')}</li>
        <li>{t('content.projectsList.more')}</li>
      </ul>
    </div>
  )
}

export function AboutContent() {
  const { t } = useTranslation()
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">{t('content.aboutTitle')}</h2>
      <p className="text-sm text-base-content/70">{t('content.aboutIntro')}</p>
    </div>
  )
}

export function WelcomeContent() {
  const { t } = useTranslation()
  return (
    <div className="space-y-4 text-sm">
      <p className="text-base-content/70">{t('content.welcome.intro')}</p>
      <ul className="list-disc space-y-1 pl-5 text-base-content/70">
        <li>
          <b className="text-base-content">{t('icons.feedback')}</b>
          {'：'}
          {t('content.welcome.desktop.feedback')}
        </li>
        <li>
          <b className="text-base-content">{t('icons.saltlab')}</b>
          {'：'}
          {t('content.welcome.desktop.saltlab')}
        </li>
        <li>
          <b className="text-base-content">{t('windows.past')}</b>
          {'：'}
          {t('content.welcome.desktop.past')}
        </li>
        <li>
          <b className="text-base-content">{t('windows.todo')}</b>
          {'：'}
          {t('content.welcome.desktop.todo')}
        </li>
      </ul>
      <p className="text-base-content/70">{t('content.welcome.dockIntro')}</p>
      <ul className="list-disc space-y-1 pl-5 text-base-content/70">
        <li>
          <b className="text-base-content">{t('dock.settings')}</b>
          {'：'}
          {t('content.welcome.dockSettings')}
        </li>
      </ul>
    </div>
  )
}

export function SettingsContent() {
  const { t } = useTranslation()
  const { theme, themes, themeId, setTheme, darkMode, setDarkMode } = useTheme()
  const Dropdown = theme.components.Dropdown
  const LightButton = theme.components.LightButton
  const Toggle = theme.components.Toggle
  // Alert 跨主题契约：重置桌面布局后弹出 Toast 提示
  const Alert = theme.components.Alert as unknown as ComponentType<AlertProps>
  const windowMaskMode = useDesktopStore((state) => state.windowMaskMode)
  const setWindowMaskMode = useDesktopStore((state) => state.setWindowMaskMode)
  const resetIconPositions = useDesktopStore((state) => state.resetIconPositions)
  const [showResetAlert, setShowResetAlert] = useState(false)

  const themeOptions: DropdownOption[] = (Object.keys(themes) as ThemeId[]).map((id) => ({
    value: id,
    label: themes[id].name,
  }))

  const maskOptions: DropdownOption[] = [
    { value: 'focus', label: t('settings.windowMaskModes.focus') },
    { value: 'all', label: t('settings.windowMaskModes.all') },
    { value: 'off', label: t('settings.windowMaskModes.off') },
  ]

  return (
    <div>
      {/* 通用：语言（与主题无关的通用项） */}
      <div>
        <h3 className="mb-3 text-sm font-semibold">{t('settings.general')}</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-base-content">{t('settings.language')}</span>
            <Dropdown
              className="w-28"
              value={getCurrentLang()}
              options={LANGUAGES}
              onChange={(value) => changeLanguage(value as Lang)}
            />
          </div>
        </div>
      </div>
      {/* 板块分隔线 */}
      <div className="mx-auto my-4 h-px w-[90%] bg-base-300" />
      {/* 主题：主题选择 + 夜间模式（仅支持日/夜间双模式的主题，如 papercut）+ 窗体遮罩（仅 infinite 生效） */}
      <div>
        <h3 className="mb-3 text-sm font-semibold">{t('settings.theme')}</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-base-content">{t('settings.theme')}</span>
            <Dropdown
              className="w-28"
              value={themeId}
              options={themeOptions}
              onChange={(value) => setTheme(value as ThemeId)}
            />
          </div>
          {theme.capabilities.dark && (
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-base-content">{t('settings.darkMode')}</span>
              <Toggle checked={darkMode} onChange={setDarkMode} />
            </div>
          )}
          {theme.capabilities.windowMask && (
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-base-content">{t('settings.windowMask')}</span>
              <Dropdown
                className="w-28"
                value={windowMaskMode}
                options={maskOptions}
                onChange={(value) => setWindowMaskMode(value as WindowMaskMode)}
              />
            </div>
          )}
        </div>
      </div>
      {/* 板块分隔线 */}
      <div className="mx-auto my-4 h-px w-[90%] bg-base-300" />
      {/* 桌面布局 */}
      <div>
        <h3 className="mb-3 text-sm font-semibold">{t('settings.layout')}</h3>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-base-content">{t('settings.resetLayout')}</span>
          <LightButton
            onClick={() => {
              resetIconPositions()
              setShowResetAlert(true)
            }}
          >
            {t('settings.reset')}
          </LightButton>
        </div>
      </div>
      {/* 重置成功 Toast */}
      {showResetAlert && (
        <Alert variant="success" onClose={() => setShowResetAlert(false)}>
          {t('settings.resetDone')}
        </Alert>
      )}
    </div>
  )
}

export function TodoContent() {
  // NOTE: ToDo 内容的文本都不需要添加国际化（内容暂为空，待后续实现）
  return (
    <div className="space-y-3 text-sm text-base-content/70">
      <p>德丽莎…我们需要更多的德丽莎……</p>
    </div>
  )
}

/** 外部网站内容：加载中显示主色 spin，加载完成后 iframe 淡入 */
function ExternalSiteContent({ src }: { src: string }) {
  const [loaded, setLoaded] = useState(false)
  return (
    <div className="relative h-full w-full">
      {/* 加载中提示：覆盖在 iframe 之上；iframe 保持渲染（不 hidden）避免懒加载/隐藏导致 onLoad 不触发 */}
      {!loaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      )}
      <iframe
        src={src}
        title={src}
        className={`h-full w-full border-0 transition-opacity duration-500 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setLoaded(true)}
      />
    </div>
  )
}

export function PastContent() {
  return <ExternalSiteContent src={windowExternalUrls.past!} />
}

export function ItgContent() {
  return <ExternalSiteContent src={windowExternalUrls.itg!} />
}

export function TeririBlocksContent() {
  return <ExternalSiteContent src={windowExternalUrls.teririBlocks!} />
}

/** 游戏板块：Grid 布局展示游戏卡片，点击在窗体内打开对应游戏 */
export function GamesContent() {
  const { t } = useTranslation()
  const openWindow = useDesktopStore((state) => state.openWindow)
  const games = [
    {
      id: 'teririBlocks',
      icon: Blocks,
      title: t('windows.teririBlocks'),
    },
  ]
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {games.map((game) => (
        <button
          key={game.id}
          type="button"
          onClick={() => openWindow(game.id, game.title)}
          className="group flex flex-col items-center gap-2 border border-base-300 bg-base-100/50 p-4 text-center transition-colors duration-300 hover:border-primary hover:text-primary"
        >
          <game.icon size={32} />
          <span className="text-sm font-medium">{game.title}</span>
        </button>
      ))}
    </div>
  )
}
