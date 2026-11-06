import { FaceGrinning, FlaskConical, FolderArchive, Gamepad2, MessageSquareHeart, Music, Settings } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { gridCell } from '../desktop/grid'
import type { DesktopIconData } from '../desktop/types'
import { Cor3Icon } from '../components/Cor3Icon'

export const desktopIcons: DesktopIconData[] = [
  {
    id: 'welcome',
    titleKey: 'icons.welcome',
    icon: FaceGrinning,
    type: 'window',
    target: 'welcome',
    position: gridCell(0, 0),
  },
  {
    id: 'feedback',
    titleKey: 'icons.feedback',
    icon: MessageSquareHeart,
    type: 'url',
    target: 'https://github.com/SaltApocalypse/SaltLab/issues/new',
    position: gridCell(1, 0),
  },
  {
    id: 'settings',
    titleKey: 'icons.settings',
    icon: Settings,
    type: 'window',
    target: 'settings',
    position: gridCell(2, 0),
  },
  {
    id: 'music',
    titleKey: 'icons.music',
    icon: Music,
    type: 'window',
    target: 'music',
    position: gridCell(3, 0),
  },
  {
    id: 'lab',
    titleKey: 'icons.saltlab',
    icon: FlaskConical,
    type: 'window',
    target: 'lab',
    position: gridCell(0, 1),
  },
  {
    id: 'games',
    titleKey: 'icons.games',
    icon: Gamepad2,
    type: 'window',
    target: 'games',
    position: gridCell(1, 1),
  },
  {
    id: 'past',
    titleKey: 'icons.past',
    icon: FolderArchive,
    type: 'window',
    target: 'past',
    position: gridCell(2, 1),
  },
  {
    id: 'cor3',
    titleKey: 'icons.cor3',
    icon: Cor3Icon as unknown as LucideIcon,
    type: 'window',
    target: 'cor3',
    position: gridCell(0, 2),
  },
]
