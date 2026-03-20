import Link from 'next/link'
import type { ReactNode } from 'react'

export type EditorialCrumb = {
  href?: string
  label: string
  root?: boolean
}

export type EditorialAction = {
  href: string
  label: string
  secondary?: boolean
}

export type EditorialListItem = {
  description?: string
  href: string
  meta?: string[]
  title: string
}

function HomeIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 10.75L12 4l8 6.75V20a1 1 0 0 1-1 1h-4.75v-6.25h-4.5V21H5a1 1 0 0 1-1-1v-9.25Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  )
}

export function EditorialPage({
  actions = [],
  breadcrumbs,
  children,
  description,
  eyebrow,
  meta = [],
  title,
}: {
  actions?: EditorialAction[]
  breadcrumbs: EditorialCrumb[]
  children: ReactNode
  description?: string
  eyebrow?: string
  meta?: string[]
  title: string
}) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-6 text-(--theme-text)">
      <nav
        aria-label="Breadcrumb"
        className="rounded-3xl border border-(--theme-elevation-150) bg-(--theme-elevation-0) px-5 py-3 shadow-sm"
      >
        <ol className="flex flex-wrap items-center gap-2 text-sm text-(--theme-text) opacity-80">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1
            const content = (
              <span className="inline-flex items-center gap-2 rounded-full px-2 py-1">
                {crumb.root ? <HomeIcon /> : null}
                <span>{crumb.label}</span>
              </span>
            )

            return (
              <li key={`${crumb.label}-${index}`} className="inline-flex items-center gap-2">
                {crumb.href && !isLast ? (
                  <Link className="transition hover:text-(--theme-success-500)" href={crumb.href}>
                    {content}
                  </Link>
                ) : (
                  <span className={isLast ? 'font-semibold text-(--theme-text)' : ''}>
                    {content}
                  </span>
                )}
                {!isLast ? (
                  <span aria-hidden="true" className="opacity-40">
                    /
                  </span>
                ) : null}
              </li>
            )
          })}
        </ol>
      </nav>

      <section className="rounded-4xl border border-(--theme-elevation-150) bg-(--theme-elevation-0) p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            {eyebrow ? (
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-(--theme-success-500)">
                {eyebrow}
              </div>
            ) : null}
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-(--theme-text)">
              {title}
            </h1>
            {description ? (
              <p className="mt-3 text-base leading-7 text-(--theme-text) opacity-75">
                {description}
              </p>
            ) : null}
            {meta.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {meta.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-(--theme-elevation-150) bg-(--theme-elevation-50) px-3 py-1 text-sm opacity-85"
                  >
                    {item}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          {actions.length > 0 ? (
            <div className="flex flex-wrap gap-3 lg:justify-end">
              {actions.map((action) => (
                <Link
                  key={action.href}
                  className={
                    action.secondary
                      ? 'rounded-full border border-(--theme-elevation-150) px-4 py-2 text-sm font-medium transition hover:border-(--theme-success-500) hover:bg-(--theme-elevation-50)'
                      : 'rounded-full bg-(--theme-text) px-4 py-2 text-sm font-medium text-(--theme-base-0) transition hover:opacity-85'
                  }
                  href={action.href}
                >
                  {action.label}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {children}
    </div>
  )
}

export function EditorialSection({
  children,
  description,
  title,
}: {
  children: ReactNode
  description?: string
  title: string
}) {
  return (
    <section className="rounded-4xl border border-(--theme-elevation-150) bg-(--theme-elevation-0) p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-(--theme-text)">{title}</h2>
        {description ? <p className="mt-1 text-sm opacity-72">{description}</p> : null}
      </div>
      {children}
    </section>
  )
}

export function EditorialList({
  emptyMessage,
  items,
}: {
  emptyMessage: string
  items: EditorialListItem[]
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-(--theme-elevation-200) bg-(--theme-elevation-50) px-5 py-6 text-sm opacity-72">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <Link
          key={item.href}
          className="rounded-3xl border border-(--theme-elevation-150) bg-(--theme-elevation-0) px-5 py-4 transition hover:border-(--theme-success-500) hover:bg-(--theme-elevation-50)"
          href={item.href}
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="text-base font-semibold text-(--theme-text)">{item.title}</div>
              {item.description ? (
                <p className="mt-1 text-sm leading-6 text-(--theme-text) opacity-72">
                  {item.description}
                </p>
              ) : null}
            </div>
            {item.meta && item.meta.length > 0 ? (
              <div className="flex flex-wrap gap-2 lg:max-w-xs lg:justify-end">
                {item.meta.map((entry) => (
                  <span
                    key={entry}
                    className="rounded-full border border-(--theme-elevation-150) bg-(--theme-elevation-50) px-3 py-1 text-xs font-medium uppercase tracking-[0.12em] opacity-80"
                  >
                    {entry}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </Link>
      ))}
    </div>
  )
}

export function EditorialInfoGrid({
  items,
}: {
  items: Array<{ label: string; value: string | undefined }>
}) {
  const visibleItems = items.filter((item) => item.value)
  if (visibleItems.length === 0) return null

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {visibleItems.map((item) => (
        <div
          key={item.label}
          className="rounded-3xl border border-(--theme-elevation-150) bg-(--theme-elevation-0) px-5 py-4 shadow-sm"
        >
          <div className="text-xs font-semibold uppercase tracking-[0.16em] opacity-60">
            {item.label}
          </div>
          <div className="mt-2 text-sm leading-6 text-(--theme-text)">{item.value}</div>
        </div>
      ))}
    </section>
  )
}
