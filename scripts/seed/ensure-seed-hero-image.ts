import fs from 'fs/promises'
import path from 'path'
import sharp from 'sharp'

import { COURSE_CONTENT_SEED_DATA, COURSE_SEED_DATA } from './course-data'

const HERO_HEIGHT = 600
const HERO_WIDTH = 800

type SeedHeroImageTheme = 'content-image' | 'course' | 'product' | 'project' | 'project-group'

type SeedHeroImageRequest = {
  fileName: string
  subtitle: string
  theme: SeedHeroImageTheme
  title: string
}

type ThemePalette = {
  accent: string
  accentSoft: string
  backgroundEnd: string
  backgroundStart: string
  label: string
}

const THEME_PALETTES: Record<SeedHeroImageTheme, ThemePalette> = {
  'content-image': {
    accent: '#F97316',
    accentSoft: '#FED7AA',
    backgroundEnd: '#7C2D12',
    backgroundStart: '#EA580C',
    label: 'Content image',
  },
  course: {
    accent: '#38BDF8',
    accentSoft: '#BAE6FD',
    backgroundEnd: '#1D4ED8',
    backgroundStart: '#0F766E',
    label: 'Course hero',
  },
  product: {
    accent: '#A78BFA',
    accentSoft: '#DDD6FE',
    backgroundEnd: '#6D28D9',
    backgroundStart: '#312E81',
    label: 'Product hero',
  },
  project: {
    accent: '#FACC15',
    accentSoft: '#FEF08A',
    backgroundEnd: '#14532D',
    backgroundStart: '#15803D',
    label: 'Project hero',
  },
  'project-group': {
    accent: '#FB7185',
    accentSoft: '#FECDD3',
    backgroundEnd: '#9F1239',
    backgroundStart: '#BE123C',
    label: 'Group hero',
  },
}

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function filenameSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function toTheme(scope: 'course' | 'product' | 'project' | 'projectGroup'): SeedHeroImageTheme {
  if (scope === 'projectGroup') {
    return 'project-group'
  }

  return scope
}

function buildHeroSvg({ subtitle, theme, title }: SeedHeroImageRequest) {
  const palette = THEME_PALETTES[theme]

  return `
  <svg width="${HERO_WIDTH}" height="${HERO_HEIGHT}" viewBox="0 0 ${HERO_WIDTH} ${HERO_HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="800" y2="600" gradientUnits="userSpaceOnUse">
        <stop stop-color="${palette.backgroundStart}" />
        <stop offset="1" stop-color="${palette.backgroundEnd}" />
      </linearGradient>
      <linearGradient id="panel" x1="72" y1="84" x2="682" y2="520" gradientUnits="userSpaceOnUse">
        <stop stop-color="rgba(255,255,255,0.26)" />
        <stop offset="1" stop-color="rgba(255,255,255,0.08)" />
      </linearGradient>
      <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="22" />
      </filter>
    </defs>

    <rect width="800" height="600" fill="url(#bg)" />
    <circle cx="114" cy="118" r="130" fill="${palette.accent}" opacity="0.28" filter="url(#blur)" />
    <circle cx="722" cy="490" r="190" fill="#ffffff" opacity="0.12" filter="url(#blur)" />
    <circle cx="660" cy="142" r="96" fill="${palette.accentSoft}" opacity="0.18" filter="url(#blur)" />

    <rect x="56" y="56" width="688" height="488" rx="34" fill="url(#panel)" stroke="rgba(255,255,255,0.22)" />
    <rect x="92" y="98" width="146" height="36" rx="18" fill="rgba(255,255,255,0.16)" />
    <text x="116" y="122" fill="#ffffff" font-size="18" font-family="Segoe UI, Arial, sans-serif" font-weight="700">${escapeXml(palette.label)}</text>

    <text x="92" y="252" fill="#ffffff" font-size="54" font-family="Segoe UI, Arial, sans-serif" font-weight="700">${escapeXml(title)}</text>
    <text x="92" y="306" fill="rgba(255,255,255,0.86)" font-size="24" font-family="Segoe UI, Arial, sans-serif">${escapeXml(subtitle)}</text>

    <g transform="translate(92 376)">
      <rect width="266" height="80" rx="22" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.18)" />
      <circle cx="42" cy="40" r="16" fill="${palette.accent}" />
      <rect x="74" y="28" width="136" height="10" rx="5" fill="rgba(255,255,255,0.82)" />
      <rect x="74" y="46" width="104" height="10" rx="5" fill="rgba(255,255,255,0.46)" />
    </g>

    <path d="M530 122C578 112 626 118 674 144C722 170 744 222 744 300" stroke="rgba(255,255,255,0.28)" stroke-width="2" stroke-dasharray="8 10" />
    <path d="M536 420C588 390 640 386 690 402C718 410 736 430 744 462" stroke="rgba(255,255,255,0.22)" stroke-width="2" stroke-dasharray="10 10" />
  </svg>`
}

