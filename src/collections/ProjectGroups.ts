import type { CollectionConfig } from 'payload'

export const ProjectGroups: CollectionConfig = {
  slug: 'project-groups',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'createdAt'],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  timestamps: true,
  fields: [
    {
      name: 'project',
      type: 'relationship',
      relationTo: 'projects',
      required: true,
      admin: {
        description: 'Parent project for this group',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'courses',
      type: 'relationship',
      relationTo: 'courses',
      hasMany: true,
      admin: {
        description: 'Courses assigned to this group',
      },
    },
  ],
}
