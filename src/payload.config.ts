import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { da } from '@payloadcms/translations/languages/da'
import { de } from '@payloadcms/translations/languages/de'
import { en } from '@payloadcms/translations/languages/en'
import { fr } from '@payloadcms/translations/languages/fr'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Projects } from './collections/Projects'
import { ProjectTypes } from './collections/ProjectTypes'
import { ProductTypes } from './collections/ProductTypes'
import { Products } from './collections/Products'
import { ProjectGroups } from './collections/ProjectGroups'
import { Courses } from './collections/Courses'
import { CourseChapters } from './collections/CourseChapters'
import { CoursePages } from './collections/CoursePages'
import { CourseContent } from './collections/CourseContent'
import { Palettes } from './collections/Palettes'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const baseLexicalEditor = lexicalEditor()

const editor: typeof baseLexicalEditor = async (args) => {
  const adapter = await baseLexicalEditor(args)

  return {
    ...adapter,
    FieldComponent: {
      path: '/components/admin/ProjectDescriptionField',
    },
    generateImportMap: (importMapArgs) => {
      importMapArgs.addToImportMap('/components/admin/ProjectDescriptionField')
      return adapter.generateImportMap?.(importMapArgs)
    },
  }
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      views: {
        dashboard: {
          Component: '/components/admin/AdminDashboard',
        },
      },
    },
  },
  i18n: {
    fallbackLanguage: 'en',
    supportedLanguages: {
      da,
      de,
      en,
      fr,
    },
  },
  localization: {
    locales: ['en', 'da', 'de', 'fr'],
    defaultLocale: 'en',
    fallback: true,
  },
  collections: [
    Users,
    Media,
    ProjectTypes,
    ProductTypes,
    Products,
    Projects,
    ProjectGroups,
    Courses,
    CourseChapters,
    CoursePages,
    CourseContent,
    Palettes,
  ],
  editor,
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [],
})
