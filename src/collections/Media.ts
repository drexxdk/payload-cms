import type { CollectionConfig } from 'payload'

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
    defaultColumns: ['filename', 'kind', 'mimeType', 'updatedAt'],
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
