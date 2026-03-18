import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'

const payload = await getPayload({ config })

const res = await payload.find({ collection: 'palettes', depth: 2, limit: 1 })
const doc = res?.docs?.[0]

console.log('Found palette doc:')
console.dir(doc, { depth: 6 })

process.exit(0)
