import type { CollectionConfig } from 'payload'
import { isSuperAdmin } from '../access/rbac'

export const ProjectTypes: CollectionConfig = {
  slug: 'project-types',
  labels: {
    singular: {
      en: 'Project Type',
      da: 'Projekttype',
      de: 'Projekttyp',
      fr: 'Type de projet',
    },
    plural: {
      en: 'Project Types',
      da: 'Projekttyper',
      de: 'Projekttypen',
      fr: 'Types de projet',
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
      en: 'Reference types that classify projects and help organize delivery work.',
      da: 'Referencetyper, der klassificerer projekter og hjaelper med at organisere leveringsarbejdet.',
      de: 'Referenztypen, die Projekte klassifizieren und die Auslieferungsarbeit organisieren helfen.',
      fr: 'Types de reference qui classent les projets et aident a organiser le travail de livraison.',
    },
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
      label: {
        en: 'Title',
        da: 'Titel',
        de: 'Titel',
        fr: 'Titre',
      },
      type: 'text',
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
      type: 'textarea',
    },
    {
      name: 'projects',
      label: {
        en: 'Projects',
        da: 'Projekter',
        de: 'Projekte',
        fr: 'Projets',
      },
      type: 'join',
      collection: 'projects',
      on: 'projectType',
      admin: {
        defaultColumns: ['title', '_status', 'createdAt'],
      },
    },
  ],
}
