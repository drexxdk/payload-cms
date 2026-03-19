import type { CollectionConfig } from 'payload'

const ROLE_OPTIONS = ['admin', 'editor', 'user']
const canManageRoles = ({
  req: { user },
}: {
  req: { user?: { roles?: string[] | null } | null }
}) => Array.isArray(user?.roles) && user.roles.includes('admin')

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
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
