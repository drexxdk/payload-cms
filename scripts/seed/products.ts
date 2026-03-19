import type { Payload } from 'payload'
import type { Product } from '../../src/payload-types'
import { DEMO_PROJECT } from './demo'
import { PRODUCTS } from './product-data'

export async function seedProducts(payload: Payload) {
  const demoProductIDs: number[] = []

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

    type ProductWriteData = Pick<Product, 'title' | 'isbn' | 'productType' | 'courses'>

    const data: ProductWriteData = {
      title: p.title,
      isbn: p.isbn || undefined,
      productType: productTypeId,
      courses: courseIDs.length ? courseIDs : undefined,
    }

    let productID: number

    if (!existing) {
      const created = await payload.create({ collection: 'products', data })
      productID = created.id
      console.log('Created product:', p.title)
    } else {
      const updated = await payload.update({
        collection: 'products',
        id: existing.id,
        data,
      })
      productID = updated.id
      console.log('Updated product:', p.title)
    }

    if (courseIDs.length > 0) {
      demoProductIDs.push(productID)
    }
  }

  const demoGroup = await payload.find({
    collection: 'project-groups',
    where: {
      title: {
        equals: DEMO_PROJECT.groupTitle,
      },
    },
    depth: 0,
    limit: 1,
  })

  if (demoGroup.docs[0]) {
    await payload.update({
      collection: 'project-groups',
      id: demoGroup.docs[0].id,
      data: {
        products: demoProductIDs,
      },
      depth: 0,
    })
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
