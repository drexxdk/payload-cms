'use client'

import { CloseMenuIcon, LogOutIcon, MenuIcon, useNav } from '@payloadcms/ui'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'

import { isCourseRoute } from '@/lib/admin/courseRoute'
import type { EditorialCourseNavigation } from '@/lib/editorial'

import { AdminSurfaceProvider } from './AdminSurfaceContext'
import EditorialContextBanner from './editorial/EditorialContextBanner'
import CourseNavigationPanel from './editorial/CourseNavigationPanel'

function AdminBrandMark() {
  return (
    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-(--theme-elevation-200) bg-(--theme-elevation-0) text-(--theme-text)">
      <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none">
        <path
          d="M7 5.75A1.75 1.75 0 0 1 8.75 4h3.75a5.5 5.5 0 1 1 0 11H10v5H7V5.75Zm3 6.25h2.5a2.5 2.5 0 0 0 0-5H10v5Z"
          fill="currentColor"
        />
      </svg>
    </span>
  )
}

function AdminAccountIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 12a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Zm0 2.25c-4.013 0-7.5 2.023-7.5 4.5 0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75c0-2.477-3.487-4.5-7.5-4.5Z"
        fill="currentColor"
      />
    </svg>
  )
}

function HeaderIconLink({
  ariaLabel,
  children,
  href,
}: {
  ariaLabel: string
  children: React.ReactNode
  href: string
}) {
  return (
    <Link
      aria-label={ariaLabel}
      className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-(--theme-elevation-200) text-(--theme-text) no-underline"
      href={href}
    >
      {children}
    </Link>
  )
}

export default function AdminChromeShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { navOpen, setNavOpen } = useNav()
  const [courseNavigation, setCourseNavigation] = useState<EditorialCourseNavigation | null>(null)
  const previousCourseRouteActive = useRef(false)

  const locale = searchParams.get('locale')
  const courseRouteActive = useMemo(() => isCourseRoute(pathname), [pathname])
  const courseNavVisible = courseRouteActive && navOpen

  useEffect(() => {
    if (!courseRouteActive) {
      setNavOpen(false)
    }
  }, [courseRouteActive, setNavOpen])

  useEffect(() => {
    if (courseRouteActive && !previousCourseRouteActive.current) {
      setNavOpen(false)
    }

    previousCourseRouteActive.current = courseRouteActive
  }, [courseRouteActive, setNavOpen])

  useEffect(() => {
    if (!courseRouteActive || !navOpen) {
      setCourseNavigation(null)
      return
    }

    const controller = new AbortController()
    const params = new URLSearchParams({ pathname })

    if (locale) {
      params.set('locale', locale)
    }

    void (async () => {
      const response = await fetch(`/admin/editorial/api/course-navigation?${params.toString()}`, {
        cache: 'no-store',
        credentials: 'same-origin',
        signal: controller.signal,
      })

      if (!response.ok) {
        setCourseNavigation(null)
        return
      }

      const navigation = (await response.json()) as EditorialCourseNavigation
      setCourseNavigation(navigation)
    })().catch((error: unknown) => {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return
      }

      setCourseNavigation(null)
    })

    return () => controller.abort()
  }, [courseRouteActive, locale, navOpen, pathname])

  const closeNav = () => {
    setNavOpen(false)
  }

  return (
    <AdminSurfaceProvider>
      <div className="min-h-screen bg-[color-mix(in_srgb,var(--theme-elevation-50)_92%,var(--theme-elevation-0)_8%)] text-(--theme-text)">
        {courseNavVisible ? (
          <>
            <button
              aria-hidden="false"
              className="fixed inset-0 z-30 border-0 bg-[color-mix(in_srgb,var(--theme-elevation-1000)_30%,transparent)] transition-opacity duration-200 pointer-events-auto opacity-100 lg:hidden"
              onClick={closeNav}
              tabIndex={0}
              type="button"
            />

            <aside className="fixed inset-y-0 left-0 z-40 w-76 border-r border-(--theme-elevation-150) bg-[color-mix(in_srgb,var(--theme-elevation-0)_95%,var(--theme-elevation-100)_5%)] transition-transform duration-200 translate-x-0">
              <div className="flex h-full flex-col gap-6 overflow-y-auto p-4">
                <div className="flex min-h-15 items-center justify-between gap-3">
                  <Link
                    className="inline-flex items-center gap-3 text-(--theme-text) no-underline"
                    href="/admin"
                    onClick={closeNav}
                  >
                    <AdminBrandMark />
                    <span className="text-[0.98rem] font-bold uppercase tracking-[0.04em]">
                      Course navigation
                    </span>
                  </Link>

                  <button
                    aria-label="Close navigation"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-(--theme-elevation-200) bg-(--theme-elevation-0) text-(--theme-text) transition hover:bg-(--theme-elevation-50)"
                    onClick={closeNav}
                    type="button"
                  >
                    <CloseMenuIcon />
                  </button>
                </div>

                <nav aria-label="Course navigation" className="grid gap-5">
                  <section className="border-t border-(--theme-elevation-150) pt-4">
                    {courseNavigation ? (
                      <CourseNavigationPanel navigation={courseNavigation} variant="nav" />
                    ) : (
                      <div className="rounded-2xl border border-dashed border-(--theme-elevation-200) p-4 text-sm opacity-75">
                        Loading course navigation...
                      </div>
                    )}
                  </section>
                </nav>
              </div>
            </aside>
          </>
        ) : null}

        <div
          className={`min-h-screen transition-[padding-left] duration-200 ${courseNavVisible ? 'lg:pl-76' : ''}`}
        >
          <header
            className={`fixed top-0 z-20 border-b border-(--theme-elevation-150) bg-[color-mix(in_srgb,var(--theme-elevation-0)_94%,transparent)] backdrop-blur-md transition-[left] duration-200 inset-x-0 ${courseNavVisible ? 'lg:left-76' : 'lg:left-0'}`}
          >
            <div className="flex min-h-19 items-center justify-between gap-4 px-4 md:px-5">
              <div className="flex items-center gap-4">
                {courseRouteActive ? (
                  <button
                    aria-expanded={navOpen}
                    aria-label={navOpen ? 'Close navigation' : 'Open navigation'}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-(--theme-elevation-200) bg-(--theme-elevation-0) text-(--theme-text) transition hover:bg-(--theme-elevation-50)"
                    onClick={() => setNavOpen(!navOpen)}
                    type="button"
                  >
                    {navOpen ? <CloseMenuIcon /> : <MenuIcon />}
                  </button>
                ) : null}

                <Link
                  className="inline-flex items-center gap-3 text-(--theme-text) no-underline"
                  href="/admin"
                >
                  <AdminBrandMark />
                  <span className="hidden text-[0.98rem] font-bold uppercase tracking-[0.04em] lg:inline">
                    Admin
                  </span>
                </Link>
              </div>

              <div className="flex items-center gap-3">
                <HeaderIconLink ariaLabel="Account" href="/admin/account">
                  <AdminAccountIcon />
                </HeaderIconLink>
                <HeaderIconLink ariaLabel="Log out" href="/admin/logout">
                  <LogOutIcon />
                </HeaderIconLink>
              </div>
            </div>
          </header>

          <main className="pt-24">
            <div className="grid gap-4 px-4 pb-8 md:px-5">
              <EditorialContextBanner />
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminSurfaceProvider>
  )
}
