import type { Payload } from 'payload'

const PROJECT_TYPES = [
  { title: 'Alinea Portal' },
  { title: 'Villeby' },
  { title: 'HDBHDW' },
  { title: 'Koncentrat' },
]

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
