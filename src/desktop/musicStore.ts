import { create } from 'zustand'
import type { MusicPlaylist, MusicTrack } from '../data/music'
import musicPlaylistData from '../data/music-playlist.json'
import { useMiniCardStore } from './miniCardStore'

/** 静态歌单（本阶段唯一数据源） */
export const MUSIC_PLAYLIST = musicPlaylistData as MusicPlaylist

/** 初始音量（10%） */
const INITIAL_VOLUME = 0.1
/** 暂停后释放音频流的空闲时长（与窗体挂起策略一致：3 分钟；播放中不计时） */
const IDLE_RELEASE_MS = 3 * 60 * 1000

export type MusicStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error' | 'no-preview'

interface MusicStore {
  tracks: MusicTrack[]
  index: number
  status: MusicStatus
  currentTime: number
  duration: number
  error: string | null
  isMuted: boolean
  /** 音量 0~1 */
  volume: number
  /** 音频流已因长时间暂停被释放；再次播放会重新加载并恢复进度 */
  isReleased: boolean
  playAt: (index: number) => void
  toggle: () => void
  next: () => void
  prev: () => void
  seek: (seconds: number) => void
  toggleMute: () => void
  setVolume: (value: number) => void
  /** 关闭迷你卡片：只暂停播放，不关闭/卸载音乐窗体 */
  closeCard: () => void
}

const tracks = MUSIC_PLAYLIST.tracks
const firstTrack = tracks[0]

// —— 模块级单例：与 React 组件生命周期解耦，关闭窗体后仍持续播放 ——
let audio: HTMLAudioElement | null = null
let autoNextTimer: ReturnType<typeof setTimeout> | null = null
let idleTimer: ReturnType<typeof setTimeout> | null = null
/** 释放后再次播放时应恢复的进度（秒） */
let resumeAt: number | null = null

function openMusicCard() {
  useMiniCardStore.getState().open('music')
}

function clearAutoNext() {
  if (autoNextTimer !== null) {
    clearTimeout(autoNextTimer)
    autoNextTimer = null
  }
}

function clearIdle() {
  if (idleTimer !== null) {
    clearTimeout(idleTimer)
    idleTimer = null
  }
}

/** 仅在暂停（或结束）后开始计时；到点释放音频流，保留曲目/进度/音量状态 */
function scheduleIdleRelease() {
  clearIdle()
  idleTimer = setTimeout(() => {
    idleTimer = null
    if (!audio || !audio.paused) return
    resumeAt = audio.currentTime
    audio.removeAttribute('src')
    audio.load()
    useMusicStore.setState({ isReleased: true })
  }, IDLE_RELEASE_MS)
}

function ensureAudio(): HTMLAudioElement {
  if (audio) return audio
  const el = new Audio()
  el.preload = 'metadata'
  el.volume = useMusicStore.getState().volume

  el.addEventListener('loadedmetadata', () => {
    if (Number.isFinite(el.duration)) useMusicStore.setState({ duration: el.duration })
    if (resumeAt !== null) {
      const target = Number.isFinite(el.duration) ? Math.min(resumeAt, el.duration) : resumeAt
      resumeAt = null
      el.currentTime = target
    }
  })
  el.addEventListener('durationchange', () => {
    if (Number.isFinite(el.duration)) useMusicStore.setState({ duration: el.duration })
  })
  el.addEventListener('timeupdate', () => useMusicStore.setState({ currentTime: el.currentTime }))
  el.addEventListener('play', () => {
    clearIdle()
    useMusicStore.setState({ status: 'playing', isReleased: false })
  })
  el.addEventListener('pause', () => {
    // 切歌时的过渡性 pause 事件（音频实际仍在播放）忽略
    if (!el.paused) return
    if (useMusicStore.getState().status === 'playing') {
      useMusicStore.setState({ status: 'paused' })
    }
    scheduleIdleRelease()
  })
  el.addEventListener('waiting', () => {
    const { status } = useMusicStore.getState()
    if (status !== 'error' && status !== 'no-preview') {
      useMusicStore.setState({ status: 'loading' })
    }
  })
  el.addEventListener('canplay', () => {
    // 缓冲结束：实际仍在播放则回到 playing，否则才是 paused
    if (!el.paused) {
      useMusicStore.setState({ status: 'playing' })
    } else if (useMusicStore.getState().status === 'loading') {
      useMusicStore.setState({ status: 'paused' })
    }
  })
  el.addEventListener('ended', () => {
    useMusicStore.setState({
      status: 'paused',
      currentTime: Number.isFinite(el.duration) ? el.duration : 0,
    })
    scheduleIdleRelease()
    // 结束后等待 1s 自动播放下一首（循环）；期间任何手动操作都会取消
    clearAutoNext()
    autoNextTimer = setTimeout(() => {
      autoNextTimer = null
      const state = useMusicStore.getState()
      if (state.tracks.length === 0) return
      loadTrack((state.index + 1) % state.tracks.length, true)
    }, 1000)
  })
  el.addEventListener('error', () => {
    if (!el.error) return
    useMusicStore.setState({ status: 'error', error: el.error.message || 'audio load error' })
  })

  audio = el
  return el
}

