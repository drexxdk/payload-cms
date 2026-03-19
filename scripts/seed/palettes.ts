import type { Payload } from 'payload'
import { COLOR_TRANSLATIONS, LOCALES, PALETTES, SHADES } from './palette-data'

type PaletteName = (typeof PALETTES)[number]
type LocalizedLocale = Exclude<(typeof LOCALES)[number], 'en'>

const colorTranslations: Record<LocalizedLocale, Record<PaletteName, string>> = COLOR_TRANSLATIONS

export async function seedPalettes(payload: Payload) {
  // Payload localizes fields, so each palette stays as one document and localized
  // values are written by updating the same doc with a different locale.
  for (const p of PALETTES) {
    const title = p[0].toUpperCase() + p.slice(1)

    const existingEn = await payload.find({
      collection: 'palettes',
      where: { palette: { equals: p } },
      depth: 0,
      locale: 'en',
    })
    const shades = SHADES.map((s) => ({ shade: s }))

    let enDoc = existingEn?.docs?.[0]
    if (!enDoc) {
      enDoc = await payload.create({
        collection: 'palettes',
        data: { name: `${title} palette`, palette: p, shades },
        locale: 'en',
      })
      console.log('Created en', p, enDoc.id)
    } else {
      enDoc = await payload.update({
        collection: 'palettes',
        id: enDoc.id,
        data: { name: `${title} palette`, shades },
        locale: 'en',
      })
      console.log('Updated en', p, enDoc.id)
    }

    for (const loc of LOCALES) {
      if (loc === 'en') continue
      const localizedColor = colorTranslations[loc][p]
      const localizedName =
        loc === 'da'
          ? `${localizedColor} palet`
          : loc === 'de'
            ? `${localizedColor} Palette`
            : loc === 'fr'
              ? `Palette ${localizedColor}`
              : `${title} palette`

      await payload.update({
        collection: 'palettes',
        id: enDoc.id,
        data: { name: localizedName },
        locale: loc,
      })
      console.log('Updated', loc, p, enDoc.id)
    }
  }
}
