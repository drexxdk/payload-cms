'use client'

import { useAuth } from '@payloadcms/ui'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type AuthUser = {
  roles?: string[] | null
}

const hiddenPrefixes = ['/admin/login', '/admin/logout', '/admin/forgot', '/admin/reset']

function isSuperAdmin(user: AuthUser | null | undefined) {
  return Array.isArray(user?.roles) && user.roles.includes('super-admin')
}

export default function AdminSurfaceSwitcher() {
  const pathname = usePathname()
  const { user } = useAuth<AuthUser>()

  if (!pathname.startsWith('/admin')) {
    return null
  }

  if (hiddenPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return null
  }

  if (!isSuperAdmin(user)) {
    return null
  }

  const inEditorial = pathname.startsWith('/admin/editorial')

  return (
    <div className="admin-surface-switcher">
      <div className="admin-surface-switcher__inner">
        <div className="admin-surface-switcher__copy">
          <span className="admin-surface-switcher__eyebrow">Surface</span>
          <p className="admin-surface-switcher__description">
            Editorial is the shared content workspace. Administration is the maintenance surface.
          </p>
        </div>

        <nav aria-label="Surface switcher" className="admin-surface-switcher__nav">
          <Link
            aria-current={inEditorial ? 'page' : undefined}
            className={
              inEditorial
                ? 'admin-surface-switcher__link admin-surface-switcher__link--active'
                : 'admin-surface-switcher__link'
            }
            href="/admin/editorial"
          >
            Editorial
          </Link>
          <Link
            aria-current={!inEditorial ? 'page' : undefined}
            className={
              !inEditorial
                ? 'admin-surface-switcher__link admin-surface-switcher__link--active'
                : 'admin-surface-switcher__link'
            }
            href="/admin"
          >
            Administration
          </Link>
        </nav>
      </div>
    </div>
  )
}
