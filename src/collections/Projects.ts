import type { CollectionConfig, PayloadRequest } from 'payload'
import {
  buildProjectEditAccess,
  buildProjectReadAccess,
  canManageProjectMembers,
  isSuperAdmin,
} from '../access/rbac'

function summarizeUsers(value: unknown): string {
  if (!Array.isArray(value) || value.length === 0) return 'None'

  const labels = value.map((entry) => {
    if (typeof entry === 'number') return `User #${entry}`
    if (typeof entry !== 'object' || entry === null) return 'Unknown'

    const candidate = entry as { email?: unknown; id?: unknown }
    if (typeof candidate.email === 'string') return candidate.email
    if (typeof candidate.id === 'number') return `User #${candidate.id}`
    return 'Unknown'
  })

  if (labels.length <= 2) return labels.join(', ')

  return `${labels.slice(0, 2).join(', ')} +${labels.length - 2}`
}

async function summarizeUsersForAdmin(req: PayloadRequest, value: unknown) {
  if (!Array.isArray(value) || value.length === 0) return 'None'
  if (!isSuperAdmin(req.user)) return summarizeUsers(value)

  const ids = value
    .map((entry) => {
      if (typeof entry === 'number') return entry
      if (typeof entry !== 'object' || entry === null) return null

      const candidate = entry as { id?: unknown }
      return typeof candidate.id === 'number' ? candidate.id : null
    })
    .filter((id): id is number => id !== null)

  if (ids.length === 0) return summarizeUsers(value)

  const users = await req.payload.find({
    collection: 'users',
    where: {
      id: {
        in: ids,
      },
    },
    depth: 0,
    limit: ids.length,
    overrideAccess: false,
    req,
  })

  const emailByID = new Map(users.docs.map((user) => [user.id, user.email]))
  const labels = ids.map((id) => emailByID.get(id) ?? `User #${id}`)

  if (labels.length <= 2) return labels.join(', ')

  return `${labels.slice(0, 2).join(', ')} +${labels.length - 2}`
}

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
    defaultColumns: [
      'title',
      'status',
      'viewerSummary',
      'editorSummary',
      'managerSummary',
      'createdAt',
    ],
  },
  access: {
    read: ({ req: { user } }) => buildProjectReadAccess(user),
    create: ({ req: { user } }) => isSuperAdmin(user),
    update: ({ req: { user } }) => buildProjectEditAccess(user),
    delete: ({ req: { user } }) => isSuperAdmin(user),
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
      name: 'description',
      type: 'richText',
    },
    {
      name: 'projectType',
      type: 'relationship',
      relationTo: 'project-types',
      required: true,
      admin: {
        description: 'Select the project type (uses project-types collection)',
      },
    },
    {
      name: 'groups',
      type: 'join',
      collection: 'project-groups',
      on: 'project',
      admin: {
        description: 'Child project groups',
        defaultColumns: ['title', 'createdAt'],
      },
    },
    {
      name: 'courses',
      type: 'join',
      collection: 'courses',
      on: 'project',
      admin: {
        defaultColumns: ['title', 'createdAt'],
      },
    },
    {
      name: 'viewers',
      type: 'relationship',
      relationTo: 'users',
      hasMany: true,
      admin: {
        description: 'Users who can view this project.',
      },
      access: {
        create: ({ req: { user } }) => isSuperAdmin(user),
        update: ({ req: { user }, doc }) => canManageProjectMembers(user, doc),
      },
    },
    {
      name: 'editors',
      type: 'relationship',
      relationTo: 'users',
      hasMany: true,
      admin: {
        description: 'Users who can edit this project and its child content.',
      },
      access: {
        create: ({ req: { user } }) => isSuperAdmin(user),
        update: ({ req: { user }, doc }) => canManageProjectMembers(user, doc),
      },
    },
    {
      name: 'managers',
      type: 'relationship',
      relationTo: 'users',
      hasMany: true,
      admin: {
        description: 'Users who can manage project memberships.',
      },
      access: {
        create: ({ req: { user } }) => isSuperAdmin(user),
        update: ({ req: { user } }) => isSuperAdmin(user),
      },
    },
    {
      name: 'viewerSummary',
      type: 'text',
      virtual: true,
      admin: {
        readOnly: true,
      },
      access: {
        read: ({ req: { user } }) => isSuperAdmin(user),
      },
      hooks: {
        afterRead: [({ siblingData, req }) => summarizeUsersForAdmin(req, siblingData.viewers)],
      },
    },
    {
      name: 'editorSummary',
      type: 'text',
      virtual: true,
      admin: {
        readOnly: true,
      },
      access: {
        read: ({ req: { user } }) => isSuperAdmin(user),
      },
      hooks: {
        afterRead: [({ siblingData, req }) => summarizeUsersForAdmin(req, siblingData.editors)],
      },
    },
    {
      name: 'managerSummary',
      type: 'text',
      virtual: true,
      admin: {
        readOnly: true,
      },
      access: {
        read: ({ req: { user } }) => isSuperAdmin(user),
      },
      hooks: {
        afterRead: [({ siblingData, req }) => summarizeUsersForAdmin(req, siblingData.managers)],
      },
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
