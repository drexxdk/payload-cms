import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../../src/payload.config'

export async function getPayloadInstance() {
  const payload = await getPayload({ config })
  return payload
}
