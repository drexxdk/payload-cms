import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
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
import { Palettes } from './collections/Palettes'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
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
    Palettes,
  ],
  editor: lexicalEditor(),
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
