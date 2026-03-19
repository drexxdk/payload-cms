'use client'

import { useNav } from '@payloadcms/ui'
import { useLayoutEffect } from 'react'

const desktopNavBreakpoint = '(max-width: 1440px)'

export default function AdminNavBootstrap({ children }: { children?: React.ReactNode }) {
  const { setNavOpen } = useNav()

  useLayoutEffect(() => {
    if (window.matchMedia(desktopNavBreakpoint).matches) {
      setNavOpen(false)
    }
  }, [setNavOpen])

  return children
}
