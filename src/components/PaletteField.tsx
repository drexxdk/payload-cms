'use client'

import React from 'react'
import { Switch } from '@headlessui/react'
import { useField, useFormFields } from '@payloadcms/ui'
import tailwindColors from 'tailwindcss/colors'

const SHADES = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'] as const

type Shade = {
  shade?: string | null
  overrideUseDarkAccent?: boolean | null
}

type TailwindPalette = Record<string, string>

const paletteMap = tailwindColors as Record<string, TailwindPalette | string>

const SHADES_WITH_DARK_ACCENT = new Set(['50', '100', '200', '300', '400'])

const getShadeColor = (paletteName: unknown, shade: string) => {
  if (typeof paletteName !== 'string') return undefined

  const selectedPalette = paletteMap[paletteName]
  if (!selectedPalette || typeof selectedPalette !== 'object') return undefined

  const value = selectedPalette[shade]
  return typeof value === 'string' ? value : undefined
}

const getSwitchStyle = (checked: boolean): React.CSSProperties => ({
  position: 'relative',
  display: 'inline-flex',
  height: 24,
  width: 44,
  alignItems: 'center',
  border: 0,
  borderRadius: 9999,
  backgroundColor: checked ? '#2563eb' : '#d1d5db',
  boxShadow: checked
    ? 'inset 0 0 0 1px rgba(37, 99, 235, 0.35)'
    : 'inset 0 0 0 1px rgba(15, 23, 42, 0.08)',
  cursor: 'pointer',
  transition: 'background-color 160ms ease, box-shadow 160ms ease',
  flexShrink: 0,
})

const getSwitchThumbStyle = (checked: boolean): React.CSSProperties => ({
  display: 'inline-block',
  height: 20,
  width: 20,
  borderRadius: 9999,
  backgroundColor: '#ffffff',
  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.22)',
  transform: checked ? 'translateX(22px)' : 'translateX(2px)',
  transition: 'transform 160ms ease',
  willChange: 'transform',
})

function PaletteShadeRow({ index, palette }: { index: number; palette: unknown }) {
  const shadeField = useField<string | null>({ path: `shades.${index}.shade` })
  const overrideField = useField<boolean | null>({ path: `shades.${index}.overrideUseDarkAccent` })

  const shade = shadeField.value ?? SHADES[index]
  const override = Boolean(overrideField.value)
  const backgroundColor = getShadeColor(palette, shade)
  const useDarkAccent = SHADES_WITH_DARK_ACCENT.has(shade)
  const effectiveAccentIsDark = override ? !useDarkAccent : useDarkAccent
  const previewStyle: React.CSSProperties = {
    backgroundColor,
    color: effectiveAccentIsDark ? '#111111' : '#ffffff',
  }

  return (
    <tr className="border-t border-[var(--theme-elevation-100)] align-middle first:border-t-0">
      <td className="px-4 py-4 text-sm font-medium text-[var(--theme-text)]">{shade}</td>
      <td className="px-4 py-4">
        <div
          className="flex h-12 w-56 items-center rounded-xl border border-black/10 px-4 text-sm font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
          style={previewStyle}
        >
          The quick brown fox
        </div>
      </td>
      <td className="px-4 py-4 text-sm text-[var(--theme-text)] opacity-75">
        {useDarkAccent ? 'Dark accent' : 'Light accent'}
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <Switch
            checked={override}
            onChange={(checked) => overrideField.setValue(checked)}
            style={getSwitchStyle(override)}
          >
            <span className="sr-only">Override accent for shade {shade}</span>
            <span aria-hidden="true" style={getSwitchThumbStyle(override)} />
          </Switch>
          <span className="text-sm text-[var(--theme-text)] opacity-75">
            {override ? 'Using alternate accent' : 'Using recommended accent'}
          </span>
        </div>
      </td>
    </tr>
  )
}

export default function PaletteField() {
  const palette = useFormFields(([fields]) => fields?.palette?.value)

  return (
    <div className="p-2">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-[var(--theme-text)]">Palette</div>
          <div className="text-xs text-[var(--theme-text)] opacity-70">{String(palette ?? '')}</div>
        </div>
        <div className="text-xs uppercase tracking-[0.18em] text-[var(--theme-text)] opacity-55">
          Override accent
        </div>
      </div>

      <div className="overflow-x-auto rounded-[14px] border border-[var(--theme-elevation-150)] bg-[var(--theme-elevation-0)]">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.16em] text-[var(--theme-text)] opacity-70">
              <th className="px-4 py-3">Shade</th>
              <th className="px-4 py-3">Preview</th>
              <th className="px-4 py-3">Recommended</th>
              <th className="px-4 py-3">Override</th>
            </tr>
          </thead>
          <tbody>
            {SHADES.map((_, index) => (
              <PaletteShadeRow key={SHADES[index]} index={index} palette={palette} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
