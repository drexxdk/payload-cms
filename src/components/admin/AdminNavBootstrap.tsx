'use client'

import { useNav } from '@payloadcms/ui'
import { useLayoutEffect } from 'react'

import AdminSurfaceSwitcher from './AdminSurfaceSwitcher'
import EditorialContextBanner from './editorial/EditorialContextBanner'

const desktopNavBreakpoint = '(max-width: 1440px)'

export default function AdminNavBootstrap({ children }: { children?: React.ReactNode }) {
  const { setNavOpen } = useNav()

  useLayoutEffect(() => {
    // Payload can briefly reuse the server-side open nav state on narrower widths
    // before breakpoint hydration settles. Closing it in a layout effect prevents
    // the visible sidebar flash without forcing the shell layout through CSS.
    if (window.matchMedia(desktopNavBreakpoint).matches) {
      setNavOpen(false)
    }
  }, [setNavOpen])

  return (
    <>
      <AdminSurfaceSwitcher />
      <EditorialContextBanner />
      {children}
    </>
  )
}
