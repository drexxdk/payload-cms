import type { CollectionConfig } from 'payload'
import { isSuperAdmin } from '../access/rbac'

export const ProductTypes: CollectionConfig = {
  slug: 'product-types',
  labels: {
    singular: {
      en: 'Product Type',
      da: 'Produkttype',
      de: 'Produkttyp',
      fr: 'Type de produit',
    },
    plural: {
      en: 'Product Types',
      da: 'Produkttyper',
      de: 'Produkttypen',
      fr: 'Types de produit',
    },
  },
  admin: {
    useAsTitle: 'title',
    group: {
      en: 'Catalog',
      da: 'Katalog',
      de: 'Katalog',
      fr: 'Catalogue',
    },
    description: {
      en: 'Reference types that classify products across courses and project groups.',
      da: 'Referencetyper, der klassificerer produkter paa tvaers af kurser og projektgrupper.',
      de: 'Referenztypen, die Produkte ueber Kurse und Projektgruppen hinweg klassifizieren.',
      fr: 'Types de reference qui classent les produits a travers les cours et groupes de projet.',
    },
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
      name: 'products',
      label: {
        en: 'Products',
        da: 'Produkter',
        de: 'Produkte',
        fr: 'Produits',
      },
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
