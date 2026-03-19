import type { Payload } from 'payload'
import type { Product } from '../../src/payload-types'

const PRODUCTS = [
  {
    title: 'Intro to Shapes',
    isbn: '978-0-123456-47-2',
    productType: 'Preschool',
    courses: ['RBAC Demo Course'],
  },
  {
    title: 'Advanced Topics',
    isbn: '978-1-234567-89-7',
    productType: 'Upper-level school',
    courses: [],
  },
  {
    title: 'Middle School Companion',
    isbn: '',
    productType: 'Middle school',
    courses: ['RBAC Demo Course'],
  },
]

export async function seedProducts(payload: Payload) {
  for (const p of PRODUCTS) {
    const existing = await ensureProduct(payload, p.title)

    // find product type id if provided
    let productTypeId: number | undefined
    if (p.productType) {
      const pt = await payload.find({
        collection: 'product-types',
        where: { title: { equals: p.productType } },
        depth: 0,
        limit: 1,
      })
      if (pt.docs[0]) productTypeId = pt.docs[0].id
    }

    // resolve courses by title
    const courseIDs: number[] = []
    for (const ct of p.courses || []) {
      const c = await payload.find({
        collection: 'courses',
        where: { title: { equals: ct } },
        depth: 0,
        limit: 1,
      })
      if (c.docs[0]) courseIDs.push(c.docs[0].id)
    }

    type ProductCreateData = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>

    const data: ProductCreateData = {
      title: p.title,
      isbn: p.isbn || undefined,
      productType: (productTypeId as number) || undefined,
      courses: courseIDs.length ? courseIDs : undefined,
    }

    if (!existing) {
      await (payload as any).create({ collection: 'products', data })
      console.log('Created product:', p.title)
    } else {
      await (payload as any).update({ collection: 'products', id: existing.id, data })
      console.log('Updated product:', p.title)
    }
  }
}

export async function ensureProduct(payload: Payload, title: string) {
  const existing = await payload.find({
    collection: 'products',
    where: { title: { equals: title } },
    depth: 0,
    limit: 1,
  })

  return existing.docs[0] ?? null
}
