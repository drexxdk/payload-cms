'use client'

import type { ReactNode } from 'react'

import { useAdminSurface } from './AdminSurfaceContext'

export default function AdminDashboardPanels({
  administration,
  canAccessAdministration,
  editorial,
}: {
  administration?: ReactNode
  canAccessAdministration: boolean
  editorial: ReactNode
}) {
  const { surface } = useAdminSurface()
  const activeSurface =
    canAccessAdministration && surface === 'administration' ? surface : 'editorial'

  return (
    <div className="admin-dashboard-panels">
      <section
        aria-labelledby="admin-surface-tab-editorial"
        hidden={activeSurface !== 'editorial'}
        id="admin-surface-panel-editorial"
        role="tabpanel"
      >
        {editorial}
      </section>

      {canAccessAdministration && administration ? (
        <section
          aria-labelledby="admin-surface-tab-administration"
          hidden={activeSurface !== 'administration'}
          id="admin-surface-panel-administration"
          role="tabpanel"
        >
          {administration}
        </section>
      ) : null}
    </div>
  )
}
