import { getPayloadInstance } from './utils'
import { seedPalettes } from './palettes'
import { seedProjectTypes } from './projectTypes'

async function main() {
  const payload = await getPayloadInstance()

  console.log('Seeding project types...')
  await seedProjectTypes(payload)

  console.log('Seeding palettes...')
  await seedPalettes(payload)

  console.log('Seeding complete')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
