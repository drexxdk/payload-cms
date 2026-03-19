import type { CollectionConfig } from 'payload'
import { isSuperAdmin } from '../access/rbac'

export const ProductTypes: CollectionConfig = {
  slug: 'product-types',
  admin: {
    useAsTitle: 'title',
    group: 'Catalog',
    description: 'Reference types that classify products across courses and project groups.',
    defaultColumns: ['title'],
  },
  access: {
    read: () => true,
    create: () => false,
    update: ({ req: { user } }) => isSuperAdmin(user),
    delete: () => false,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      required: true,
    },
    {
      name: 'products',
      type: 'join',
      collection: 'products',
      on: 'productType',
      admin: {
        defaultColumns: ['title', 'isbn'],
      },
    },
  ],
}

export default ProductTypes
