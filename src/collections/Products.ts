import type { CollectionConfig } from 'payload'
import { isSuperAdmin } from '../access/rbac'

export const Products: CollectionConfig = {
  slug: 'products',
  labels: {
    singular: {
      en: 'Product',
      da: 'Produkt',
      de: 'Produkt',
      fr: 'Produit',
    },
    plural: {
      en: 'Products',
      da: 'Produkter',
      de: 'Produkte',
      fr: 'Produits',
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
      en: 'Reusable product records that can be linked into courses and grouped inside projects.',
      da: 'Genbrugelige produktposter, der kan knyttes til kurser og grupperes inde i projekter.',
      de: 'Wiederverwendbare Produktdatensaetze, die in Kurse eingebunden und innerhalb von Projekten gruppiert werden koennen.',
      fr: 'Fiches produit reutilisables pouvant etre liees a des cours et regroupees dans des projets.',
    },
    defaultColumns: ['title', 'productType', 'isbn', 'updatedAt'],
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
      label: {
        en: 'Title',
        da: 'Titel',
        de: 'Titel',
        fr: 'Titre',
      },
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'isbn',
      label: {
        en: 'ISBN',
        da: 'ISBN',
        de: 'ISBN',
        fr: 'ISBN',
      },
      type: 'text',
      required: false,
    },
    {
      name: 'productType',
      label: {
        en: 'Product Type',
        da: 'Produkttype',
        de: 'Produkttyp',
        fr: 'Type de produit',
      },
      type: 'relationship',
      relationTo: 'product-types',
      required: false,
      admin: {
        description: {
          en: 'Optional product type (uses product-types collection)',
          da: 'Valgfri produkttype (bruger samlingen product-types)',
          de: 'Optionaler Produkttyp (verwendet die Sammlung product-types)',
          fr: 'Type de produit facultatif (utilise la collection product-types)',
        },
      },
    },
    {
      name: 'courses',
      label: {
        en: 'Courses',
        da: 'Kurser',
        de: 'Kurse',
        fr: 'Cours',
      },
      type: 'relationship',
      relationTo: 'courses',
      hasMany: true,
      admin: {
        description: {
          en: 'Courses associated with this product',
          da: 'Kurser knyttet til dette produkt',
          de: 'Kurse, die diesem Produkt zugeordnet sind',
          fr: 'Cours associes a ce produit',
        },
      },
    },
    {
      name: 'projectGroups',
      label: {
        en: 'Project Groups',
        da: 'Projektgrupper',
        de: 'Projektgruppen',
        fr: 'Groupes de projet',
      },
      type: 'join',
      collection: 'project-groups',
      on: 'products',
      admin: {
        defaultColumns: ['title', 'project', 'createdAt'],
      },
    },
  ],
}

export default Products
