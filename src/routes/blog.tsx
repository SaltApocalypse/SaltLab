import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/blog')({
  component: BlogPage,
})

function BlogPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Link to="/" className="link link-primary">
        ← Back to Desktop
      </Link>
      <h1 className="mt-6 text-3xl font-bold">Blog</h1>
      <p className="mt-4 text-base-content/70">
        Blog posts will be published here. This page is a plain router route, not a
        desktop window.
      </p>
    </main>
  )
}
