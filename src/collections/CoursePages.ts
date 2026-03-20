import type { CollectionConfig } from 'payload'
import {
  buildProjectEditAccess,
  buildProjectReadAccess,
  canEditCourseChapterByID,
  relationshipID,
} from '../access/rbac'
import { pageScopedImageMediaFilter } from './shared/mediaFilters'

function validateUniqueContentAssignments(value: unknown) {
  if (!Array.isArray(value)) return true

  const seen = new Set<number>()

  for (const row of value) {
    if (typeof row !== 'object' || row === null) continue

    const contentID = relationshipID((row as { content?: unknown }).content)

    if (contentID === null) continue
    if (seen.has(contentID)) {
      return 'Each reusable content item can only be added once per page.'
    }

    seen.add(contentID)
  }

  return true
}

export const CoursePages: CollectionConfig = {
  slug: 'course-pages',
  labels: {
    singular: {
      en: 'Course Page',
      da: 'Kursside',
      de: 'Kursseite',
      fr: 'Page de cours',
    },
    plural: {
      en: 'Course Pages',
      da: 'Kurssider',
      de: 'Kursseiten',
      fr: 'Pages de cours',
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
      en: 'Localized course pages that belong to chapters and assemble reusable content items in order.',
      da: 'Lokaliserede kurssider der hoerer til kapitler og samler genbrugelige indholdselementer i raekkefolge.',
      de: 'Lokalisierte Kursseiten, die zu Kapiteln gehoeren und wiederverwendbare Inhaltselemente in Reihenfolge zusammenstellen.',
      fr: 'Pages de cours localisees rattachees a des chapitres et composees d’elements de contenu reutilisables ordonnes.',
    },
    defaultColumns: ['title', 'chapter', 'updatedAt'],
  },
  access: {
    read: ({ req: { user } }) => buildProjectReadAccess(user, 'chapter.course.project.'),
    create: async ({ req, data }) => canEditCourseChapterByID(req, relationshipID(data?.chapter)),
    update: ({ req: { user } }) => buildProjectEditAccess(user, 'chapter.course.project.'),
    delete: ({ req: { user } }) => buildProjectEditAccess(user, 'chapter.course.project.'),
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
      required: false,
      localized: true,
      filterOptions: pageScopedImageMediaFilter,
      admin: {
        description: {
          en: 'Optional hero image for this page. Select from the media library or upload a new scoped image asset.',
          da: 'Valgfrit hero-billede til denne side. Vaelg fra mediebiblioteket eller upload et nyt afgraenset billedaktiv.',
          de: 'Optionales Hero-Bild fuer diese Seite. Waehle aus der Medienbibliothek oder lade ein neues, passend abgegrenztes Bild hoch.',
          fr: 'Image hero facultative pour cette page. Selectionnez-la dans la bibliotheque media ou televersez une nouvelle image avec la bonne portee.',
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
          en: 'Optional localized introduction for this page.',
          da: 'Valgfri lokaliseret introduktion til denne side.',
          de: 'Optionale lokalisierte Einleitung fuer diese Seite.',
          fr: 'Introduction localisee facultative pour cette page.',
        },
      },
    },
    {
      name: 'chapter',
      label: {
        en: 'Chapter',
        da: 'Kapitel',
        de: 'Kapitel',
        fr: 'Chapitre',
      },
      type: 'relationship',
      relationTo: 'course-chapters',
      required: true,
      admin: {
        description: {
          en: 'Which chapter this page belongs to.',
          da: 'Hvilket kapitel denne side hoerer til.',
          de: 'Zu welchem Kapitel diese Seite gehoert.',
          fr: 'Chapitre auquel appartient cette page.',
        },
      },
    },
    {
      name: 'contentItems',
      label: {
        en: 'Content Items',
        da: 'Indholdselementer',
        de: 'Inhaltselemente',
        fr: 'Elements de contenu',
      },
      type: 'array',
      minRows: 0,
      validate: validateUniqueContentAssignments,
      labels: {
        singular: {
          en: 'Content Item Placement',
          da: 'Placering af indholdselement',
          de: 'Platzierung eines Inhaltselements',
          fr: 'Placement d’un element de contenu',
        },
        plural: {
          en: 'Content Item Placements',
          da: 'Placeringer af indholdselementer',
          de: 'Platzierungen von Inhaltselementen',
          fr: 'Placements d’elements de contenu',
        },
      },
      admin: {
        description: {
          en: 'Ordered reusable content items for this page. The same item cannot be added twice to one page.',
          da: 'Ordnede genbrugelige indholdselementer til denne side. Det samme element kan ikke tilfoejes to gange paa en side.',
          de: 'Geordnete wiederverwendbare Inhaltselemente fuer diese Seite. Dasselbe Element kann nicht zweimal auf einer Seite verwendet werden.',
          fr: 'Elements de contenu reutilisables ordonnes pour cette page. Le meme element ne peut pas etre ajoute deux fois a une page.',
        },
      },
      fields: [
        {
          name: 'content',
          label: {
            en: 'Content Item',
            da: 'Indholdselement',
            de: 'Inhaltselement',
            fr: 'Element de contenu',
          },
          type: 'relationship',
          relationTo: 'course-content',
          required: true,
          admin: {
            description: {
              en: 'Select a reusable content item to place on this page.',
              da: 'Vaelg et genbrugeligt indholdselement der skal placeres paa denne side.',
              de: 'Waehle ein wiederverwendbares Inhaltselement fuer diese Seite aus.',
              fr: 'Selectionnez un element de contenu reutilisable a placer sur cette page.',
            },
          },
        },
      ],
    },
  ],
}

export default CoursePages
