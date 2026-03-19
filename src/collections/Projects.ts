import { getTranslation } from '@payloadcms/translations'
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
  const translate = (label: Parameters<typeof getTranslation>[0]) => getTranslation(label, req.i18n)

  if (!Array.isArray(value) || value.length === 0) {
    return translate({
      en: 'None',
      da: 'Ingen',
      de: 'Keine',
      fr: 'Aucun',
    }) as string
  }
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
  labels: {
    singular: {
      en: 'Project',
      da: 'Projekt',
      de: 'Projekt',
      fr: 'Projet',
    },
    plural: {
      en: 'Projects',
      da: 'Projekter',
      de: 'Projekte',
      fr: 'Projets',
    },
  },
  admin: {
    useAsTitle: 'title',
    group: {
      en: 'Delivery',
      da: 'Levering',
      de: 'Auslieferung',
      fr: 'Livraison',
    },
    description: {
      en: 'Top-level workspaces that contain groups, courses, and access memberships.',
      da: 'Arbejdsomraader paa oeverste niveau, som indeholder grupper, kurser og adgangsmedlemskaber.',
      de: 'Arbeitsbereiche auf oberster Ebene, die Gruppen, Kurse und Zugriffsmitgliedschaften enthalten.',
      fr: 'Espaces de travail de premier niveau contenant groupes, cours et appartenances d’acces.',
    },
    defaultColumns: [
      'title',
      '_status',
      'lifecycle',
      'viewerSummary',
      'editorSummary',
      'managerSummary',
      'createdAt',
    ],
  },
  versions: {
    drafts: true,
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
      label: {
        en: 'Title',
        da: 'Titel',
        de: 'Titel',
        fr: 'Titre',
      },
      type: 'text',
      localized: true,
      required: true,
    },
    {
      name: 'description',
      label: {
        en: 'Description',
        da: 'Beskrivelse',
        de: 'Beschreibung',
        fr: 'Description',
      },
      type: 'richText',
    },
    {
      name: 'projectType',
      label: {
        en: 'Project Type',
        da: 'Projekttype',
        de: 'Projekttyp',
        fr: 'Type de projet',
      },
      type: 'relationship',
      relationTo: 'project-types',
      required: true,
      admin: {
        description: {
          en: 'Select the project type (uses project-types collection)',
          da: 'Vaelg projekttypen (bruger samlingen project-types)',
          de: 'Waehle den Projekttyp aus (verwendet die Sammlung project-types)',
          fr: 'Selectionnez le type de projet (utilise la collection project-types)',
        },
      },
    },
    {
      name: 'groups',
      label: {
        en: 'Groups',
        da: 'Grupper',
        de: 'Gruppen',
        fr: 'Groupes',
      },
      type: 'join',
      collection: 'project-groups',
      on: 'project',
      admin: {
        description: {
          en: 'Child project groups',
          da: 'Underordnede projektgrupper',
          de: 'Untergeordnete Projektgruppen',
          fr: 'Groupes de projet enfants',
        },
        defaultColumns: ['title', 'createdAt'],
      },
    },
    {
      name: 'courses',
      label: {
        en: 'Courses',
        da: 'Kurser',
        de: 'Kurse',
        fr: 'Cours',
      },
      type: 'join',
      collection: 'courses',
      on: 'project',
      admin: {
        defaultColumns: ['title', 'createdAt'],
      },
    },
    {
      name: 'viewers',
      label: {
        en: 'Viewers',
        da: 'Seere',
        de: 'Leser',
        fr: 'Lecteurs',
      },
      type: 'relationship',
      relationTo: 'users',
      hasMany: true,
      admin: {
        description: {
          en: 'Users who can view this project.',
          da: 'Brugere som kan se dette projekt.',
          de: 'Benutzer, die dieses Projekt ansehen koennen.',
          fr: 'Utilisateurs pouvant consulter ce projet.',
        },
      },
      access: {
        create: ({ req: { user } }) => isSuperAdmin(user),
        update: ({ req: { user }, doc }) => canManageProjectMembers(user, doc),
      },
    },
    {
      name: 'editors',
      label: {
        en: 'Editors',
        da: 'Redaktoerer',
        de: 'Bearbeiter',
        fr: 'Editeurs',
      },
      type: 'relationship',
      relationTo: 'users',
      hasMany: true,
      admin: {
        description: {
          en: 'Users who can edit this project and its child content.',
          da: 'Brugere som kan redigere dette projekt og dets underindhold.',
          de: 'Benutzer, die dieses Projekt und dessen untergeordnete Inhalte bearbeiten koennen.',
          fr: 'Utilisateurs pouvant modifier ce projet et ses contenus enfants.',
        },
      },
      access: {
        create: ({ req: { user } }) => isSuperAdmin(user),
        update: ({ req: { user }, doc }) => canManageProjectMembers(user, doc),
      },
    },
    {
      name: 'managers',
      label: {
        en: 'Managers',
        da: 'Ledere',
        de: 'Manager',
        fr: 'Responsables',
      },
      type: 'relationship',
      relationTo: 'users',
      hasMany: true,
      admin: {
        description: {
          en: 'Users who can manage project memberships.',
          da: 'Brugere som kan administrere projektmedlemskaber.',
          de: 'Benutzer, die Projektmitgliedschaften verwalten koennen.',
          fr: 'Utilisateurs pouvant gerer les appartenances au projet.',
        },
      },
      access: {
        create: ({ req: { user } }) => isSuperAdmin(user),
        update: ({ req: { user } }) => isSuperAdmin(user),
      },
    },
    {
      name: 'viewerSummary',
      label: {
        en: 'Viewer Summary',
        da: 'Opsummering af seere',
        de: 'Zusammenfassung Leser',
        fr: 'Resume des lecteurs',
      },
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
      label: {
        en: 'Editor Summary',
        da: 'Opsummering af redaktoerer',
        de: 'Zusammenfassung Bearbeiter',
        fr: 'Resume des editeurs',
      },
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
      label: {
        en: 'Manager Summary',
        da: 'Opsummering af ledere',
        de: 'Zusammenfassung Manager',
        fr: 'Resume des responsables',
      },
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
      name: 'lifecycle',
      label: {
        en: 'Lifecycle',
        da: 'Livscyklus',
        de: 'Lebenszyklus',
        fr: 'Cycle de vie',
      },
      type: 'select',
      options: [
        {
          label: {
            en: 'Active',
            da: 'Aktiv',
            de: 'Aktiv',
            fr: 'Actif',
          },
          value: 'active',
        },
        {
          label: {
            en: 'Archived',
            da: 'Arkiveret',
            de: 'Archiviert',
            fr: 'Archive',
          },
          value: 'archived',
        },
      ],
      defaultValue: 'active',
      required: true,
      admin: {
        description: {
          en: 'Business lifecycle separate from Payload draft and published status.',
          da: 'Forretningsmaessig livscyklus adskilt fra Payloads kladde- og publiceringsstatus.',
          de: 'Geschaeftlicher Lebenszyklus getrennt vom Payload-Status fuer Entwurf und Veroeffentlichung.',
          fr: 'Cycle de vie metier distinct du statut de brouillon et de publication de Payload.',
        },
      },
      hooks: {
        afterRead: [({ value }) => (value === 'draft' ? 'active' : value)],
        beforeValidate: [({ value }) => (value === 'draft' ? 'active' : value)],
      },
    },

    {
      name: 'isPublic',
      label: {
        en: 'Public',
        da: 'Offentlig',
        de: 'Oeffentlich',
        fr: 'Public',
      },
      type: 'checkbox',
      defaultValue: false,
    },
  ],
}