function getHeroDirectory() {
  return path.resolve(process.cwd(), 'media', 'hero-images')
}

function getHeroImagePath(fileName: string) {
  const safeName = filenameSlug(fileName) || 'seeded-hero'
  return path.join(getHeroDirectory(), `${safeName}.jpg`)
}

export async function ensureSeedHeroImage(request: SeedHeroImageRequest) {
  const filePath = getHeroImagePath(request.fileName)

  try {
    await fs.access(filePath)
    return filePath
  } catch {
    // File does not exist yet.
  }

  await fs.mkdir(getHeroDirectory(), { recursive: true })
  await sharp(Buffer.from(buildHeroSvg(request)))
    .jpeg({ mozjpeg: true, quality: 92 })
    .toFile(filePath)

  return filePath
}

export function createProjectCourseHeroImageRequest(courseTitle: string): SeedHeroImageRequest {
  return {
    fileName: `${courseTitle}-hero-image`,
    subtitle: 'RBAC demo course hero',
    theme: 'project',
    title: courseTitle,
  }
}

export function createScopedSeedImageRequest(args: {
  alt: string
  scope: 'course' | 'product' | 'project' | 'projectGroup'
}): SeedHeroImageRequest {
  return {
    fileName: args.alt,
    subtitle: `${THEME_PALETTES[toTheme(args.scope)].label} generated for local seeds`,
    theme: toTheme(args.scope),
    title: args.alt,
  }
}

function getSeedHeroImageRequests(): SeedHeroImageRequest[] {
  const requests = new Map<string, SeedHeroImageRequest>()

  for (const course of COURSE_SEED_DATA) {
    const courseHero = createProjectCourseHeroImageRequest(course.title)
    requests.set(courseHero.fileName, courseHero)

    for (const chapter of course.chapters) {
      const chapterRequest = createScopedSeedImageRequest({
        alt: `${course.title} - ${chapter.title} hero`,
        scope: chapter.heroScope ?? 'course',
      })
      requests.set(chapterRequest.fileName, chapterRequest)

      for (const page of chapter.pages) {
        if (page.heroScope) {
          const pageRequest = createScopedSeedImageRequest({
            alt: `${course.title} - ${page.title} hero`,
            scope: page.heroScope,
          })
          requests.set(pageRequest.fileName, pageRequest)
        }
      }
    }
  }

  for (const definition of COURSE_CONTENT_SEED_DATA) {
    if (definition.type === 'image') {
      const contentRequest = createScopedSeedImageRequest({
        alt: `${definition.title} seeded image`,
        scope: definition.mediaScope,
      })
      requests.set(contentRequest.fileName, contentRequest)
    }
  }

  return [...requests.values()]
}

export async function preGenerateSeedHeroImages() {
  const requests = getSeedHeroImageRequests()

  await Promise.all(requests.map((request) => ensureSeedHeroImage(request)))

  return {
    count: requests.length,
    directory: getHeroDirectory(),
  }
}
