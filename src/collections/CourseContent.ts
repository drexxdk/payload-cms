import type { CollectionConfig } from 'payload'
import {
  buildProjectEditAccess,
  buildProjectReadAccess,
  canEditProjectByID,
  relationshipID,
} from '../access/rbac'
import { projectScopedImageMediaFilter } from './shared/mediaFilters'

function isContentType(data: unknown, type: string) {
  return (
    typeof data === 'object' &&
    data !== null &&
    (data as { contentType?: unknown }).contentType === type
  )
}

function validateRequiredForType(type: string, message: string) {
  return (value: unknown, { data }: { data?: unknown }) => {
    if (!isContentType(data, type)) return true

    if (Array.isArray(value)) {
      return value.length > 0 ? true : message
    }

    if (value && typeof value === 'object') {
      return true
    }

    if (typeof value === 'string') {
      return value.trim().length > 0 ? true : message
    }

    return value ? true : message
  }
}

export const CourseContent: CollectionConfig = {
  slug: 'course-content',
  labels: {
    singular: {
      en: 'Course Content',
      da: 'Kursusindhold',
      de: 'Kursinhalt',
      fr: 'Contenu de cours',
    },
    plural: {
      en: 'Course Content',
      da: 'Kursusindhold',
      de: 'Kursinhalte',
      fr: 'Contenus de cours',
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
      en: 'Reusable content items that can be placed on many course pages without duplicating the source content.',
      da: 'Genbrugelige indholdselementer som kan placeres paa mange kursussider uden at duplikere kilden.',
      de: 'Wiederverwendbare Inhaltselemente, die auf vielen Kursseiten platziert werden koennen, ohne den Quellinhalt zu duplizieren.',
      fr: 'Elements de contenu reutilisables pouvant etre places sur plusieurs pages de cours sans dupliquer la source.',
    },
    defaultColumns: ['title', 'contentType', 'project', 'updatedAt'],
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
      name: 'contentType',
      label: {
        en: 'Content Type',
        da: 'Indholdstype',
        de: 'Inhaltstyp',
        fr: 'Type de contenu',
      },
      type: 'select',
      required: true,
      defaultValue: 'richText',
      options: [
        {
          label: { en: 'Rich Text', da: 'Rich text', de: 'Rich Text', fr: 'Rich text' },
          value: 'richText',
        },
        {
          label: { en: 'Quote', da: 'Citat', de: 'Zitat', fr: 'Citation' },
          value: 'quote',
        },
        {
          label: { en: 'Image', da: 'Billede', de: 'Bild', fr: 'Image' },
          value: 'image',
        },
        {
          label: { en: 'Assignment', da: 'Opgave', de: 'Aufgabe', fr: 'Exercice' },
          value: 'assignment',
        },
        {
          label: { en: 'Question', da: 'Spoergsmaal', de: 'Frage', fr: 'Question' },
          value: 'question',
        },
      ],
      admin: {
        description: {
          en: 'Choose the content kind first. The form will then show only the fields relevant to that kind.',
          da: 'Vaelg foerst indholdstypen. Formularen viser derefter kun de felter, der passer til typen.',
          de: 'Waehle zuerst den Inhaltstyp. Das Formular zeigt danach nur die passenden Felder an.',
          fr: 'Choisissez d’abord le type de contenu. Le formulaire n’affichera ensuite que les champs pertinents.',
        },
      },
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
          en: 'Optional summary shown when the content item needs a short introduction.',
          da: 'Valgfri opsummering vist naar indholdselementet har brug for en kort introduktion.',
          de: 'Optionale Zusammenfassung, wenn das Inhaltselement eine kurze Einleitung braucht.',
          fr: 'Resume facultatif affiche lorsque l’element de contenu a besoin d’une courte introduction.',
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
          en: 'Which project owns this reusable content item.',
          da: 'Hvilket projekt der ejer dette genbrugelige indholdselement.',
          de: 'Welches Projekt dieses wiederverwendbare Inhaltselement besitzt.',
          fr: 'Projet auquel appartient cet element de contenu reutilisable.',
        },
      },
    },
    {
      name: 'richTextBody',
      label: {
        en: 'Rich Text Content',
        da: 'Rich text-indhold',
        de: 'Rich-Text-Inhalt',
        fr: 'Contenu rich text',
      },
      type: 'richText',
      localized: true,
      validate: validateRequiredForType('richText', 'Rich text content is required.'),
      admin: {
        condition: (_, siblingData) => isContentType(siblingData, 'richText'),
        description: {
          en: 'Main rich text body for a rich text content item.',
          da: 'Hovedindholdet for et rich text-indholdselement.',
          de: 'Hauptinhalt fuer ein Rich-Text-Inhaltselement.',
          fr: 'Corps principal pour un element de contenu rich text.',
        },
      },
    },
    {
      name: 'image',
      label: {
        en: 'Image',
        da: 'Billede',
        de: 'Bild',
        fr: 'Image',
      },
      type: 'upload',
      relationTo: 'media',
      localized: true,
      filterOptions: projectScopedImageMediaFilter,
      validate: validateRequiredForType('image', 'An image is required.'),
      admin: {
        condition: (_, siblingData) => isContentType(siblingData, 'image'),
        description: {
          en: 'Select an image from the media library or upload a new scoped image asset for this project.',
          da: 'Vaelg et billede fra mediebiblioteket eller upload et nyt afgraenset billedaktiv til dette projekt.',
          de: 'Waehle ein Bild aus der Medienbibliothek oder lade ein neues, passend abgegrenztes Bild fuer dieses Projekt hoch.',
          fr: 'Selectionnez une image dans la bibliotheque media ou televersez une nouvelle image avec la bonne portee pour ce projet.',
        },
      },
    },
    {
      name: 'imageCaption',
      label: {
        en: 'Image Caption',
        da: 'Billedtekst',
        de: 'Bildunterschrift',
        fr: 'Legende de l’image',
      },
      type: 'richText',
      localized: true,
      admin: {
        condition: (_, siblingData) => isContentType(siblingData, 'image'),
        description: {
          en: 'Optional caption or explanatory text for the image.',
          da: 'Valgfri billedtekst eller forklarende tekst til billedet.',
          de: 'Optionale Bildunterschrift oder Erlaeuterung zum Bild.',
          fr: 'Legende ou texte explicatif facultatif pour l’image.',
        },
      },
    },
    {
      name: 'quoteText',
      label: {
        en: 'Quote',
        da: 'Citat',
        de: 'Zitat',
        fr: 'Citation',
      },
      type: 'textarea',
      localized: true,
      validate: validateRequiredForType('quote', 'A quote is required.'),
      admin: {
        condition: (_, siblingData) => isContentType(siblingData, 'quote'),
        description: {
          en: 'The quoted text to display.',
          da: 'Den citerede tekst der skal vises.',
          de: 'Der anzuzeigende zitierte Text.',
          fr: 'Le texte cite a afficher.',
        },
      },
    },
    {
      name: 'quoteAttribution',
      label: {
        en: 'Quote Attribution',
        da: 'Citatkilde',
        de: 'Zitatquelle',
        fr: 'Attribution de la citation',
      },
      type: 'text',
      localized: true,
      admin: {
        condition: (_, siblingData) => isContentType(siblingData, 'quote'),
        description: {
          en: 'Optional source, speaker, or author for the quote.',
          da: 'Valgfri kilde, taler eller forfatter til citatet.',
          de: 'Optionale Quelle, Sprecherin oder Autor fuer das Zitat.',
          fr: 'Source, intervenant ou auteur facultatif pour la citation.',
        },
      },
    },
    {
      name: 'assignmentQuestions',
      label: {
        en: 'Questions',
        da: 'Spoergsmaal',
        de: 'Fragen',
        fr: 'Questions',
      },
      type: 'relationship',
      relationTo: 'course-content',
      hasMany: true,
      validate: validateRequiredForType(
        'assignment',
        'Assignments must include at least one question.',
      ),
      filterOptions: {
        contentType: {
          equals: 'question',
        },
      },
      admin: {
        condition: (_, siblingData) => isContentType(siblingData, 'assignment'),
        description: {
          en: 'Add the questions that belong to this assignment. Their order defines question 1 of N, 2 of N, and so on.',
          da: 'Tilfoej de spoergsmaal, der hoerer til denne opgave. Deres raekkefolge definerer spoergsmaal 1 af N, 2 af N osv.',
          de: 'Fuege die Fragen hinzu, die zu dieser Aufgabe gehoeren. Ihre Reihenfolge definiert Frage 1 von N, 2 von N usw.',
          fr: 'Ajoutez les questions qui appartiennent a cet exercice. Leur ordre definit question 1 sur N, 2 sur N, etc.',
        },
      },
    },
  ],
}

export default CourseContent
