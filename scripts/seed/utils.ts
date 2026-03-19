import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../../src/payload.config'

export async function getPayloadInstance() {
  const payload = await getPayload({ config })
  return payload
}

export const PALETTES = [
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

export const LOCALES = ['en', 'da', 'de', 'fr'] as const

export const SHADES = [
  '50',
  '100',
  '200',
  '300',
  '400',
  '500',
  '600',
  '700',
  '800',
  '900',
  '950',
] as const
