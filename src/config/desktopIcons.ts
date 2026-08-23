import { FaceGrinning, FlaskConical, FolderArchive, ListTodo, MessageSquareHeart } from 'lucide-react'
import { gridCell } from '../desktop/grid'
import type { DesktopIconData } from '../desktop/types'

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
    id: 'lab',
    titleKey: 'icons.saltlab',
    icon: FlaskConical,
    type: 'window',
    target: 'lab',
    position: gridCell(0, 1),
  },
  {
    id: 'past',
    titleKey: 'icons.past',
    icon: FolderArchive,
    type: 'window',
    target: 'past',
    position: gridCell(1, 1),
  },
  {
    id: 'todo',
    titleKey: 'icons.todo',
    icon: ListTodo,
    type: 'window',
    target: 'todo',
    position: gridCell(0, 2),
  },
]
