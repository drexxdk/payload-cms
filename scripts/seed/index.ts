import { preGenerateSeedHeroImages } from './ensure-seed-hero-image'
import { getPayloadInstance } from './utils'
import { seedCourses } from './courses'
import { seedPalettes } from './palettes'
import { seedProjects } from './projects'
import { seedProjectTypes } from './projectTypes'
import { seedProductTypes } from './productTypes'
import { seedProducts } from './products'

async function main() {
  console.log('Generating seed hero images...')
  const heroImages = await preGenerateSeedHeroImages()
  console.log(`Prepared ${heroImages.count} seed hero images in ${heroImages.directory}`)

  const payload = await getPayloadInstance()

  console.log('Seeding project types...')
  await seedProjectTypes(payload)

  console.log('Seeding product types...')
  await seedProductTypes(payload)

  console.log('Seeding projects and memberships...')
  await seedProjects(payload)

  console.log('Seeding products...')
  await seedProducts(payload)

  console.log('Seeding course structures...')
  await seedCourses(payload)

  console.log('Seeding palettes...')
  await seedPalettes(payload)

  console.log('Seeding complete')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
