import type { CollectionConfig } from 'payload'
import {
  buildProjectEditAccess,
  buildProjectReadAccess,
  canEditCourseByID,
  relationshipID,
} from '../access/rbac'
import { chapterScopedImageMediaFilter } from './shared/mediaFilters'

export const CourseChapters: CollectionConfig = {
  slug: 'course-chapters',
  labels: {
    singular: {
      en: 'Course Chapter',
      da: 'Kursuskapitel',
      de: 'Kurskapitel',
      fr: 'Chapitre de cours',
    },
    plural: {
      en: 'Course Chapters',
      da: 'Kursuskapitler',
      de: 'Kurskapitel',
      fr: 'Chapitres de cours',
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
      en: 'Structured chapters that live inside a course frontpage and group reusable pages.',
      da: 'Strukturerede kapitler som ligger i en kursusforside og grupperer genbrugelige sider.',
      de: 'Strukturierte Kapitel innerhalb einer Kurs-Startseite, die wiederverwendbare Seiten gruppieren.',
      fr: 'Chapitres structures rattaches a une page d’accueil de cours et regroupant des pages reutilisables.',
    },
    defaultColumns: ['title', 'course', 'updatedAt'],
  },
  access: {
    read: ({ req: { user } }) => buildProjectReadAccess(user, 'course.project.'),
    create: async ({ req, data }) => canEditCourseByID(req, relationshipID(data?.course)),
    update: ({ req: { user } }) => buildProjectEditAccess(user, 'course.project.'),
    delete: ({ req: { user } }) => buildProjectEditAccess(user, 'course.project.'),
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
      filterOptions: chapterScopedImageMediaFilter,
      admin: {
        description: {
          en: 'Hero image for this chapter. Select from the media library or upload a new scoped image asset.',
          da: 'Hero-billede til dette kapitel. Vaelg fra mediebiblioteket eller upload et nyt afgraenset billedaktiv.',
          de: 'Hero-Bild fuer dieses Kapitel. Waehle aus der Medienbibliothek oder lade ein neues, passend abgegrenztes Bild hoch.',
          fr: 'Image hero pour ce chapitre. Selectionnez-la dans la bibliotheque media ou televersez une nouvelle image avec la bonne portee.',
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
          en: 'Optional localized overview for the chapter.',
          da: 'Valgfrit lokaliseret overblik over kapitlet.',
          de: 'Optionale lokalisierte Uebersicht fuer das Kapitel.',
          fr: 'Vue d’ensemble localisee facultative pour le chapitre.',
        },
      },
    },
    {
      name: 'course',
      label: {
        en: 'Course',
        da: 'Kursus',
        de: 'Kurs',
        fr: 'Cours',
      },
      type: 'relationship',
      relationTo: 'courses',
      required: true,
      admin: {
        components: {
          Field: '/components/admin/fields/ContextLockedRelationshipField',
        },
        description: {
          en: 'Which course frontpage this chapter belongs to.',
          da: 'Hvilken kursusforside dette kapitel hoerer til.',
          de: 'Zu welcher Kurs-Startseite dieses Kapitel gehoert.',
          fr: 'Page d’accueil de cours a laquelle appartient ce chapitre.',
        },
      },
    },
    {
      name: 'pages',
      label: {
        en: 'Pages',
        da: 'Sider',
        de: 'Seiten',
        fr: 'Pages',
      },
      type: 'join',
      collection: 'course-pages',
      on: 'chapter',
      admin: {
        defaultColumns: ['title', 'updatedAt'],
        description: {
          en: 'Pages collected under this chapter.',
          da: 'Sider samlet under dette kapitel.',
          de: 'Seiten, die unter diesem Kapitel gesammelt sind.',
          fr: 'Pages regroupees sous ce chapitre.',
        },
      },
    },
  ],
}

export default CourseChapters
