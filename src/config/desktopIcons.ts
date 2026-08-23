import { FlaskConical, FolderArchive, ListTodo } from 'lucide-react'
import { gridCell } from '../desktop/grid'
import type { DesktopIconData } from '../desktop/types'

export const desktopIcons: DesktopIconData[] = [
  {
    id: 'lab',
    titleKey: 'icons.saltlab',
    icon: FlaskConical,
    type: 'window',
    target: 'lab',
    position: gridCell(0, 0),
  },
  {
    id: 'todo',
    titleKey: 'icons.todo',
    icon: ListTodo,
    type: 'window',
    target: 'todo',
    position: gridCell(1, 0),
  },
  {
    id: 'past',
    titleKey: 'icons.past',
    icon: FolderArchive,
    type: 'window',
    target: 'past',
    position: gridCell(0, 1),
  },
]
