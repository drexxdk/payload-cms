'use client'

import { CloseMenuIcon, LogOutIcon, MenuIcon, useNav } from '@payloadcms/ui'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'

import { isCourseRoute } from '@/lib/admin/courseRoute'
import type { EditorialCourseNavigation } from '@/lib/editorial'

import { AdminSurfaceProvider } from './AdminSurfaceContext'
import CourseNavigationPanel from './editorial/CourseNavigationPanel'
import clsx from 'clsx'

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
      <main className="min-h-dvh flex">
        <aside
          className={clsx(
            'border-r-gray-500 border-r transition-[margin-left] duration-200 overflow-y-auto overflow-x-hidden shrink-0 w-80 h-dvh sticky top-0 flex flex-col',
            courseNavVisible ? 'ml-0' : '-ml-80',
          )}
        >
          <header className="sticky top-0 bg-black border-b border-b-gray-500 p-2 z-10 gap-2 justify-between flex items-center">
            <Link
              className="inline-flex items-center gap-3 text-(--theme-text) no-underline"
              href="/admin"
              onClick={closeNav}
            >
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
          </header>
          <div className="p-4">
            {courseNavigation ? (
              <CourseNavigationPanel navigation={courseNavigation} variant="nav" />
            ) : (
              <p>Loading course navigation...</p>
            )}
          </div>
        </aside>
        <div className="grow flex flex-col">
          <header className="sticky top-0 left-0 right-0 flex justify-between p-2 bg-black border-b border-b-gray-500 z-10">
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
          </header>
          <div className="grid gap-4 col-span-1">{children}</div>
        </div>
      </main>
    </AdminSurfaceProvider>
  )
}
