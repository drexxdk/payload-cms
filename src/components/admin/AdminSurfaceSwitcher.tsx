'use client'

import { useAuth } from '@payloadcms/ui'
import { usePathname } from 'next/navigation'

import { useAdminSurface } from './AdminSurfaceContext'

type AuthUser = {
  roles?: string[] | null
}

function isSuperAdmin(user: AuthUser | null | undefined) {
  return Array.isArray(user?.roles) && user.roles.includes('super-admin')
}

export default function AdminSurfaceSwitcher() {
  const pathname = usePathname()
  const { user } = useAuth<AuthUser>()
  const { setSurface, surface } = useAdminSurface()

  if (pathname !== '/admin') {
    return null
  }

  if (!isSuperAdmin(user)) {
    return null
  }

  return (
    <div className="mx-auto box-border w-full max-w-7xl">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[18px] border border-[color-mix(in_srgb,var(--theme-elevation-250)_84%,var(--theme-success-500)_16%)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--theme-elevation-100)_92%,var(--theme-success-500)_8%),color-mix(in_srgb,var(--theme-elevation-50)_94%,var(--theme-warning-500)_6%))] px-4 py-[0.85rem] max-[1440px]:rounded-[14px] max-[1440px]:px-[0.95rem] max-[1440px]:py-[0.8rem]">
        <div className="grid gap-[0.15rem]">
          <span className="text-[0.74rem] font-bold uppercase tracking-[0.16em] text-[color-mix(in_srgb,var(--theme-text)_72%,transparent)]">
            Surface
          </span>
          <p className="m-0 text-(--theme-text) opacity-90">
            Editorial is the shared content workspace. Administration is the maintenance surface.
          </p>
        </div>

        <div
          aria-label="Surface switcher"
          className="inline-flex gap-[0.35rem] rounded-full border border-[color-mix(in_srgb,var(--theme-elevation-250)_82%,var(--theme-elevation-1000)_18%)] p-1 [background:color-mix(in_srgb,var(--theme-elevation-0)_90%,var(--theme-elevation-1000)_10%)] [box-shadow:0_10px_24px_-18px_color-mix(in_srgb,var(--theme-elevation-1000)_55%,transparent)]"
          role="tablist"
        >
          <button
            aria-controls="admin-surface-panel-editorial"
            aria-selected={surface === 'editorial'}
            className={
              surface === 'editorial'
                ? 'rounded-full border-0 px-[0.95rem] py-[0.55rem] font-semibold text-(--theme-elevation-0) transition [background:var(--theme-elevation-900)]'
                : 'rounded-full border-0 bg-transparent px-[0.95rem] py-[0.55rem] font-semibold text-(--theme-text) transition hover:text-(--theme-text) [background:transparent] hover:[background:color-mix(in_srgb,var(--theme-elevation-100)_88%,var(--theme-success-500)_12%)] focus-visible:outline-none focus-visible:[box-shadow:0_0_0_2px_color-mix(in_srgb,var(--theme-success-500)_28%,transparent)]'
            }
            id="admin-surface-tab-editorial"
            onClick={() => setSurface('editorial')}
            role="tab"
            type="button"
          >
            Editorial
          </button>
          <button
            aria-controls="admin-surface-panel-administration"
            aria-selected={surface === 'administration'}
            className={
              surface === 'administration'
                ? 'rounded-full border-0 px-[0.95rem] py-[0.55rem] font-semibold text-(--theme-elevation-0) transition [background:var(--theme-elevation-900)]'
                : 'rounded-full border-0 bg-transparent px-[0.95rem] py-[0.55rem] font-semibold text-(--theme-text) transition hover:text-(--theme-text) [background:transparent] hover:[background:color-mix(in_srgb,var(--theme-elevation-100)_88%,var(--theme-success-500)_12%)] focus-visible:outline-none focus-visible:[box-shadow:0_0_0_2px_color-mix(in_srgb,var(--theme-success-500)_28%,transparent)]'
            }
            id="admin-surface-tab-administration"
            onClick={() => setSurface('administration')}
            role="tab"
            type="button"
          >
            Administration
          </button>
        </div>
      </div>
    </div>
  )
}
