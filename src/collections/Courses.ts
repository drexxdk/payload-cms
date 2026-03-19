import type { CollectionConfig } from 'payload'
import {
  buildProjectEditAccess,
  buildProjectReadAccess,
  canEditProjectByID,
  relationshipID,
} from '../access/rbac'

export const Courses: CollectionConfig = {
  slug: 'courses',
  labels: {
    singular: {
      en: 'Course',
      da: 'Kursus',
      de: 'Kurs',
      fr: 'Cours',
    },
    plural: {
      en: 'Courses',
      da: 'Kurser',
      de: 'Kurse',
      fr: 'Cours',
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
      en: 'Project-scoped course records linked to the products they use.',
      da: 'Projektforankrede kursusposter knyttet til de produkter, de bruger.',
      de: 'Projektbezogene Kursdatensaetze, die mit den verwendeten Produkten verknuepft sind.',
      fr: 'Fiches de cours rattachees aux projets et liees aux produits qu’elles utilisent.',
    },
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
      name: 'project',
      label: {
        en: 'Project',
        da: 'Projekt',
        de: 'Projekt',
        fr: 'Projet',
      },
      type: 'relationship',
      relationTo: 'projects',
      required: true,
      admin: {
        description: {
          en: 'Which project this course belongs to',
          da: 'Hvilket projekt dette kursus tilhoerer',
          de: 'Zu welchem Projekt dieser Kurs gehoert',
          fr: 'Projet auquel appartient ce cours',
        },
      },
    },
    {
      name: 'products',
      label: {
        en: 'Products',
        da: 'Produkter',
        de: 'Produkte',
        fr: 'Produits',
      },
      type: 'join',
      collection: 'products',
      on: 'courses',
      admin: {
        defaultColumns: ['title', 'isbn', 'productType'],
      },
    },
  ],
}
