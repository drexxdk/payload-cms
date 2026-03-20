import type { CollectionConfig } from 'payload'
import { relationshipID } from '../access/rbac'

function isAvailabilityScope(data: unknown, scope: string) {
  return (
    typeof data === 'object' &&
    data !== null &&
    (data as { availabilityScope?: unknown }).availabilityScope === scope
  )
}

function validateScopeRelationship(scope: string, message: string) {
  return (value: unknown, { data }: { data?: unknown }) => {
    if (!isAvailabilityScope(data, scope)) return true
    return value ? true : message
  }
}

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: {
      en: 'Media',
      da: 'Medie',
      de: 'Medium',
      fr: 'Media',
    },
    plural: {
      en: 'Media',
      da: 'Medier',
      de: 'Medien',
      fr: 'Medias',
    },
  },
  admin: {
    useAsTitle: 'filename',
    group: {
      en: 'Content Assets',
      da: 'Indholdsaktiver',
      de: 'Inhaltsressourcen',
      fr: 'Ressources de contenu',
    },
    description: {
      en: 'Shared asset library for images, video, GeoGebra, ThingLink, downloads, and future media types.',
      da: 'Delt aktivbibliotek til billeder, video, GeoGebra, ThingLink, downloads og fremtidige medietyper.',
      de: 'Gemeinsame Asset-Bibliothek fuer Bilder, Video, GeoGebra, ThingLink, Downloads und kuenftige Medientypen.',
      fr: 'Bibliotheque de ressources partagees pour les images, la video, GeoGebra, ThingLink, les telechargements et les futurs types de medias.',
    },
    defaultColumns: ['filename', 'kind', 'availabilityScope', 'project', 'updatedAt'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'kind',
      label: {
        en: 'Kind',
        da: 'Type',
        de: 'Art',
        fr: 'Type',
      },
      type: 'select',
      required: true,
      defaultValue: 'image',
      options: [
        { label: { en: 'Image', da: 'Billede', de: 'Bild', fr: 'Image' }, value: 'image' },
        { label: { en: 'Video', da: 'Video', de: 'Video', fr: 'Video' }, value: 'video' },
        {
          label: { en: 'GeoGebra', da: 'GeoGebra', de: 'GeoGebra', fr: 'GeoGebra' },
          value: 'geogebra',
        },
        {
          label: { en: 'ThingLink', da: 'ThingLink', de: 'ThingLink', fr: 'ThingLink' },
          value: 'thinglink',
        },
        {
          label: { en: 'Download', da: 'Download', de: 'Download', fr: 'Telechargement' },
          value: 'download',
        },
        { label: { en: 'Other', da: 'Andet', de: 'Andere', fr: 'Autre' }, value: 'other' },
      ],
      admin: {
        description: {
          en: 'High-level media type so the library can grow beyond image uploads cleanly.',
          da: 'Overordnet medietype, saa biblioteket kan vokse rent ud over billeduploads.',
          de: 'Oberer Medientyp, damit die Bibliothek sauber ueber Bild-Uploads hinaus wachsen kann.',
          fr: 'Type de media de haut niveau pour permettre a la bibliotheque de s’etendre proprement au-dela des images.',
        },
      },
    },
    {
      name: 'availabilityScope',
      label: {
        en: 'Availability Scope',
        da: 'Tilgaengelighedsniveau',
        de: 'Verfuegbarkeitsebene',
        fr: 'Niveau de disponibilite',
      },
      type: 'select',
      required: true,
      defaultValue: 'project',
      options: [
        {
          label: { en: 'Project', da: 'Projekt', de: 'Projekt', fr: 'Projet' },
          value: 'project',
        },
        {
          label: {
            en: 'Product Group',
            da: 'Produktgruppe',
            de: 'Produktgruppe',
            fr: 'Groupe de produits',
          },
          value: 'projectGroup',
        },
        {
          label: { en: 'Product', da: 'Produkt', de: 'Produkt', fr: 'Produit' },
          value: 'product',
        },
        {
          label: { en: 'Course', da: 'Kursus', de: 'Kurs', fr: 'Cours' },
          value: 'course',
        },
      ],
      admin: {
        description: {
          en: 'Choose the narrowest level where this file should be available in the media library.',
          da: 'Vaelg det snavreste niveau hvor denne fil skal vaere tilgaengelig i mediebiblioteket.',
          de: 'Waehle die engste Ebene, auf der diese Datei in der Medienbibliothek verfuegbar sein soll.',
          fr: 'Choisissez le niveau le plus precis ou ce fichier doit etre disponible dans la bibliotheque media.',
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
          en: 'Top-level project ownership for this file.',
          da: 'Overordnet projektejerskab for denne fil.',
          de: 'Oberste Projektzuordnung fuer diese Datei.',
          fr: 'Projet de rattachement principal pour ce fichier.',
        },
      },
    },
    {
      name: 'projectGroup',
      label: {
        en: 'Product Group',
        da: 'Produktgruppe',
        de: 'Produktgruppe',
        fr: 'Groupe de produits',
      },
      type: 'relationship',
      relationTo: 'project-groups',
      validate: validateScopeRelationship(
        'projectGroup',
        'A product group is required when the availability scope is Product Group.',
      ),
      admin: {
        condition: (_, siblingData) => isAvailabilityScope(siblingData, 'projectGroup'),
        description: {
          en: 'Limit this file to a specific product group within the chosen project.',
          da: 'Begraens denne fil til en bestemt produktgruppe i det valgte projekt.',
          de: 'Beschraenke diese Datei auf eine bestimmte Produktgruppe innerhalb des gewaehlten Projekts.',
          fr: 'Limitez ce fichier a un groupe de produits precis dans le projet choisi.',
        },
      },
    },
    {
      name: 'product',
      label: {
        en: 'Product',
        da: 'Produkt',
        de: 'Produkt',
        fr: 'Produit',
      },
      type: 'relationship',
      relationTo: 'products',
      validate: validateScopeRelationship(
        'product',
        'A product is required when the availability scope is Product.',
      ),
      admin: {
        condition: (_, siblingData) => isAvailabilityScope(siblingData, 'product'),
        description: {
          en: 'Limit this file to a specific product.',
          da: 'Begraens denne fil til et bestemt produkt.',
          de: 'Beschraenke diese Datei auf ein bestimmtes Produkt.',
          fr: 'Limitez ce fichier a un produit precis.',
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
      validate: validateScopeRelationship(
        'course',
        'A course is required when the availability scope is Course.',
      ),
      filterOptions: ({ siblingData }) => {
        const projectID = relationshipID(
          (siblingData as { project?: unknown } | undefined)?.project,
        )

        if (projectID === null) return true

        return {
          project: {
            equals: projectID,
          },
        }
      },
      admin: {
        condition: (_, siblingData) => isAvailabilityScope(siblingData, 'course'),
        description: {
          en: 'Limit this file to a specific course inside the chosen project.',
          da: 'Begraens denne fil til et bestemt kursus i det valgte projekt.',
          de: 'Beschraenke diese Datei auf einen bestimmten Kurs innerhalb des gewaehlten Projekts.',
          fr: 'Limitez ce fichier a un cours precis dans le projet choisi.',
        },
      },
    },
    {
      name: 'alt',
      label: {
        en: 'Alt Text',
        da: 'Alt-tekst',
        de: 'Alternativtext',
        fr: 'Texte alternatif',
      },
      type: 'text',
      required: true,
      admin: {
        description: {
          en: 'Accessibility text for visual media. Keep this populated for images and previews.',
          da: 'Tilgængelighedstekst til visuelle medier. Hold dette udfyldt for billeder og forhåndsvisninger.',
          de: 'Barrierefreiheitstext fuer visuelle Medien. Dieses Feld sollte fuer Bilder und Vorschauen gepflegt sein.',
          fr: 'Texte d’accessibilite pour les medias visuels. Gardez-le renseigne pour les images et apercus.',
        },
      },
    },
  ],
  upload: true,
}
