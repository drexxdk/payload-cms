'use client'

import { usePathname } from 'next/navigation'
import { useNav } from '@payloadcms/ui'
import { useLayoutEffect } from 'react'

import { isCourseRoute } from '@/lib/admin/courseRoute'

import { AdminSurfaceProvider } from './AdminSurfaceContext'
import CourseNavPortal from './CourseNavPortal'
import EditorialContextBanner from './editorial/EditorialContextBanner'

export default function AdminNavBootstrap({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname()
  const { navOpen, setNavOpen } = useNav()
  const courseRouteActive = isCourseRoute(pathname)

  useLayoutEffect(() => {
    document.body.classList.toggle('editorial-course-route-active', courseRouteActive)

    if (!courseRouteActive) {
      setNavOpen(false)
      return () => {
        document.body.classList.remove('editorial-course-route-active')
      }
    }

    setNavOpen(false)

    return () => {
      document.body.classList.remove('editorial-course-route-active')
    }
  }, [courseRouteActive, setNavOpen])

  return (
    <AdminSurfaceProvider>
      <EditorialContextBanner />
      {courseRouteActive && navOpen ? <CourseNavPortal /> : null}
      {children}
    </AdminSurfaceProvider>
  )
}
