import type { CollectionConfig } from 'payload'
import type { User } from '../payload-types'

function hasRoles(u: unknown): u is User & { roles?: string[] } {
  if (typeof u !== 'object' || u === null) return false

  const candidate = u as { roles?: unknown }
  return Array.isArray(candidate.roles)
}

export const ProjectTypes: CollectionConfig = {
  slug: 'project-types',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['id', 'title'],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => {
      if (!user) return false
      if (!hasRoles(user)) return false
      return (user.roles ?? []).length > 0
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      if (!hasRoles(user)) return false
      return (user.roles ?? []).includes('admin')
    },
    delete: ({ req: { user } }) => {
      if (!user) return false
      if (!hasRoles(user)) return false
      return (user.roles ?? []).includes('admin')
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
  ],
}
