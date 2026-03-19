import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'filename',
    group: 'Content Assets',
    description:
      'Shared asset library for images, video, GeoGebra, ThingLink, downloads, and future media types.',
    defaultColumns: ['filename', 'kind', 'mimeType', 'updatedAt'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'kind',
      type: 'select',
      required: true,
      defaultValue: 'image',
      options: [
        { label: 'Image', value: 'image' },
        { label: 'Video', value: 'video' },
        { label: 'GeoGebra', value: 'geogebra' },
        { label: 'ThingLink', value: 'thinglink' },
        { label: 'Download', value: 'download' },
        { label: 'Other', value: 'other' },
      ],
      admin: {
        description: 'High-level media type so the library can grow beyond image uploads cleanly.',
      },
    },
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: {
        description:
          'Accessibility text for visual media. Keep this populated for images and previews.',
      },
    },
  ],
  upload: true,
}