function loadTrack(nextIndex: number, autoplay: boolean, startAt?: number) {
  clearAutoNext()
  clearIdle()
  const el = ensureAudio()
  const track = tracks[nextIndex]
  if (!track) return

  resumeAt = startAt ?? null
  useMusicStore.setState({
    index: nextIndex,
    currentTime: startAt ?? 0,
    error: null,
    isReleased: false,
    duration: track.durationMs ? track.durationMs / 1000 : 0,
  })

  // 换源 + load() 停止旧播放；不额外 pause，避免过渡性 pause 事件污染状态
  el.removeAttribute('src')
  el.load()

  if (!track.previewUrl) {
    useMusicStore.setState({ status: 'no-preview' })
    return
  }

  useMusicStore.setState({ status: autoplay ? 'loading' : 'paused' })
  el.src = track.previewUrl
  el.load()

  if (autoplay) {
    openMusicCard()
    void el.play().catch((err: unknown) => {
      useMusicStore.setState({
        status: 'error',
        error: err instanceof Error ? err.message : 'playback failed',
      })
    })
  }
}

function clampVolume(value: number): number {
  return Math.min(1, Math.max(0, value))
}

/**
 * useMusicStore —— 全局唯一的音乐播放器（单例 HTMLAudioElement）。
 *
 * 与组件生命周期解耦：关闭音乐窗体后仍继续播放；暂停 3 分钟后释放音频流。
 */
export const useMusicStore = create<MusicStore>((set, get) => ({
  tracks,
  index: 0,
  status: 'idle',
  currentTime: 0,
  duration: (firstTrack?.durationMs ?? 0) / 1000,
  error: null,
  isMuted: false,
  volume: INITIAL_VOLUME,
  isReleased: false,

  playAt: (nextIndex) => {
    const track = tracks[nextIndex]
    if (!track) return
    clearAutoNext()
    clearIdle()
    const el = ensureAudio()

    if (!track.previewUrl) {
      loadTrack(nextIndex, false)
      return
    }

    // 同一首且音频仍就绪：继续/重播
    if (nextIndex === get().index && el.currentSrc && !get().isReleased) {
      if (el.ended) el.currentTime = 0
      openMusicCard()
      void el.play().catch((err: unknown) => {
        set({ status: 'error', error: err instanceof Error ? err.message : 'playback failed' })
      })
      return
    }

    loadTrack(nextIndex, true)
  },

  toggle: () => {
    clearAutoNext()
    clearIdle()
    const state = get()
    const track = tracks[state.index]
    const el = ensureAudio()
    if (!track) return

    if (!track.previewUrl) {
      el.pause()
      set({ status: 'no-preview' })
      return
    }

    // 音频已释放或尚未加载：重新加载（需要时恢复进度）后播放
    if (state.isReleased || !el.currentSrc) {
      loadTrack(state.index, true, state.isReleased ? state.currentTime : undefined)
      return
    }

    if (el.paused) {
      if (el.ended) el.currentTime = 0
      openMusicCard()
      void el.play().catch((err: unknown) => {
        set({ status: 'error', error: err instanceof Error ? err.message : 'playback failed' })
      })
    } else {
      el.pause()
    }
  },

  next: () => {
    const state = get()
    if (state.tracks.length === 0) return
    const el = ensureAudio()
    const wasPlaying = !el.paused
    loadTrack((state.index + 1) % state.tracks.length, wasPlaying)
  },

  prev: () => {
    const state = get()
    if (state.tracks.length === 0) return
    const el = ensureAudio()
    const wasPlaying = !el.paused
    loadTrack((state.index - 1 + state.tracks.length) % state.tracks.length, wasPlaying)
  },

  seek: (seconds) => {
    const state = get()
    const track = tracks[state.index]
    const el = ensureAudio()
    if (!track?.previewUrl || el.readyState < 1) return
    const max = Number.isFinite(el.duration)
      ? el.duration
      : track.durationMs
        ? track.durationMs / 1000
        : 0
    if (max <= 0) return
    const clamped = Math.min(Math.max(0, seconds), max)
    el.currentTime = clamped
    set({ currentTime: clamped })
  },

  toggleMute: () => {
    const el = ensureAudio()
    el.muted = !el.muted
    set({ isMuted: el.muted })
  },

  setVolume: (value) => {
    const el = ensureAudio()
    const clamped = clampVolume(value)
    el.volume = clamped
    el.muted = false
    set({ volume: clamped, isMuted: false })
  },

  closeCard: () => {
    ensureAudio().pause()
    useMiniCardStore.getState().close('music')
  },
}))
