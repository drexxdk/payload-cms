import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'

const payload = await getPayload({ config })

const id = process.argv[2] || '264'
const idx = Number(process.argv[3] || 0)

console.log('Setting override for palette', id, 'index', idx)

const doc = await payload.findByID({ collection: 'palettes', id, depth: 0 })
if (!doc) {
  console.error('Palette not found')
  process.exit(2)
}

const shades = Array.isArray(doc.shades) ? doc.shades.slice() : []
if (idx < 0 || idx >= shades.length) {
  console.error('Index out of range')
  process.exit(2)
}

shades[idx] = { ...shades[idx], overrideUseDarkAccent: true }

const updated = await payload.update({ collection: 'palettes', id, data: { shades } })
console.log('Updated:')
console.dir(updated, { depth: 3 })
process.exit(0)
