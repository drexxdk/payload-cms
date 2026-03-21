import type { DefaultTemplateProps } from '@payloadcms/next/templates'

import AdminChromeShell from './AdminChromeShell'

export default function AdminShellTemplate({ children, req }: DefaultTemplateProps) {
  if (!req) {
    return children
  }

  return <AdminChromeShell>{children}</AdminChromeShell>
}
