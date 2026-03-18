import React from 'react'

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
] as const

const SHADES = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'] as const

type Palette = (typeof PALETTES)[number]

const CLASSES: Record<Palette, string[]> = Object.fromEntries(
  PALETTES.map((p) => [p, SHADES.map((s) => `bg-${p}-${s}`)]),
) as Record<Palette, string[]>

export default function PalettePage() {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">Tailwind Color Palettes</h1>
      <p className="mb-4">Preview of Tailwind&apos;s default palettes and shades.</p>

      <div className="space-y-6">
        {PALETTES.map((palette) => (
          <section key={palette} className="border rounded-lg overflow-hidden">
            <div className="p-4 bg-gray-50 flex items-center justify-between">
              <div className="font-medium">{palette}</div>
              <div className="text-sm text-gray-600">shades: 50 — 950</div>
            </div>

            <div className="grid grid-cols-11">
              {CLASSES[palette].map((c, i) => (
                <div
                  key={`${palette}-${SHADES[i]}`}
                  className={`${c} p-4 text-center text-xs ${i < 5 ? 'text-black' : 'text-white'}`}
                >
                  {SHADES[i]}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
