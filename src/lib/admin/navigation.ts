export type AdminNavItem = {
  href: string
  label: string
  slug: string
  type: 'collections' | 'globals' | 'workspace'
}

export type AdminNavGroup = {
  items: AdminNavItem[]
  label: string
}
