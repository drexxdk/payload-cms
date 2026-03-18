import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'

const payload = await getPayload({ config })

// Project types to seed
const projectTypes = [
  { title: 'Alinea Portal' },
  { title: 'Villeby' },
  { title: 'HDBHDW' },
  { title: 'Koncentrat' },
]

for (const t of projectTypes) {
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

// Palettes and shades
const PALETTES = [
  'slate',
  'gray',
  'zinc',
  'neutral',
  'stone',
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose',
]

const SHADES = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950']

for (const p of PALETTES) {
  // create one document per palette containing all shades
  const title = p[0].toUpperCase() + p.slice(1)
  const existing = await payload.find({
    collection: 'palettes',
    where: { palette: { equals: p } },
    depth: 0,
  })

  if (!existing?.docs?.length) {
    const shades = SHADES.map((s) => ({ shade: s }))
    await (payload as any).create({ collection: 'palettes', data: { name: `${title} palette`, palette: p, shades } })
    console.log('Created palette:', `${title} palette`)
  } else {
    console.log('Palette exists:', p)
  }
}

console.log('Seeding complete')
process.exit(0)
