import type { CollectionConfig } from 'payload'
import {
  buildProjectEditAccess,
  buildProjectReadAccess,
  canEditProjectByID,
  relationshipID,
} from '../access/rbac'

export const ProjectGroups: CollectionConfig = {
  slug: 'project-groups',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'project', 'createdAt'],
  },
  access: {
    read: ({ req: { user } }) => buildProjectReadAccess(user, 'project.'),
    create: async ({ req, data }) => canEditProjectByID(req, relationshipID(data?.project)),
    update: ({ req: { user } }) => buildProjectEditAccess(user, 'project.'),
    delete: ({ req: { user } }) => buildProjectEditAccess(user, 'project.'),
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
      name: 'products',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      admin: {
        description: 'Products contained in this project group',
      },
    },
    {
      name: 'title',
      type: 'text',
      localized: true,
      required: true,
    },
  ],
}
