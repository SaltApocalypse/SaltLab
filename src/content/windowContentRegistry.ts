import type { ComponentType } from 'react'
import {
  AboutContent,
  ItgContent,
  LabContent,
  PastContent,
  ProjectsContent,
  SettingsContent,
  TodoContent,
} from './windowContents'

export const windowContents: Record<string, ComponentType> = {
  lab: LabContent,
  projects: ProjectsContent,
  about: AboutContent,
  settings: SettingsContent,
  todo: TodoContent,
  past: PastContent,
  itg: ItgContent,
}
