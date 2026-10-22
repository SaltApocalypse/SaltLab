import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ExternalLink, Music, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react'
import { CDN_BASE_URL } from '../config/cdn'
import { windowExternalUrls } from '../config/windowExternalUrls'
import { useAlertStore } from '../desktop/alertStore'
import { MUSIC_PLAYLIST, useMusicStore } from '../desktop/musicStore'
import { PlayingBars } from '../desktop/PlayingBars'
import type { DropdownOption } from '../theme/themes'
import { changeLanguage, getCurrentLang, LANGUAGES, type Lang } from '../i18n'
import { useTheme } from '../theme/ThemeProvider'
import type { ThemeId } from '../theme/themes'
import { useDesktopStore } from '../desktop/desktopStore'
import type { WindowMaskMode } from '../desktop/types'

/** SaltLab 窗口插图（120×80） */
const ITG_ILLUSTRATION_URL = `${CDN_BASE_URL}/SaltLab/SaltLab/infinite-title-generator.webp`

export function LabContent() {
  const { t } = useTranslation()
  const openWindow = useDesktopStore((state) => state.openWindow)
  const [imageLoaded, setImageLoaded] = useState(false)
  return (
    <div>
      {/* 第一行：真实内容（ITG 项目入口） */}
      <div className="flex gap-4">
        {/* 左侧插图：CDN 图片（120×80），加载中显示 daisyUI spinner */}
        <div className="relative h-20 w-[120px] shrink-0">
          {!imageLoaded && (
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="loading loading-spinner loading-md text-primary" />
            </span>
          )}
          <img
            src={ITG_ILLUSTRATION_URL}
            alt={t('content.labList.itgTitle')}
            className={`h-full w-full rounded-none object-cover transition-opacity duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)}
          />
        </div>
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
    <div className="space-y-3 text-sm">
      <p className="text-base-content">{t('content.welcome.intro')}</p>
      <p className="leading-relaxed text-base-content/70">{t('content.welcome.body')}</p>
      <ul className="space-y-1.5 text-base-content/70">
        <li>
          <b className="text-base-content">{t('icons.saltlab')}</b>
          {'：'}
          {t('content.welcome.highlights.projects')}
        </li>
        <li>
          <b className="text-base-content">{t('icons.games')}</b>
          {'：'}
          {t('content.welcome.highlights.games')}
        </li>
        <li>
          <b className="text-base-content">{t('icons.music')}</b>
          {'：'}
          {t('content.welcome.highlights.music')}
        </li>
        <li>
          <b className="text-base-content">{t('icons.past')}</b>
          {'：'}
          {t('content.welcome.highlights.past')}
        </li>
      </ul>
      <p className="text-xs text-base-content/50">{t('content.welcome.tip')}</p>
    </div>
  )
}

export function SettingsContent() {
  const { t } = useTranslation()
  const { theme, themes, themeId, setTheme, darkMode, setDarkMode } = useTheme()
  const Dropdown = theme.components.Dropdown
  const LightButton = theme.components.LightButton
  const Toggle = theme.components.Toggle
  const showAlert = useAlertStore((state) => state.showAlert)
  const windowMaskMode = useDesktopStore((state) => state.windowMaskMode)
  const setWindowMaskMode = useDesktopStore((state) => state.setWindowMaskMode)
  const resetIconPositions = useDesktopStore((state) => state.resetIconPositions)

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
              showAlert(t('settings.resetDone'), 'success')
            }}
          >
            {t('settings.reset')}
          </LightButton>
        </div>
      </div>
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

/** CDN 资源：特日日方块插图（120×80） */
const TERIRI_BLOCKS_ILLUSTRATION_URL = `${CDN_BASE_URL}/SaltLab/Games/teriri-blocks.webp`

/** 游戏板块：与 SaltLab 窗体一致的行布局（左图 + 标题/正文/操作） */
export function GamesContent() {
  const { t } = useTranslation()
  const openWindow = useDesktopStore((state) => state.openWindow)
  const [imageLoaded, setImageLoaded] = useState(false)
  const title = t('windows.teririBlocks')
  return (
    <div>
      <div className="flex gap-4">
        {/* 左侧插图：CDN 图片（120×80），加载中显示 daisyUI spinner */}
        <div className="relative h-20 w-[120px] shrink-0">
          {!imageLoaded && (
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="loading loading-spinner loading-md text-primary" />
            </span>
          )}
          <img
            src={TERIRI_BLOCKS_ILLUSTRATION_URL}
            alt={title}
            className={`h-full w-full rounded-none object-cover transition-opacity duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)}
          />
        </div>
        {/* 右侧多行文本：标题 / 正文 / 操作（窗体打开 + 新标签页打开） */}
        <div className="min-w-0 flex-1 space-y-2">
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="text-xs leading-relaxed text-base-content/70">
            {t('content.gamesList.teririBlocksIntro')}
          </p>
          <div className="flex items-center gap-3 text-xs">
            <button
              type="button"
              onClick={() => openWindow('teririBlocks', title)}
              className="text-primary underline-offset-4 transition-colors duration-300 hover:underline"
            >
              {t('content.gamesList.teririBlocksOpen')}
            </button>
            <a
              href={windowExternalUrls.teririBlocks}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary underline-offset-4 transition-colors duration-300 hover:underline"
            >
              {t('content.gamesList.teririBlocksOpenExternal')}
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

/** 秒 → mm:ss */
function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00'
  const total = Math.floor(seconds)
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

/**
 * MusicContent —— 音乐播放页
 *
 * 左右分布：左侧播放器（封面 / 歌名歌手 / 可拖动进度 / 静音·上一首·播放暂停·下一首），右侧歌单。
 * 播放状态由全局 useMusicStore 事件驱动；数据来自 src/data/music-playlist.json。
 */
export function MusicContent() {
  const { t } = useTranslation()
  const player = useMusicStore()
  const track = player.tracks[player.index]
  const isPlaying = player.status === 'playing'
  const isLoading = player.status === 'loading'
  const isError = player.status === 'error'
  const hasPreview = Boolean(track?.previewUrl)
  const duration = player.duration
  // 「在 Apple Music 打开」统一指向歌单页（而非当前歌曲的专辑页）
  const playlistUrl = MUSIC_PLAYLIST.appleMusicUrl
  const volumePercent = player.isMuted ? 0 : Math.round(player.volume * 100)
  // 音量滑杆：hover 音量按钮时展开
  const [volumeOpen, setVolumeOpen] = useState(false)

  return (
    // @container：随窗体内容宽度自适应（窄窗上下堆叠，宽窗左右分布）
    // h-full + overflow-hidden：播放器固定，只有歌单滚动（窄/宽一致）
    <div className="@container h-full min-h-0">
      <div className="flex h-full min-h-0 flex-col gap-4 overflow-hidden @md:flex-row @md:gap-6">
        {/* 左：播放器（固定，不随歌单滚动） */}
        <div className="mx-auto w-full max-w-36 shrink-0 space-y-1.5 @md:mx-0 @md:max-w-44">
          {/* 封面（无 artwork 时保留原占位） */}
          <div className="relative mx-auto flex aspect-square w-full max-w-32 items-center justify-center overflow-hidden rounded-box bg-base-200 text-base-content/15 @md:max-w-none">
            {track?.artworkUrl ? (
              <img
                key={track.id}
                src={track.artworkUrl}
                alt={track.title}
                className="h-full w-full object-cover motion-safe:animate-artwork-in"
              />
            ) : (
              <Music
                key={`icon-${track?.id ?? 'none'}`}
                size={52}
                strokeWidth={1.2}
                className="motion-safe:animate-artwork-in"
              />
            )}
            {/* 试听标记（仅当有 Preview） */}
            {hasPreview && (
              <span className="absolute left-1.5 top-1.5 rounded-sm bg-base-100/80 px-1.5 py-0.5 text-[10px] font-medium leading-tight text-base-content/80 backdrop-blur-sm">
                {t('content.music.preview')}
              </span>
            )}
            {/* 无 Preview / 播放失败：叠加在封面底部，不额外占用布局高度 */}
            {(isError || !hasPreview) && (
              <div className="absolute inset-x-0 bottom-0 bg-base-100/80 px-1.5 py-1 text-center text-[10px] leading-tight text-base-content/80 backdrop-blur-sm">
                {isError ? (
                  t('content.music.playbackError')
                ) : playlistUrl ? (
                  <>
                    {t('content.music.noPreview')}
                    {' · '}
                    <a
                      href={playlistUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline-offset-2 hover:underline"
                    >
                      {t('content.music.openAppleMusic')}
                    </a>
                  </>
                ) : (
                  t('content.music.noPreview')
                )}
              </div>
            )}
          </div>
          {/* 歌名 + 歌手 */}
          <div className="min-w-0 text-center">
            <div className="truncate text-sm font-semibold text-base-content">{track?.title ?? '—'}</div>
            <div className="truncate text-xs text-base-content/60">{track?.artist ?? ''}</div>
          </div>
          {/* 进度条 + 时间：progress 负责视觉，透明 range 覆盖实现拖动 */}
          <div className="space-y-1">
            <div className="relative">
              <progress
                className="progress progress-primary w-full"
                value={Math.min(player.currentTime, duration || 1)}
                max={duration || 1}
              />
              <input
                type="range"
                min={0}
                max={duration || 1}
                step={0.1}
                value={Math.min(player.currentTime, duration || 1)}
                disabled={!hasPreview || duration <= 0 || isError}
                onChange={(event) => player.seek(Number(event.target.value))}
                aria-label={t('content.music.seek')}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
              />
            </div>
            <div className="flex items-center justify-between font-mono text-[10px] tabular-nums text-base-content/50">
              <span>{formatTime(player.currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
          {/* 控制区：hover 音量按钮时，传输按钮淡出左移、音量滑杆淡入右移（常驻挂载，交叉过渡） */}
          <div
            className="flex items-center justify-center gap-1"
            onMouseLeave={() => setVolumeOpen(false)}
          >
            <button
              type="button"
              className="btn btn-ghost btn-circle btn-sm shrink-0"
              aria-label={player.isMuted ? t('content.music.unmute') : t('content.music.mute')}
              onClick={player.toggleMute}
              onMouseEnter={() => setVolumeOpen(true)}
            >
              {player.isMuted || player.volume === 0 ? (
                <VolumeX size={18} />
              ) : (
                <Volume2 size={18} />
              )}
            </button>
            {/* 固定宽度的可切换区域（3×32 + 2×4 = 104px）：两层叠加做交叉淡入淡出 */}
            <div className="relative h-8 w-[6.5rem]">
              {/* 传输按钮 */}
              <div
                className={`absolute inset-0 flex items-center justify-center gap-1 motion-safe:transition-all motion-safe:duration-200 motion-safe:ease-out ${
                  volumeOpen ? 'pointer-events-none -translate-x-1 opacity-0' : 'opacity-100'
                }`}
              >
                <button
                  type="button"
                  className="btn btn-ghost btn-circle btn-sm"
                  aria-label={t('content.music.previous')}
                  onClick={player.prev}
                >
                  <SkipBack size={18} />
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-circle btn-sm"
                  aria-label={isPlaying ? t('content.music.pause') : t('content.music.play')}
                  onClick={player.toggle}
                  disabled={!hasPreview || isError}
                >
                  {isLoading ? (
                    <span className="loading loading-spinner loading-xs" />
                  ) : isPlaying ? (
                    <Pause size={18} />
                  ) : (
                    <Play size={18} />
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-circle btn-sm"
                  aria-label={t('content.music.next')}
                  onClick={player.next}
                >
                  <SkipForward size={18} />
                </button>
              </div>
              {/* 音量滑杆 */}
              <div
                className={`absolute inset-0 flex items-center justify-center motion-safe:transition-all motion-safe:duration-200 motion-safe:ease-out ${
                  volumeOpen ? 'opacity-100' : 'pointer-events-none translate-x-1 opacity-0'
                }`}
              >
                <div className="relative w-24">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={10}
                    value={volumePercent}
                    onChange={(event) => player.setVolume(Number(event.target.value) / 100)}
                    aria-label={t('content.music.volume')}
                    className="range range-primary range-xs w-full"
                  />
                  {/* 滑钮 Tooltip：显示当前音量 */}
                  {volumeOpen && (
                    <span
                      className="pointer-events-none absolute -top-5 -translate-x-1/2 rounded bg-neutral px-1 py-0.5 text-[9px] leading-none text-neutral-content shadow"
                      style={{ left: `${Math.min(96, Math.max(4, volumePercent))}%` }}
                    >
                      {volumePercent}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* 底部次要入口：在 Apple Music 打开 */}
          {playlistUrl && (
            <a
              href={playlistUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group/link flex items-center justify-center gap-1 text-[10px] text-base-content/45 underline-offset-4 transition-colors duration-300 hover:text-primary hover:underline"
            >
              {t('content.music.openAppleMusic')}
              <span className="inline-block transition-transform duration-300 group-hover/link:translate-x-0.5">
                →
              </span>
            </a>
          )}
        </div>

        {/* 右：歌单（窄/宽屏都独立滚动，不带动播放器） */}
        <ul className="no-scrollbar min-h-0 min-w-0 flex-1 overflow-y-auto">
          {player.tracks.map((item, itemIndex) => {
            const isCurrent = itemIndex === player.index
            return (
              <li key={item.id}>
                <div className="group flex items-center gap-3 rounded-field px-3 py-2 transition-colors duration-300 hover:bg-base-200">
                  {/* 编号 001~999 */}
                  <span className="w-8 shrink-0 font-mono text-xs tabular-nums text-base-content/40">
                    {String(itemIndex + 1).padStart(3, '0')}
                  </span>
                  {/* 歌名 - 歌手 */}
                  <span className="min-w-0 flex-1 truncate text-sm">
                    <span className={isCurrent ? 'text-primary' : 'text-base-content'}>{item.title}</span>
                    <span className="text-base-content/50"> - {item.artist}</span>
                  </span>
                  {/* 状态位：当前曲目显示播放中标识；hover 显示播放/暂停按钮 */}
                  <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
                    {isCurrent && (
                      <span className="transition-opacity duration-300 group-hover:opacity-0">
                        <PlayingBars animated={isPlaying} />
                      </span>
                    )}
                    <button
                      type="button"
                      aria-label={isCurrent && isPlaying ? t('content.music.pause') : t('content.music.play')}
                      onClick={() => (isCurrent && isPlaying ? player.toggle() : player.playAt(itemIndex))}
                      className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    >
                      {isCurrent && isPlaying ? (
                        <Pause size={16} className="text-base-content" />
                      ) : (
                        <Play size={16} className="text-base-content" />
                      )}
                    </button>
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
