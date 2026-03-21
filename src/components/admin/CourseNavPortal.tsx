'use client'

import { useNav } from '@payloadcms/ui'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

import CourseNavigationPanel from '@/components/admin/editorial/CourseNavigationPanel'
import { isCourseRoute } from '@/lib/admin/courseRoute'
import type { EditorialCourseNavigation } from '@/lib/editorial'

export default function CourseNavPortal() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { navOpen } = useNav()
  const [navigation, setNavigation] = useState<EditorialCourseNavigation | null>(null)
  const [navWrap, setNavWrap] = useState<HTMLElement | null>(null)

  const locale = searchParams.get('locale')
  const active = useMemo(() => isCourseRoute(pathname), [pathname])
  const activeAndOpen = active && navOpen

  useLayoutEffect(() => {
    setNavWrap(document.querySelector<HTMLElement>('.nav__wrap'))
  }, [pathname])

  useLayoutEffect(() => {
    if (!navWrap) return

    if (activeAndOpen) {
      navWrap.classList.add('editorial-course-shell-nav-active')
    } else {
      navWrap.classList.remove('editorial-course-shell-nav-active')
    }

    return () => {
      navWrap.classList.remove('editorial-course-shell-nav-active')
    }
  }, [activeAndOpen, navWrap])

  useEffect(() => {
    if (!activeAndOpen) {
      setNavigation(null)
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
        setNavigation(null)
        return
      }

      const nextNavigation = (await response.json()) as EditorialCourseNavigation
      setNavigation(nextNavigation)
    })().catch((error: unknown) => {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return
      }

      setNavigation(null)
    })

    return () => controller.abort()
  }, [activeAndOpen, locale, pathname])

  if (!activeAndOpen || !navWrap || !navigation) {
    return null
  }

  return createPortal(
    <div className="editorial-course-shell-nav-portal">
      <div className="editorial-course-shell-nav__content">
        <CourseNavigationPanel navigation={navigation} variant="nav" />
      </div>

      <div className="nav__controls">
        <Link aria-label="Log out" className="nav__log-out" href="/admin/logout" prefetch={false}>
          <svg aria-hidden="true" className="icon icon--logout" viewBox="0 0 24 24">
            <path
              className="stroke"
              d="M15 7.5V5.75A1.75 1.75 0 0 0 13.25 4h-6.5A1.75 1.75 0 0 0 5 5.75v12.5C5 19.2165 5.7835 20 6.75 20h6.5A1.75 1.75 0 0 0 15 18.25V16.5M10 12h9m0 0-2.75-2.75M19 12l-2.75 2.75"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
          </svg>
        </Link>
      </div>
    </div>,
    navWrap,
  )
}
