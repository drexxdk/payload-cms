import type { CollectionConfig } from 'payload'
import type { User } from '../payload-types'

function hasRoles(u: unknown): u is User & { roles?: string[] } {
  return typeof u === 'object' && u !== null && Array.isArray((u as any).roles)
}

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'createdAt'],
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return { isPublic: { equals: true } }
      return true
    },
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => {
      if (!user) return false
      if (!hasRoles(user)) return false
      return (user.roles ?? []).includes('admin')
    },
  },
  timestamps: true,
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'projectType',
      type: 'relationship',
      relationTo: 'project-types',
      required: true,
      admin: {
        description: 'Select the project type (uses project-types collection)'
      }
    },
    {
      name: 'status',
      type: 'select',
      options: ['draft', 'active', 'archived'],
      defaultValue: 'draft',
      required: true,
    },
    
    {
      name: 'isPublic',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
}
