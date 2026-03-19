import type { CollectionConfig, PayloadRequest } from 'payload'
import { isSuperAdmin } from '../access/rbac'

const ROLE_OPTIONS = [
  { label: 'Super Admin', value: 'super-admin' },
  { label: 'User', value: 'user' },
]

const canManageRoles = async ({ req }: { req: PayloadRequest }) => {
  // Only super-admins may manage roles via the admin UI.
  // The initial user (when no users exist) will be assigned `super-admin`
  // by the server-side `beforeChange` hook, and the field should be hidden.
  return isSuperAdmin(req.user)
}

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    group: 'Access & People',
    description: 'Authenticated users with global roles and project-scoped memberships.',
    defaultColumns: ['email', 'roles', 'viewableProjects', 'editableProjects', 'managedProjects'],
  },
  auth: true,
  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        if (operation !== 'create') return data

        const existingUsers = await req.payload.find({
          collection: 'users',
          depth: 0,
          limit: 1,
        })

        if (existingUsers.totalDocs === 0) {
          return {
            ...data,
            roles: ['super-admin'],
          }
        }

        return data
      },
    ],
  },
  fields: [
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      options: ROLE_OPTIONS,
      defaultValue: ['user'],
      required: true,
      saveToJWT: true,
      admin: {
        condition: ({ req }) => isSuperAdmin(req?.user),
      },
      access: {
        create: canManageRoles,
        update: canManageRoles,
      },
    },
    {
      name: 'viewableProjects',
      type: 'join',
      collection: 'projects',
      on: 'viewers',
      access: {
        read: ({ req }) => isSuperAdmin(req.user),
      },
      admin: {
        defaultColumns: ['title', 'status', 'createdAt'],
      },
    },
    {
      name: 'editableProjects',
      type: 'join',
      collection: 'projects',
      on: 'editors',
      access: {
        read: ({ req }) => isSuperAdmin(req.user),
      },
      admin: {
        defaultColumns: ['title', 'status', 'createdAt'],
      },
    },
    {
      name: 'managedProjects',
      type: 'join',
      collection: 'projects',
      on: 'managers',
      access: {
        read: ({ req }) => isSuperAdmin(req.user),
      },
      admin: {
        defaultColumns: ['title', 'status', 'createdAt'],
      },
    },
  ],
}
