import type { CollectionConfig } from 'payload'
import {
  buildProjectEditAccess,
  buildProjectReadAccess,
  canEditProjectByID,
  relationshipID,
} from '../access/rbac'

export const Courses: CollectionConfig = {
  slug: 'courses',
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
      name: 'title',
      type: 'text',
      localized: true,
      required: true,
    },
    {
      name: 'project',
      type: 'relationship',
      relationTo: 'projects',
      required: true,
      admin: {
        description: 'Which project this course belongs to',
      },
    },
  ],
}
