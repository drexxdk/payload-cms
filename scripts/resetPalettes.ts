import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'

const payload = await getPayload({ config })

console.log('Finding existing palettes...')
const existing = await payload.find({ collection: 'palettes', depth: 0, limit: 1000 })

if (existing?.docs?.length) {
  console.log(`Deleting ${existing.docs.length} existing palettes...`)
  for (const doc of existing.docs) {
    try {
      await payload.delete({ collection: 'palettes', id: doc.id })
      console.log('Deleted', doc.id)
    } catch (err) {
      console.error('Failed to delete', doc.id, err)
    }
  }
} else {
  console.log('No existing palettes to delete')
}

// Re-seed palettes (same logic as scripts/seedAll.ts)
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
  const name = `${p} palette`
  const shades = SHADES.map((s) => ({ shade: s }))

  await (payload as any).create({
    collection: 'palettes',
    data: {
      name,
      palette: p,
      shades,
    },
  })

  console.log('Created palette:', name)
}

console.log('Reset complete')
process.exit(0)
