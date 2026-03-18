import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'

const payload = await getPayload({ config })

const types = [
  { title: 'Alinea Portal' },
  { title: 'Villeby' },
  { title: 'HDBHDW' },
  { title: 'Koncentrat' },
]

for (const t of types) {
  const existing = await payload.find({
    collection: 'project-types',
    where: { title: { equals: t.title } },
    depth: 0,
  })

  if (!existing?.docs?.length) {
    await payload.create({ collection: 'project-types', data: t })
    console.log('Created project-type:', t.title)
  } else {
    console.log('Already exists:', t.title)
  }
}

process.exit(0)
