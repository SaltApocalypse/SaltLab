import { createFileRoute } from '@tanstack/react-router'
import { Desktop } from '../desktop/Desktop'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return <Desktop />
}
