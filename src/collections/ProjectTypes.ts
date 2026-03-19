import type { CollectionConfig } from 'payload'
import { isSuperAdmin } from '../access/rbac'

export const ProjectTypes: CollectionConfig = {
  slug: 'project-types',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['id', 'title'],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => isSuperAdmin(user),
    update: ({ req: { user } }) => isSuperAdmin(user),
    delete: ({ req: { user } }) => isSuperAdmin(user),
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
