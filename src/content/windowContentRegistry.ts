import type { ComponentType } from 'react'
import {
  AboutContent,
  GamesContent,
  ItgContent,
  LabContent,
  MusicContent,
  PastContent,
  ProjectsContent,
  SettingsContent,
  TeririBlocksContent,
  WelcomeContent,
} from './windowContents'

export const windowContents: Record<string, ComponentType> = {
  welcome: WelcomeContent,
  lab: LabContent,
  projects: ProjectsContent,
  about: AboutContent,
  settings: SettingsContent,
  past: PastContent,
  itg: ItgContent,
  games: GamesContent,
  teririBlocks: TeririBlocksContent,
  music: MusicContent,
}
