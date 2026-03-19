import type { CollectionConfig } from 'payload'

const SHADES = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'] as const

export const Palettes = {
  slug: 'palettes',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'palette'],
  },
  access: {
    read: () => true,
    create: () => false,
    update: () => true,
    delete: () => false,
  },
  fields: [
    { name: 'name', type: 'text', required: true, localized: true },
    {
      name: 'palette',
      type: 'text',
      required: true,
      admin: { readOnly: true },
      unique: true,
      index: true,
    },
    {
      name: 'shades',
      type: 'array',
      minRows: 11,
      maxRows: 11,
      fields: [
        { name: 'shade', type: 'text', required: true, admin: { disabled: true } },
        { name: 'overrideUseDarkAccent', type: 'checkbox', defaultValue: false },
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
