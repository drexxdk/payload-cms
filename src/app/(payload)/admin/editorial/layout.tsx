import { initI18n } from '@payloadcms/translations'
import { redirect } from 'next/navigation'
import config from '@payload-config'
import { getVisibleEntities } from '@payloadcms/ui/shared'
import { headers as getHeaders } from 'next/headers'
import {
  createLocalReq,
  executeAuthStrategies,
  getAccessResults,
  getPayload,
  getRequestLanguage,
  parseCookies,
} from 'payload'
import type { ReactNode } from 'react'

import AdminShellTemplate from '@/components/admin/AdminShellTemplate'

export default async function EditorialLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<Record<string, string | string[] | undefined>>
}) {
  const resolvedParams = await params
  const headers = await getHeaders()
  const cookies = parseCookies(headers)
  const payload = await getPayload({ config })
  const languageCode = getRequestLanguage({
    config: payload.config,
    cookies,
    headers,
  })
  const i18n = await initI18n({
    config: payload.config.i18n,
    context: 'client',
    language: languageCode,
  })
  const { responseHeaders, user } = await executeAuthStrategies({
    headers,
    payload,
  })
  const req = await createLocalReq(
    {
      req: {
        headers,
        host: headers.get('host') ?? undefined,
        i18n,
        responseHeaders,
        user,
      },
    },
    payload,
  )
  const permissions = await getAccessResults({ req })

  if (!req.user) {
    redirect('/admin/login')
  }

  const visibleEntities = getVisibleEntities({ req })

  return (
    <AdminShellTemplate
      i18n={req.i18n}
      params={resolvedParams}
      payload={payload}
      permissions={permissions}
      req={req}
      user={req.user}
      visibleEntities={{
        collections: visibleEntities?.collections,
        globals: visibleEntities?.globals,
      }}
    >
      {children}
    </AdminShellTemplate>
  )
}
