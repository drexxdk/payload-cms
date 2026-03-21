'use client'

import { useAuth } from '@payloadcms/ui'
import { usePathname, useSearchParams } from 'next/navigation'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

export type AdminSurface = 'administration' | 'editorial'

type AuthUser = {
  roles?: string[] | null
}

type AdminSurfaceContextValue = {
  canAccessAdministration: boolean
  setSurface: (surface: AdminSurface) => void
  surface: AdminSurface
}

const AdminSurfaceContext = createContext<AdminSurfaceContextValue | null>(null)

function isSuperAdmin(user: AuthUser | null | undefined) {
  return Array.isArray(user?.roles) && user.roles.includes('super-admin')
}

function normalizeSurface(surface: string | null, canAccessAdministration: boolean): AdminSurface {
  if (canAccessAdministration && surface === 'administration') {
    return 'administration'
  }

  return 'editorial'
}

export function AdminSurfaceProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { user } = useAuth<AuthUser>()
  const canAccessAdministration = isSuperAdmin(user)
  const requestedSurface = searchParams.get('surface')
  const [surface, setSurfaceState] = useState<AdminSurface>(
    normalizeSurface(requestedSurface, canAccessAdministration),
  )

  useEffect(() => {
    if (pathname !== '/admin') {
      setSurfaceState('editorial')
      return
    }

    setSurfaceState(normalizeSurface(requestedSurface, canAccessAdministration))
  }, [canAccessAdministration, pathname, requestedSurface])

  const setSurface = useCallback(
    (nextSurface: AdminSurface) => {
      const normalizedSurface = normalizeSurface(nextSurface, canAccessAdministration)

      setSurfaceState(normalizedSurface)

      if (pathname !== '/admin') {
        return
      }

      const url = new URL(window.location.href)

      if (normalizedSurface === 'administration') {
        url.searchParams.set('surface', 'administration')
      } else {
        url.searchParams.delete('surface')
      }

      window.history.replaceState(
        window.history.state,
        '',
        `${url.pathname}${url.search}${url.hash}`,
      )
    },
    [canAccessAdministration, pathname],
  )

  const value = useMemo<AdminSurfaceContextValue>(
    () => ({ canAccessAdministration, setSurface, surface }),
    [canAccessAdministration, setSurface, surface],
  )

  return <AdminSurfaceContext.Provider value={value}>{children}</AdminSurfaceContext.Provider>
}

export function useAdminSurface() {
  const context = useContext(AdminSurfaceContext)

  if (!context) {
    throw new Error('useAdminSurface must be used within AdminSurfaceProvider')
  }

  return context
}
