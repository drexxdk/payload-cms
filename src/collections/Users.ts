import type { CollectionConfig, PayloadRequest } from 'payload'
import { isSuperAdmin } from '../access/rbac'

const ROLE_OPTIONS = [
  {
    label: {
      en: 'Super Admin',
      da: 'Superadministrator',
      de: 'Superadmin',
      fr: 'Super administrateur',
    },
    value: 'super-admin',
  },
  {
    label: {
      en: 'User',
      da: 'Bruger',
      de: 'Benutzer',
      fr: 'Utilisateur',
    },
    value: 'user',
  },
]

const canManageRoles = async ({ req }: { req: PayloadRequest }) => {
  // Only super-admins may manage roles via the admin UI.
  // The initial user (when no users exist) will be assigned `super-admin`
  // by the server-side `beforeChange` hook, and the field should be hidden.
  return isSuperAdmin(req.user)
}

const showProjectMembershipField = (
  data: Partial<{ id?: number | string }>,
  user: PayloadRequest['user'],
) => isSuperAdmin(user) && data?.id !== user?.id

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: {
      en: 'User',
      da: 'Bruger',
      de: 'Benutzer',
      fr: 'Utilisateur',
    },
    plural: {
      en: 'Users',
      da: 'Brugere',
      de: 'Benutzer',
      fr: 'Utilisateurs',
    },
  },
  admin: {
    useAsTitle: 'email',
    group: {
      en: 'Access & People',
      da: 'Adgang og personer',
      de: 'Zugriff und Personen',
      fr: 'Acces et personnes',
    },
    description: {
      en: 'Authenticated users with global roles and project-scoped memberships.',
      da: 'Autentificerede brugere med globale roller og projektafgrænsede medlemskaber.',
      de: 'Authentifizierte Benutzer mit globalen Rollen und projektspezifischen Mitgliedschaften.',
      fr: 'Utilisateurs authentifies avec des roles globaux et des appartenances liees aux projets.',
    },
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
      label: {
        en: 'Roles',
        da: 'Roller',
        de: 'Rollen',
        fr: 'Roles',
      },
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
      label: {
        en: 'Viewable Projects',
        da: 'Synlige projekter',
        de: 'Sichtbare Projekte',
        fr: 'Projets consultables',
      },
      type: 'join',
      collection: 'projects',
      on: 'viewers',
      access: {
        read: ({ req }) => isSuperAdmin(req.user),
      },
      admin: {
        components: {
          Field: '/components/admin/UserProjectAssociationsField',
        },
        condition: (data, _, { user }) => showProjectMembershipField(data, user),
        defaultColumns: ['title', '_status', 'lifecycle', 'createdAt'],
      },
    },
    {
      name: 'editableProjects',
      label: {
        en: 'Editable Projects',
        da: 'Redigerbare projekter',
        de: 'Bearbeitbare Projekte',
        fr: 'Projets modifiables',
      },
      type: 'join',
      collection: 'projects',
      on: 'editors',
      access: {
        read: ({ req }) => isSuperAdmin(req.user),
      },
      admin: {
        components: {
          Field: '/components/admin/UserProjectAssociationsField',
        },
        condition: (data, _, { user }) => showProjectMembershipField(data, user),
        defaultColumns: ['title', '_status', 'lifecycle', 'createdAt'],
      },
    },
    {
      name: 'managedProjects',
      label: {
        en: 'Managed Projects',
        da: 'Administrerede projekter',
        de: 'Verwaltete Projekte',
        fr: 'Projets geres',
      },
      type: 'join',
      collection: 'projects',
      on: 'managers',
      access: {
        read: ({ req }) => isSuperAdmin(req.user),
      },
      admin: {
        components: {
          Field: '/components/admin/UserProjectAssociationsField',
        },
        condition: (data, _, { user }) => showProjectMembershipField(data, user),
        defaultColumns: ['title', '_status', 'lifecycle', 'createdAt'],
      },
    },
  ],
}
