import Link from 'next/link'

import { editorialHref } from '@/lib/editorial'

export default function EditorialNotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col items-start justify-center gap-6 px-6 py-10 text-(--theme-text)">
      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-(--theme-warning-500)">
        Not found
      </div>
      <h1 className="text-4xl font-semibold tracking-tight">
        This editorial location does not exist.
      </h1>
      <p className="max-w-2xl text-base leading-7 opacity-75">
        The URL does not match a valid place in the editorial tree. Go back to Home and navigate
        from there.
      </p>
      <Link
        className="rounded-full bg-(--theme-text) px-4 py-2 text-sm font-medium text-(--theme-base-0) transition hover:opacity-85"
        href={editorialHref()}
      >
        Go to Home
      </Link>
    </div>
  )
}
