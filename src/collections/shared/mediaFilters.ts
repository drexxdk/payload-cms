import type { FilterOptions, PayloadRequest, Where } from 'payload'

import { relationshipID } from '../../access/rbac'

export function filterMediaByKinds(kinds: string[]): Where {
  if (kinds.length === 1) {
    return {
      kind: {
        equals: kinds[0],
      },
    }
  }

  return {
    or: kinds.map((kind) => ({
      kind: {
        equals: kind,
      },
    })),
  }
}

export const imageOnlyMediaFilter = filterMediaByKinds(['image'])

type ScopedMediaContext = {
  courseID?: number | null
  productGroupIDs?: number[]
  productIDs?: number[]
  projectID?: number | null
}

function normalizeNumericID(value: number | string | null | undefined): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

function uniqueIDs(ids: Array<number | null | undefined>): number[] {
  return [
    ...new Set(ids.filter((id): id is number => typeof id === 'number' && Number.isFinite(id))),
  ]
}

async function findProductsForCourse(req: PayloadRequest, courseID: number): Promise<number[]> {
  const result = await req.payload.find({
    collection: 'products',
    depth: 0,
    limit: 200,
    overrideAccess: false,
    pagination: false,
    req,
    where: {
      courses: {
        in: [courseID],
      },
    },
  })

  return result.docs.map((doc) => doc.id)
}

async function findProjectGroupsForProducts(
  req: PayloadRequest,
  productIDs: number[],
): Promise<number[]> {
  if (productIDs.length === 0) return []

  const result = await req.payload.find({
    collection: 'project-groups',
    depth: 0,
    limit: 200,
    overrideAccess: false,
    pagination: false,
    req,
    where: {
      products: {
        in: productIDs,
      },
    },
  })

  return result.docs.map((doc) => doc.id)
}

async function resolveCourseScopedContext(
  req: PayloadRequest,
  courseID: number | null,
): Promise<ScopedMediaContext> {
  if (courseID === null) return {}

  const course = await req.payload.findByID({
    collection: 'courses',
    id: courseID,
    depth: 0,
    overrideAccess: false,
    req,
  })

  const projectID = relationshipID(course.project)
  const productIDs = await findProductsForCourse(req, courseID)
  const productGroupIDs = await findProjectGroupsForProducts(req, productIDs)

  return {
    courseID,
    productGroupIDs,
    productIDs,
    projectID,
  }
}

async function resolveChapterScopedContext(
  req: PayloadRequest,
  chapterID: number | null,
): Promise<ScopedMediaContext> {
  if (chapterID === null) return {}

  const chapter = await req.payload.findByID({
    collection: 'course-chapters',
    id: chapterID,
    depth: 0,
    overrideAccess: false,
    req,
  })

  return resolveCourseScopedContext(req, relationshipID(chapter.course))
}

function buildScopedMediaWhere(context: ScopedMediaContext): Where {
  const clauses: Where[] = []

  if (context.projectID !== null && context.projectID !== undefined) {
    clauses.push({
      and: [
        {
          availabilityScope: {
            equals: 'project',
          },
        },
        {
          project: {
            equals: context.projectID,
          },
        },
      ],
    })
  }

  if (context.courseID !== null && context.courseID !== undefined) {
    clauses.push({
      and: [
        {
          availabilityScope: {
            equals: 'course',
          },
        },
        {
          course: {
            equals: context.courseID,
          },
        },
      ],
    })
  }

  if (context.productIDs?.length) {
    clauses.push({
      and: [
        {
          availabilityScope: {
            equals: 'product',
          },
        },
        {
          product: {
            in: context.productIDs,
          },
        },
      ],
    })
  }

  if (context.productGroupIDs?.length) {
    clauses.push({
      and: [
        {
          availabilityScope: {
            equals: 'projectGroup',
          },
        },
        {
          projectGroup: {
            in: context.productGroupIDs,
          },
        },
      ],
    })
  }

  if (clauses.length === 0) return imageOnlyMediaFilter

  return {
    and: [
      imageOnlyMediaFilter,
      {
        or: clauses,
      },
    ],
  }
}

export const projectScopedImageMediaFilter: FilterOptions = ({ data, siblingData }) => {
  const projectID =
    relationshipID((siblingData as { project?: unknown } | undefined)?.project) ??
    relationshipID((data as { project?: unknown } | undefined)?.project)

  return buildScopedMediaWhere({ projectID })
}

export const courseScopedImageMediaFilter: FilterOptions = async ({
  data,
  id,
  req,
  siblingData,
}) => {
  const projectID =
    relationshipID((siblingData as { project?: unknown } | undefined)?.project) ??
    relationshipID((data as { project?: unknown } | undefined)?.project)
  const courseID = normalizeNumericID(id)

  if (courseID === null) {
    return buildScopedMediaWhere({ projectID })
  }

  let courseContext: ScopedMediaContext

  try {
    courseContext = await resolveCourseScopedContext(req, courseID)
  } catch {
    return buildScopedMediaWhere({ projectID })
  }

  return buildScopedMediaWhere({
    ...courseContext,
    projectID: projectID ?? courseContext.projectID,
  })
}

export const chapterScopedImageMediaFilter: FilterOptions = async ({ data, req, siblingData }) => {
  const courseID =
    relationshipID((siblingData as { course?: unknown } | undefined)?.course) ??
    relationshipID((data as { course?: unknown } | undefined)?.course)

  if (courseID === null) {
    return imageOnlyMediaFilter
  }

  let courseContext: ScopedMediaContext

  try {
    courseContext = await resolveCourseScopedContext(req, courseID)
  } catch {
    return imageOnlyMediaFilter
  }

  return buildScopedMediaWhere(courseContext)
}

export const pageScopedImageMediaFilter: FilterOptions = async ({ data, req, siblingData }) => {
  const chapterID =
    relationshipID((siblingData as { chapter?: unknown } | undefined)?.chapter) ??
    relationshipID((data as { chapter?: unknown } | undefined)?.chapter)

  if (chapterID === null) {
    return imageOnlyMediaFilter
  }

  let chapterContext: ScopedMediaContext

  try {
    chapterContext = await resolveChapterScopedContext(req, chapterID)
  } catch {
    return imageOnlyMediaFilter
  }

  return buildScopedMediaWhere(chapterContext)
}
