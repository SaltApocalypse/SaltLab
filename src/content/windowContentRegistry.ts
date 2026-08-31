import type { ComponentType } from 'react'
import {
  AboutContent,
  GamesContent,
  ItgContent,
  LabContent,
  PastContent,
  ProjectsContent,
  SettingsContent,
  TeririBlocksContent,
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
  games: GamesContent,
  teririBlocks: TeririBlocksContent,
}
