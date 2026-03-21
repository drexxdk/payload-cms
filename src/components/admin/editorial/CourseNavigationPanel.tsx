'use client'

import Link from 'next/link'

import type { EditorialCourseNavigation } from '@/lib/editorial'

function TreeLink({
  current,
  href,
  label,
  meta,
}: {
  current: boolean
  href: string
  label: string
  meta?: string
}) {
  return current ? (
    <span className="block rounded-2xl border border-(--theme-success-500) bg-(--theme-success-100) px-3 py-2 text-sm font-semibold text-(--theme-text)">
      <span className="block">{label}</span>
      {meta ? (
        <span className="mt-0.5 block text-[11px] font-medium uppercase tracking-[0.14em] opacity-70">
          {meta}
        </span>
      ) : null}
    </span>
  ) : (
    <Link
      className="block rounded-2xl px-3 py-2 text-sm text-(--theme-text) no-underline transition hover:bg-(--theme-elevation-50) hover:text-(--theme-text)"
      href={href}
    >
      <span className="block">{label}</span>
      {meta ? (
        <span className="mt-0.5 block text-[11px] font-medium uppercase tracking-[0.14em] opacity-60">
          {meta}
        </span>
      ) : null}
    </Link>
  )
}

export default function CourseNavigationPanel({
  navigation,
  variant = 'page',
}: {
  navigation: EditorialCourseNavigation
  variant?: 'nav' | 'page'
}) {
  return (
    <div
      className={
        variant === 'nav'
          ? 'editorial-course-nav-panel'
          : 'editorial-course-nav-panel rounded-4xl border border-(--theme-elevation-150) bg-(--theme-elevation-0) p-4 shadow-sm'
      }
    >
      <div className="grid gap-6">
        <section className="grid gap-3">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-(--theme-text) opacity-60">
              Product context
            </h2>
            <p className="mt-1 text-sm text-(--theme-text) opacity-70">
              Project lineage stays here so the course outline can stay dense.
            </p>
          </div>

          <div className="grid gap-2 rounded-3xl border border-(--theme-elevation-100) bg-(--theme-elevation-50) p-3">
            <TreeLink
              current={navigation.productContext.project.current}
              href={navigation.productContext.project.href}
              label={navigation.productContext.project.label}
              meta="Project"
            />
            <div className="ml-4 border-l border-(--theme-elevation-150) pl-3">
              <TreeLink
                current={navigation.productContext.group.current}
                href={navigation.productContext.group.href}
                label={navigation.productContext.group.label}
                meta="Project group"
              />
              <div className="ml-4 mt-2 border-l border-(--theme-elevation-150) pl-3">
                <TreeLink
                  current={navigation.productContext.product.current}
                  href={navigation.productContext.product.href}
                  label={navigation.productContext.product.label}
                  meta="Product"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-3">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-(--theme-text) opacity-60">
              Course outline
            </h2>
            <p className="mt-1 text-sm text-(--theme-text) opacity-70">
              Full course tree with chapters, pages, and content items.
            </p>
          </div>

          <div className="grid gap-3">
            <TreeLink
              current={navigation.course.current}
              href={navigation.course.href}
              label={navigation.course.label}
              meta="Course"
            />

            <div className="grid gap-3">
              {navigation.course.chapters.map((chapter) => (
                <div key={chapter.id} className="ml-3 border-l border-(--theme-elevation-150) pl-3">
                  <TreeLink
                    current={chapter.current}
                    href={chapter.href}
                    label={chapter.label}
                    meta="Chapter"
                  />

                  {chapter.pages.length > 0 ? (
                    <div className="mt-2 grid gap-2">
                      {chapter.pages.map((page) => (
                        <div
                          key={page.id}
                          className="ml-3 border-l border-(--theme-elevation-150) pl-3"
                        >
                          <TreeLink
                            current={page.current}
                            href={page.href}
                            label={page.label}
                            meta="Page"
                          />

                          {page.contentItems.length > 0 ? (
                            <div className="mt-2 grid gap-1.5">
                              {page.contentItems.map((content) => (
                                <div
                                  key={content.id}
                                  className="ml-3 border-l border-(--theme-elevation-150) pl-3"
                                >
                                  <TreeLink
                                    current={content.current}
                                    href={content.href}
                                    label={content.label}
                                    meta={content.contentType}
                                  />
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
