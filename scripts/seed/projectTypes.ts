import type { Payload } from 'payload'
import { PROJECT_TYPES } from './type-data'

export async function seedProjectTypes(payload: Payload) {
  for (const projectType of PROJECT_TYPES) {
    const existing = await payload.find({
      collection: 'project-types',
      where: { title: { equals: projectType.title } },
      depth: 0,
    })

    if (!existing?.docs?.length) {
      await payload.create({ collection: 'project-types', data: projectType })
      console.log('Created project-type:', projectType.title)
    } else {
      console.log('Already exists:', projectType.title)
    }
  }
}
