import type { Payload } from 'payload'
import { PRODUCT_TYPES } from './type-data'

export async function seedProductTypes(payload: Payload) {
  for (const t of PRODUCT_TYPES) {
    const existing = await ensureProductType(payload, t.title)

    if (!existing) {
      await payload.create({ collection: 'product-types', data: t })
      console.log('Created product-type:', t.title)
    } else {
      console.log('Already exists:', t.title)
    }
  }
}

export async function ensureProductType(payload: Payload, title: string) {
  const existing = await payload.find({
    collection: 'product-types',
    where: { title: { equals: title } },
    depth: 0,
    limit: 1,
  })

  return existing.docs[0] ?? null
}
