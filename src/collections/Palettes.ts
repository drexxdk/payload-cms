import type { CollectionConfig } from 'payload'

export const Palettes = {
  slug: 'palettes',
  labels: {
    singular: {
      en: 'Palette',
      da: 'Palette',
      de: 'Palette',
      fr: 'Palette',
    },
    plural: {
      en: 'Palettes',
      da: 'Paletter',
      de: 'Paletten',
      fr: 'Palettes',
    },
  },
  admin: {
    useAsTitle: 'name',
    group: {
      en: 'Content Assets',
      da: 'Indholdsaktiver',
      de: 'Inhaltsressourcen',
      fr: 'Ressources de contenu',
    },
    description: {
      en: 'Reusable palette definitions used by custom UI and branded content assets.',
      da: 'Genbrugelige paletdefinitioner brugt af specialbygget UI og brandede indholdsaktiver.',
      de: 'Wiederverwendbare Palettendefinitionen fuer benutzerdefinierte UI und markengepraegte Inhaltsressourcen.',
      fr: 'Definitions de palette reutilisables utilisees par l’UI personnalisee et les ressources de contenu aux couleurs de la marque.',
    },
    defaultColumns: ['name', 'palette'],
  },
  access: {
    read: () => true,
    create: () => false,
    update: () => true,
    delete: () => false,
  },
  fields: [
    {
      name: 'name',
      label: {
        en: 'Name',
        da: 'Navn',
        de: 'Name',
        fr: 'Nom',
      },
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'palette',
      label: {
        en: 'Palette Token',
        da: 'Palet-token',
        de: 'Paletten-Token',
        fr: 'Jeton de palette',
      },
      type: 'text',
      required: true,
      admin: { readOnly: true },
      unique: true,
      index: true,
    },
    {
      name: 'shades',
      label: {
        en: 'Shades',
        da: 'Nuancer',
        de: 'Schattierungen',
        fr: 'Nuances',
      },
      type: 'array',
      minRows: 11,
      maxRows: 11,
      fields: [
        {
          name: 'shade',
          label: {
            en: 'Shade',
            da: 'Nuance',
            de: 'Schattierung',
            fr: 'Nuance',
          },
          type: 'text',
          required: true,
          admin: { disabled: true },
        },
        {
          name: 'overrideUseDarkAccent',
          label: {
            en: 'Use Dark Accent Override',
            da: 'Tving moerk accent',
            de: 'Dunklen Akzent erzwingen',
            fr: 'Forcer l’accent sombre',
          },
          type: 'checkbox',
          defaultValue: false,
        },
      ],
      admin: {
        components: {
          Field: '/components/PaletteField',
        },
      },
    },
  ],
} as unknown as CollectionConfig

export default Palettes
