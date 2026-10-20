/**
 * 音乐播放器数据模型（应用内自有模型）。
 *
 * 刻意与 Apple Music API 原始响应结构解耦：UI/播放器只依赖此处的字段，
 * 后续接入 MusicKit 时在数据层做一次映射即可，不污染 UI。
 * 除 id/title/artist 外的字段均可缺失（例如无 Preview 的曲目）。
 */
export interface MusicTrack {
  id: string
  title: string
  artist: string
  album?: string
  artworkUrl?: string
  previewUrl?: string
  appleMusicUrl?: string
  /** 预览时长（毫秒），可作为音量元数据加载前的占位 */
  durationMs?: number
}

export interface MusicPlaylist {
  name: string
  description?: string
  appleMusicUrl?: string
  tracks: MusicTrack[]
}
