import type { CollectionConfig } from 'payload'
import { isSuperAdmin } from '../access/rbac'

export const ProjectTypes: CollectionConfig = {
  slug: 'project-types',
  admin: {
    useAsTitle: 'title',
    group: 'Delivery',
    description: 'Reference types that classify projects and help organize delivery work.',
    defaultColumns: ['title', 'description'],
  },
  access: {
    read: () => true,
    create: () => false,
    update: ({ req: { user } }) => isSuperAdmin(user),
    delete: () => false,
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
    {
      name: 'projects',
      type: 'join',
      collection: 'projects',
      on: 'projectType',
      admin: {
        defaultColumns: ['title', 'status', 'createdAt'],
      },
    },
  ],
}
