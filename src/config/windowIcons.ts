import { Blocks, FaceGrinning, FileText, FlaskConical, FolderArchive, FolderKanban, Gamepad2, Music, Settings } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/** 窗口标题栏图标：按窗口 type 查找 */
export const windowIcons: Record<string, LucideIcon> = {
  welcome: FaceGrinning,
  lab: FlaskConical,
  projects: FolderKanban,
  about: FileText,
  settings: Settings,
  past: FolderArchive,
  itg: FlaskConical,
  games: Gamepad2,
  teririBlocks: Blocks,
  music: Music,
}
