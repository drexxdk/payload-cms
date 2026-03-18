import configPromise from '@payload-config'
import { getPayload } from 'payload'

export const POST = async (request: Request) => {
  try {
    const body = await request.json()
    const { id, pendingOverrides = {}, pendingUseDarkMap = {} } = body

    if (!id) return new Response(JSON.stringify({ error: 'missing id' }), { status: 400 })

    const payload = await getPayload({ config: configPromise })

    const doc = await payload.findByID({ collection: 'palettes', id, depth: 0 })
    if (!doc) return new Response(JSON.stringify({ error: 'not found' }), { status: 404 })

    const shades = Array.isArray(doc.shades) ? doc.shades.map((s: any, idx: number) => ({
      ...s,
      overrideUseDarkAccent: typeof pendingOverrides[idx] !== 'undefined' ? !!pendingOverrides[idx] : s.overrideUseDarkAccent,
      useDarkAccent: typeof pendingUseDarkMap[idx] !== 'undefined' ? pendingUseDarkMap[idx] : s.useDarkAccent,
    })) : []

    const updated = await payload.update({ collection: 'palettes', id, data: { shades } })

    return new Response(JSON.stringify({ doc: updated }), { status: 200 })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 })
  }
}
