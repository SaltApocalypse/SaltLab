import { useState } from 'react'
import { Music, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { MiniCard } from './MiniCard'
import { useMusicStore } from './musicStore'

/** 秒 → mm:ss */
function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00'
  const total = Math.floor(seconds)
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

/**
 * MusicMiniCard —— 音乐迷你卡片（窗体的延伸）
 *
 * 与音乐窗体共享全局 store：双向即时同步；关闭卡片只暂停播放，不关闭/卸载窗体。
 * 底部默认显示播放进度；hover 音量图标时切换为更细的音量滑杆（滑钮上方显示当前音量 Tooltip）。
 */
export function MusicMiniCard() {
  const { t } = useTranslation()
  const index = useMusicStore((state) => state.index)
  const tracks = useMusicStore((state) => state.tracks)
  const status = useMusicStore((state) => state.status)
  const currentTime = useMusicStore((state) => state.currentTime)
  const duration = useMusicStore((state) => state.duration)
  const isMuted = useMusicStore((state) => state.isMuted)
  const volume = useMusicStore((state) => state.volume)
  const toggle = useMusicStore((state) => state.toggle)
  const next = useMusicStore((state) => state.next)
  const prev = useMusicStore((state) => state.prev)
  const toggleMute = useMusicStore((state) => state.toggleMute)
  const setVolume = useMusicStore((state) => state.setVolume)
  const closeCard = useMusicStore((state) => state.closeCard)

  const [volumeOpen, setVolumeOpen] = useState(false)

  const track = tracks[index]
  const isPlaying = status === 'playing'
  const isLoading = status === 'loading'
  const volumePercent = isMuted ? 0 : Math.round(volume * 100)

  return (
    <MiniCard title={t('windows.music')} icon={Music} onClose={closeCard}>
      <div className="space-y-2">
        {/* 歌曲信息 + 传输控制 */}
        <div className="flex items-center gap-2">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded bg-base-200 text-base-content/20">
            {track?.artworkUrl ? (
              <img src={track.artworkUrl} alt={track.title} className="h-full w-full object-cover" />
            ) : (
              <Music size={20} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-medium text-base-content">{track?.title ?? '—'}</div>
            <div className="truncate text-[10px] text-base-content/60">{track?.artist ?? ''}</div>
          </div>
          <div className="flex shrink-0 items-center">
            <button
              type="button"
              className="btn btn-ghost btn-circle btn-xs"
              aria-label={t('content.music.previous')}
              onClick={prev}
            >
              <SkipBack size={14} />
            </button>
            <button
              type="button"
              className="btn btn-primary btn-circle btn-xs"
              aria-label={isPlaying ? t('content.music.pause') : t('content.music.play')}
              onClick={toggle}
            >
              {isLoading ? (
                <span className="loading loading-spinner loading-xs" />
              ) : isPlaying ? (
                <Pause size={14} />
              ) : (
                <Play size={14} />
              )}
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-circle btn-xs"
              aria-label={t('content.music.next')}
              onClick={next}
            >
              <SkipForward size={14} />
            </button>
          </div>
        </div>

        {/* 音量图标 + 进度条 / 音量滑杆（hover 音量图标切换） */}
        <div
          className="flex items-center gap-1.5"
          onMouseLeave={() => setVolumeOpen(false)}
        >
          <button
            type="button"
            className="flex h-5 w-5 shrink-0 items-center justify-center text-base-content/60 transition-colors duration-300 hover:text-primary"
            aria-label={isMuted ? t('content.music.unmute') : t('content.music.mute')}
            onClick={toggleMute}
            onMouseEnter={() => setVolumeOpen(true)}
          >
            {isMuted || volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
          <div className="relative h-4 min-w-0 flex-1">
            {/* 默认：当前时间 + 进度条 + 总时长 */}
            <div
              className={`absolute inset-0 flex items-center gap-1.5 motion-safe:transition-opacity motion-safe:duration-200 ${
                volumeOpen ? 'pointer-events-none opacity-0' : 'opacity-100'
              }`}
            >
              <span className="shrink-0 font-mono text-[9px] tabular-nums text-base-content/50">
                {formatTime(currentTime)}
              </span>
              <progress
                className="progress progress-primary h-1 min-w-0 flex-1"
                value={Math.min(currentTime, duration || 1)}
                max={duration || 1}
              />
              <span className="shrink-0 font-mono text-[9px] tabular-nums text-base-content/50">
                {formatTime(duration)}
              </span>
            </div>
            {/* hover 音量图标：更细的音量滑杆 + 滑钮 Tooltip */}
            <div
              className={`absolute inset-0 flex items-center motion-safe:transition-opacity motion-safe:duration-200 ${
                volumeOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
              }`}
            >
              <div className="relative w-full">
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={10}
                  value={volumePercent}
                  onChange={(event) => setVolume(Number(event.target.value) / 100)}
                  aria-label={t('content.music.volume')}
                  className="range range-primary w-full [--range-thumb-size:0.625rem]"
                />
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
      </div>
    </MiniCard>
  )
}
