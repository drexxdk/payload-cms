import type { CollectionConfig, PayloadRequest } from 'payload'
import { isSuperAdmin } from '../access/rbac'

const ROLE_OPTIONS = [
  { label: 'Super Admin', value: 'super-admin' },
  { label: 'User', value: 'user' },
]

const canManageRoles = async ({ req }: { req: PayloadRequest }) => {
  if (isSuperAdmin(req.user)) return true

  const existingUsers = await req.payload.find({
    collection: 'users',
    depth: 0,
    limit: 1,
  })

  return existingUsers.totalDocs === 0
}

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
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
      access: {
        create: canManageRoles,
        update: canManageRoles,
      },
    },
  ],
}
