import type { CollectionConfig } from 'payload'
import {
  buildProjectEditAccess,
  buildProjectReadAccess,
  canEditProjectByID,
  relationshipID,
} from '../access/rbac'
import { courseScopedImageMediaFilter } from './shared/mediaFilters'

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
      en: 'Project-scoped course frontpages with reusable chapter and product associations.',
      da: 'Projektforankrede kursusforsider med genbrugelige kapitel- og produktrelationer.',
      de: 'Projektbezogene Kurs-Startseiten mit wiederverwendbaren Kapitel- und Produktbeziehungen.',
      fr: 'Pages d’accueil de cours rattachees aux projets avec chapitres et produits reutilisables.',
    },
    defaultColumns: ['title', 'isbn', 'project', 'updatedAt'],
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
      name: 'hero',
      label: {
        en: 'Hero',
        da: 'Hero',
        de: 'Hero',
        fr: 'Hero',
      },
      type: 'upload',
      relationTo: 'media',
      required: true,
      localized: true,
      filterOptions: courseScopedImageMediaFilter,
      admin: {
        description: {
          en: 'Hero image for the course frontpage. Select from the media library or upload a new scoped image asset.',
          da: 'Hero-billede til kursusforsiden. Vaelg fra mediebiblioteket eller upload et nyt afgraenset billedaktiv.',
          de: 'Hero-Bild fuer die Kurs-Startseite. Waehle aus der Medienbibliothek oder lade ein neues, passend abgegrenztes Bild hoch.',
          fr: 'Image hero pour la page d’accueil du cours. Selectionnez-la dans la bibliotheque media ou televersez une nouvelle image avec la bonne portee.',
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
    {
      name: 'isbn',
      label: {
        en: 'ISBN',
        da: 'ISBN',
        de: 'ISBN',
        fr: 'ISBN',
      },
      type: 'text',
      required: false,
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
      localized: true,
      admin: {
        description: {
          en: 'Optional localized introduction for the course frontpage.',
          da: 'Valgfri lokaliseret introduktion til kursusforsiden.',
          de: 'Optionale lokalisierte Einleitung fuer die Kurs-Startseite.',
          fr: 'Introduction localisee facultative pour la page d’accueil du cours.',
        },
      },
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
      name: 'chapters',
      label: {
        en: 'Chapters',
        da: 'Kapitler',
        de: 'Kapitel',
        fr: 'Chapitres',
      },
      type: 'join',
      collection: 'course-chapters',
      on: 'course',
      admin: {
        defaultColumns: ['title', 'updatedAt'],
        description: {
          en: 'Chapters that belong to this course frontpage.',
          da: 'Kapitler der hoerer til denne kursusforside.',
          de: 'Kapitel, die zu dieser Kurs-Startseite gehoeren.',
          fr: 'Chapitres qui appartiennent a cette page d’accueil de cours.',
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
