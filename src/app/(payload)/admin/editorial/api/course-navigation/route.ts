import { loadCourseNavigation } from '@/lib/editorial'

const courseRoutePattern =
  /^\/admin\/editorial\/projects\/(\d+)\/groups\/(\d+)\/products\/(\d+)\/courses\/(\d+)(?:\/chapters\/(\d+))?(?:\/pages\/(\d+))?(?:\/content\/(\d+))?\/?$/

function toInteger(value?: string) {
  if (!value) return undefined

  const parsedValue = Number(value)

  return Number.isInteger(parsedValue) ? parsedValue : undefined
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const pathname = searchParams.get('pathname')
  const locale = searchParams.get('locale') ?? undefined

  if (!pathname) {
    return Response.json({ error: 'Missing pathname.' }, { status: 400 })
  }

  const match = pathname.match(courseRoutePattern)

  if (!match) {
    return Response.json({ error: 'Not a course route.' }, { status: 400 })
  }

  const [, projectID, groupID, productID, courseID, chapterID, pageID, contentID] = match

  const navigation = await loadCourseNavigation(
    Number(projectID),
    Number(groupID),
    Number(productID),
    Number(courseID),
    {
      chapterID: toInteger(chapterID),
      contentID: toInteger(contentID),
      pageID: toInteger(pageID),
    },
    locale,
  )

  if (!navigation) {
    return Response.json({ error: 'Navigation not found.' }, { status: 404 })
  }

  return Response.json(navigation)
}