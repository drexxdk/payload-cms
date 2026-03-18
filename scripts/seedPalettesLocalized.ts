/* eslint-disable @typescript-eslint/no-explicit-any */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'

const payload = await getPayload({ config })

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
const locales = ['da', 'de', 'fr'] as const

for (const p of PALETTES) {
  const title = p[0].toUpperCase() + p.slice(1)

  // Ensure English base exists
  const existingEn = await payload.find({
    collection: 'palettes',
    where: { palette: { equals: p } },
    depth: 0,
    locale: 'en',
  })

  let enDoc = existingEn?.docs?.[0]
  if (!enDoc) {
    const shades = SHADES.map((s) => ({ shade: s }))
    enDoc = await payload.create({
      collection: 'palettes',
      data: { name: `${title} palette`, palette: p, shades },
      locale: 'en',
    })
    console.log('Created en palette:', enDoc.id)
  } else {
    console.log('English palette exists:', p)
  }

  // Create localized versions
  for (const loc of locales) {
    const existingLoc = await payload.find({
      collection: 'palettes',
      where: { palette: { equals: p } },
      depth: 0,
      locale: loc,
    })

    if (existingLoc?.docs?.length) {
      console.log(`Locale ${loc} exists for ${p}`)
      continue
    }

    const localizedName =
      {
        da: `${title} palet`,
        de: `${title} Palette`,
        fr: `Palette ${title}`,
      }[loc] || `${title} palette`

    const shades = SHADES.map((s) => ({ shade: s }))

    const created = await (payload as any).create({
      collection: 'palettes',
      data: { name: localizedName, palette: p, shades, localizations: [enDoc.id] },
      locale: loc as (typeof locales)[number],
    })

    console.log(`Created ${loc} palette:`, created.id)
  }
}

console.log('Localized palettes seeding complete')
process.exit(0)
