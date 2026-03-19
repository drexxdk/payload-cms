import type { CollectionConfig } from 'payload'
import { isSuperAdmin } from '../access/rbac'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'isbn', 'productType'],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => isSuperAdmin(user),
    update: ({ req: { user } }) => isSuperAdmin(user),
    delete: ({ req: { user } }) => isSuperAdmin(user),
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'isbn',
      type: 'text',
      required: false,
    },
    {
      name: 'productType',
      type: 'relationship',
      relationTo: 'product-types',
      required: false,
      admin: {
        description: 'Optional product type (uses product-types collection)',
      },
    },
    {
      name: 'courses',
      type: 'relationship',
      relationTo: 'courses',
      hasMany: true,
      admin: {
        description: 'Courses associated with this product',
      },
    },
  ],
}

export default Products
