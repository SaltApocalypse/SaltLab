#!/usr/bin/env node
/**
 * 从 Apple Music【公开分享】歌单（pl. 链接）重新生成 src/data/music-playlist.json
 *
 * 用法：
 *   node scripts/update-music-playlist.mjs
 *   node scripts/update-music-playlist.mjs "https://music.apple.com/cn/playlist/pl.xxxx"
 *   pnpm music:update
 *
 * 说明：
 * - 仅在开发者本机、更新数据时联网；前端运行时只读取静态 JSON，不请求任何 API。
 * - 只支持公开分享的 pl. 链接；资料库（/library/playlist/p.）需要 MusicKit 授权，无法读取。
 * - Preview 通过公开的 iTunes Lookup 获取（30s 试听）；个别曲目可能没有 Preview，会留空（UI 显示无 Preview）。
 */
import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const DEFAULT_PLAYLIST = 'https://music.apple.com/cn/playlist/pl.u-DdANr1qI0GB7BW'
const STOREFRONT = 'cn'
const OUT = resolve(process.cwd(), 'src/data/music-playlist.json')

const input = process.argv[2] ?? DEFAULT_PLAYLIST
const playlistId = input.match(/pl\.[A-Za-z0-9-]+/)?.[0]
if (!playlistId) {
  console.error('无法解析歌单 id（需要形如 pl.xxxx 的公开分享链接）')
  process.exit(1)
}

const pageUrl = `https://music.apple.com/${STOREFRONT}/playlist/${playlistId}`
console.log('抓取:', pageUrl)
const html = await (await fetch(pageUrl, { headers: { 'user-agent': 'Mozilla/5.0' } })).text()

const matched = html.match(/<script[^>]*id="serialized-server-data"[^>]*>([\s\S]*?)<\/script>/)
if (!matched) {
  console.error('未找到 serialized-server-data：歌单可能不是公开分享的')
  process.exit(1)
}
const pageData = JSON.parse(matched[1])?.data?.[0]?.data
const sections = pageData?.sections ?? []
const trackSection = sections.find((section) => section?.itemKind === 'trackLockup')
if (!trackSection) {
  console.error('未找到曲目列表（trackLockup）')
  process.exit(1)
}
const raw = trackSection.items ?? []
const header = sections.find((s) => s?.itemKind === 'containerDetailHeaderLockup')?.items?.[0]

const name = typeof header?.title === 'string' ? header.title : 'Apple Music Playlist'
const description = `${name} — Apple Music 公开歌单（${raw.length} 首，含 30s Preview）`

const cleanUrl = (url) => (url ? url.split('?')[0] : url)
const artworkUrl = (url) => url?.replace('{w}x{h}', '600x600').replace('{f}', 'jpg')

// 批量获取 Preview（iTunes Lookup，公开接口，更新时一次性调用）
const ids = raw.map((t) => String(t?.contentDescriptor?.identifiers?.storeAdamID ?? '')).filter(Boolean)
const byId = new Map()
for (let i = 0; i < ids.length; i += 100) {
  const chunk = ids.slice(i, i + 100)
  const lookup = `https://itunes.apple.com/lookup?id=${chunk.join(',')}&country=${STOREFRONT}&limit=200`
  const result = await (await fetch(lookup)).json()
  for (const item of result.results ?? []) byId.set(String(item.trackId), item)
}

const tracks = raw.map((t, index) => {
  const adam = String(t?.contentDescriptor?.identifiers?.storeAdamID ?? `idx-${index}`)
  const hit = byId.get(adam) ?? {}
  const item = {
    id: `am-${adam}-${index + 1}`,
    title: t?.title ?? '',
    artist: t?.artistName ?? t?.subtitleLinks?.[0]?.title ?? '',
    album: t?.tertiaryLinks?.[0]?.title,
    artworkUrl: artworkUrl(t?.artwork?.dictionary?.url),
    previewUrl: hit.previewUrl,
    appleMusicUrl: cleanUrl(t?.contentDescriptor?.url),
    durationMs: t?.duration,
  }
  return Object.fromEntries(Object.entries(item).filter(([, v]) => v != null && v !== ''))
})

const playlist = {
  name,
  description,
  appleMusicUrl: `https://music.apple.com/${STOREFRONT}/playlist/${playlistId}`,
  tracks,
}

await writeFile(OUT, JSON.stringify(playlist, null, 2) + '\n', 'utf-8')
console.log(`曲目 ${raw.length} 首，有 Preview ${tracks.filter((t) => t.previewUrl).length} 首`)
console.log('已写入:', OUT)
