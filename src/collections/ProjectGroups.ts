import type { CollectionConfig } from 'payload'
import {
  buildProjectEditAccess,
  buildProjectReadAccess,
  canEditProjectByID,
  relationshipID,
} from '../access/rbac'

export const ProjectGroups: CollectionConfig = {
  slug: 'project-groups',
  labels: {
    singular: {
      en: 'Project Group',
      da: 'Projektgruppe',
      de: 'Projektgruppe',
      fr: 'Groupe de projet',
    },
    plural: {
      en: 'Project Groups',
      da: 'Projektgrupper',
      de: 'Projektgruppen',
      fr: 'Groupes de projet',
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
      en: 'Project-scoped bundles of products that make the project structure easier to inspect.',
      da: 'Projektforankrede produktbundter, som goer projektstrukturen lettere at gennemgaa.',
      de: 'Projektbezogene Produktbuendel, die die Projektstruktur leichter pruefbar machen.',
      fr: 'Ensembles de produits rattaches aux projets qui rendent la structure du projet plus facile a examiner.',
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
          en: 'Parent project for this group',
          da: 'Overordnet projekt for denne gruppe',
          de: 'Uebergeordnetes Projekt fuer diese Gruppe',
          fr: 'Projet parent pour ce groupe',
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
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      admin: {
        description: {
          en: 'Products contained in this project group',
          da: 'Produkter i denne projektgruppe',
          de: 'Produkte in dieser Projektgruppe',
          fr: 'Produits contenus dans ce groupe de projet',
        },
      },
    },
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
  ],
}
