import type { ComponentType } from 'react'
import {
  AboutContent,
  ItgContent,
  LabContent,
  PastContent,
  ProjectsContent,
  SettingsContent,
  TodoContent,
  WelcomeContent,
} from './windowContents'

export const windowContents: Record<string, ComponentType> = {
  welcome: WelcomeContent,
  lab: LabContent,
  projects: ProjectsContent,
  about: AboutContent,
  settings: SettingsContent,
  todo: TodoContent,
  past: PastContent,
  itg: ItgContent,
}
