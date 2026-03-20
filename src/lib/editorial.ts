import { headers as getHeaders } from 'next/headers'
import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

import { relationshipID } from '@/access/rbac'
import type {
  Course,
  CourseChapter,
  CourseContent,
  CoursePage,
  Product,
  Project,
  ProjectGroup,
  User,
} from '@/payload-types'

const SUPPORTED_LOCALES = new Set(['da', 'de', 'en', 'fr'])

type LocaleCode = 'da' | 'de' | 'en' | 'fr'

type EditorialAuthContext = {
  locale: LocaleCode
  payload: Payload
  user: User | null
}

export type EditorialProjectSummary = Pick<Project, 'id' | 'lifecycle' | 'title' | '_status'>

export type EditorialProjectGroupSummary = Pick<ProjectGroup, 'id' | 'title'> & {
  productCount: number
}

export type EditorialProductSummary = Pick<Product, 'id' | 'title' | 'isbn'> & {
  courseCount: number
  productTypeTitle?: string
}

export type EditorialCourseSummary = Pick<Course, 'id' | 'title' | 'isbn' | 'updatedAt'>

export type EditorialChapterSummary = Pick<CourseChapter, 'id' | 'title' | 'updatedAt'>

export type EditorialPageSummary = Pick<CoursePage, 'id' | 'title' | 'updatedAt'> & {
  contentCount: number
}

export type EditorialContentSummary = Pick<
  CourseContent,
  'id' | 'title' | 'contentType' | 'updatedAt'
>

export function editorialHref() {
  return '/admin/editorial'
}

function withEditorialContext(
  path: string,
  returnTo: string,
  context: Record<string, number | string | undefined>,
) {
  const searchParams = new URLSearchParams({
    returnTo,
  })

  for (const [key, value] of Object.entries(context)) {
    if (value === undefined) continue
    searchParams.set(key, String(value))
  }

  return `${path}?${searchParams.toString()}`
}

export function projectHref(projectID: number) {
  return `${editorialHref()}/projects/${projectID}`
}

export function projectGroupHref(projectID: number, groupID: number) {
  return `${projectHref(projectID)}/groups/${groupID}`
}

export function productHref(projectID: number, groupID: number, productID: number) {
  return `${projectGroupHref(projectID, groupID)}/products/${productID}`
}

export function courseHref(
  projectID: number,
  groupID: number,
  productID: number,
  courseID: number,
) {
  return `${productHref(projectID, groupID, productID)}/courses/${courseID}`
}

export function chapterHref(
  projectID: number,
  groupID: number,
  productID: number,
  courseID: number,
  chapterID: number,
) {
  return `${courseHref(projectID, groupID, productID, courseID)}/chapters/${chapterID}`
}

export function pageHref(
  projectID: number,
  groupID: number,
  productID: number,
  courseID: number,
  chapterID: number,
  pageID: number,
) {
  return `${chapterHref(projectID, groupID, productID, courseID, chapterID)}/pages/${pageID}`
}

export function contentHref(
  projectID: number,
  groupID: number,
  productID: number,
  courseID: number,
  chapterID: number,
  pageID: number,
  contentID: number,
) {
  return `${pageHref(projectID, groupID, productID, courseID, chapterID, pageID)}/content/${contentID}`
}

export function projectGroupCreateHref(projectID: number) {
  return withEditorialContext('/admin/collections/project-groups/create', projectHref(projectID), {
    editorialProjectId: projectID,
  })
}

export function projectEditHref(projectID: number) {
  return withEditorialContext(`/admin/collections/projects/${projectID}`, projectHref(projectID), {
    editorialProjectId: projectID,
  })
}

export function projectGroupManageProductsHref(projectID: number, groupID: number) {
  return withEditorialContext(
    `/admin/collections/project-groups/${groupID}`,
    projectGroupHref(projectID, groupID),
    {
      editorialProjectId: projectID,
      editorialGroupId: groupID,
    },
  )
}

export function projectGroupEditHref(projectID: number, groupID: number) {
  return withEditorialContext(
    `/admin/collections/project-groups/${groupID}`,
    projectGroupHref(projectID, groupID),
    {
      editorialProjectId: projectID,
      editorialGroupId: groupID,
    },
  )
}

export function productManageCoursesHref(projectID: number, groupID: number, productID: number) {
  return withEditorialContext(
    `/admin/collections/products/${productID}`,
    productHref(projectID, groupID, productID),
    {
      editorialProjectId: projectID,
      editorialGroupId: groupID,
      editorialProductId: productID,
    },
  )
}

export function productEditHref(projectID: number, groupID: number, productID: number) {
  return withEditorialContext(
    `/admin/collections/products/${productID}`,
    productHref(projectID, groupID, productID),
    {
      editorialProjectId: projectID,
      editorialGroupId: groupID,
      editorialProductId: productID,
    },
  )
}

export function chapterCreateHref(
  projectID: number,
  groupID: number,
  productID: number,
  courseID: number,
) {
  return withEditorialContext(
    '/admin/collections/course-chapters/create',
    courseHref(projectID, groupID, productID, courseID),
    {
      editorialProjectId: projectID,
      editorialGroupId: groupID,
      editorialProductId: productID,
      editorialCourseId: courseID,
    },
  )
}

export function courseEditHref(
  projectID: number,
  groupID: number,
  productID: number,
  courseID: number,
) {
  return withEditorialContext(
    `/admin/collections/courses/${courseID}`,
    courseHref(projectID, groupID, productID, courseID),
    {
      editorialProjectId: projectID,
      editorialGroupId: groupID,
      editorialProductId: productID,
      editorialCourseId: courseID,
    },
  )
}

export function pageCreateHref(
  projectID: number,
  groupID: number,
  productID: number,
  courseID: number,
  chapterID: number,
) {
  return withEditorialContext(
    '/admin/collections/course-pages/create',
    chapterHref(projectID, groupID, productID, courseID, chapterID),
    {
      editorialProjectId: projectID,
      editorialGroupId: groupID,
      editorialProductId: productID,
      editorialCourseId: courseID,
      editorialChapterId: chapterID,
    },
  )
}

export function chapterEditHref(
  projectID: number,
  groupID: number,
  productID: number,
  courseID: number,
  chapterID: number,
) {
  return withEditorialContext(
    `/admin/collections/course-chapters/${chapterID}`,
    chapterHref(projectID, groupID, productID, courseID, chapterID),
    {
      editorialProjectId: projectID,
      editorialGroupId: groupID,
      editorialProductId: productID,
      editorialCourseId: courseID,
      editorialChapterId: chapterID,
    },
  )
}

export function pageManageContentHref(
  projectID: number,
  groupID: number,
  productID: number,
  courseID: number,
  chapterID: number,
  pageID: number,
) {
  return withEditorialContext(
    `/admin/collections/course-pages/${pageID}`,
    pageHref(projectID, groupID, productID, courseID, chapterID, pageID),
    {
      editorialProjectId: projectID,
      editorialGroupId: groupID,
      editorialProductId: productID,
      editorialCourseId: courseID,
      editorialChapterId: chapterID,
      editorialPageId: pageID,
    },
  )
}

export function pageEditHref(
  projectID: number,
  groupID: number,
  productID: number,
  courseID: number,
  chapterID: number,
  pageID: number,
) {
  return withEditorialContext(
    `/admin/collections/course-pages/${pageID}`,
    pageHref(projectID, groupID, productID, courseID, chapterID, pageID),
    {
      editorialProjectId: projectID,
      editorialGroupId: groupID,
      editorialProductId: productID,
      editorialCourseId: courseID,
      editorialChapterId: chapterID,
      editorialPageId: pageID,
    },
  )
}

export function contentEditHref(
  projectID: number,
  groupID: number,
  productID: number,
  courseID: number,
  chapterID: number,
  pageID: number,
  contentID: number,
) {
  return withEditorialContext(
    `/admin/collections/course-content/${contentID}`,
    contentHref(projectID, groupID, productID, courseID, chapterID, pageID, contentID),
    {
      editorialProjectId: projectID,
      editorialGroupId: groupID,
      editorialProductId: productID,
      editorialCourseId: courseID,
      editorialChapterId: chapterID,
      editorialPageId: pageID,
    },
  )
}

export function formatStatus(status?: string | null, lifecycle?: string | null) {
  const parts: string[] = []

  if (status === 'draft') parts.push('Draft')
  if (status === 'published') parts.push('Published')
  if (lifecycle === 'active') parts.push('Active')
  if (lifecycle === 'archived') parts.push('Archived')

  return parts
}

export function formatDate(value?: string | null) {
  if (!value) return undefined

  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function richTextSummary(value: unknown) {
  if (!value || typeof value !== 'object') return undefined

  const root = (value as { root?: { children?: unknown[] } }).root
  if (!root || !Array.isArray(root.children) || root.children.length === 0) return undefined

  return 'Rich text content available'
}

export async function getEditorialAuthContext(localeInput?: string): Promise<EditorialAuthContext> {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  return {
    locale: normalizeLocale(localeInput),
    payload,
    user,
  }
}

async function findByIDSafe<T>(loader: () => Promise<T>): Promise<T | null> {
  try {
    return await loader()
  } catch {
    return null
  }
}

async function findDocsSafe<T>(loader: () => Promise<{ docs: T[] }>): Promise<T[]> {
  try {
    const result = await loader()
    return result.docs
  } catch {
    return []
  }
}

function normalizeLocale(localeInput?: string): LocaleCode {
  if (localeInput && SUPPORTED_LOCALES.has(localeInput)) {
    return localeInput as LocaleCode
  }

  return 'en'
}

function relationIDs(value: unknown): number[] {
  if (!Array.isArray(value)) return []

  return value
    .map((entry) => relationshipID(entry))
    .filter((entry): entry is number => entry !== null)
}

function includesRelation(value: unknown, expectedID: number) {
  return relationIDs(value).includes(expectedID)
}

function sortByIDs<T extends { id: number }>(docs: T[], ids: number[]) {
  const order = new Map(ids.map((id, index) => [id, index]))

  return [...docs].sort((left, right) => {
    const leftIndex = order.get(left.id) ?? Number.MAX_SAFE_INTEGER
    const rightIndex = order.get(right.id) ?? Number.MAX_SAFE_INTEGER

    return leftIndex - rightIndex
  })
}

async function getProjectByID(context: EditorialAuthContext, projectID: number) {
  return findByIDSafe(() =>
    context.payload.findByID({
      collection: 'projects',
      id: projectID,
      depth: 0,
      locale: context.locale,
      overrideAccess: false,
      user: context.user ?? undefined,
    }),
  )
}

async function getProjectGroupByID(context: EditorialAuthContext, groupID: number) {
  return findByIDSafe(() =>
    context.payload.findByID({
      collection: 'project-groups',
      id: groupID,
      depth: 0,
      locale: context.locale,
      overrideAccess: false,
      user: context.user ?? undefined,
    }),
  )
}

async function getProductByID(context: EditorialAuthContext, productID: number) {
  return findByIDSafe(() =>
    context.payload.findByID({
      collection: 'products',
      id: productID,
      depth: 0,
      locale: context.locale,
      overrideAccess: false,
      user: context.user ?? undefined,
    }),
  )
}

async function getCourseByID(context: EditorialAuthContext, courseID: number) {
  return findByIDSafe(() =>
    context.payload.findByID({
      collection: 'courses',
      id: courseID,
      depth: 0,
      locale: context.locale,
      overrideAccess: false,
      user: context.user ?? undefined,
    }),
  )
}

async function getChapterByID(context: EditorialAuthContext, chapterID: number) {
  return findByIDSafe(() =>
    context.payload.findByID({
      collection: 'course-chapters',
      id: chapterID,
      depth: 0,
      locale: context.locale,
      overrideAccess: false,
      user: context.user ?? undefined,
    }),
  )
}

async function getPageByID(context: EditorialAuthContext, pageID: number) {
  return findByIDSafe(() =>
    context.payload.findByID({
      collection: 'course-pages',
      id: pageID,
      depth: 0,
      locale: context.locale,
      overrideAccess: false,
      user: context.user ?? undefined,
    }),
  )
}

export async function loadEditorialHome(localeInput?: string) {
  const context = await getEditorialAuthContext(localeInput)
  const projects = await findDocsSafe<EditorialProjectSummary>(() =>
    context.payload.find({
      collection: 'projects',
      depth: 0,
      limit: 100,
      locale: context.locale,
      overrideAccess: false,
      sort: 'title',
      user: context.user ?? undefined,
    }),
  )

  return {
    context,
    projects,
  }
}

export async function loadProjectOverview(projectID: number, localeInput?: string) {
  const context = await getEditorialAuthContext(localeInput)
  const project = await getProjectByID(context, projectID)
  if (!project) return null

  const groups = await findDocsSafe<ProjectGroup>(() =>
    context.payload.find({
      collection: 'project-groups',
      depth: 0,
      limit: 100,
      locale: context.locale,
      overrideAccess: false,
      sort: 'title',
      user: context.user ?? undefined,
      where: {
        project: {
          equals: projectID,
        },
      },
    }),
  )

  const summaries: EditorialProjectGroupSummary[] = groups.map((group) => ({
    id: group.id,
    productCount: Array.isArray(group.products) ? group.products.length : 0,
    title: group.title,
  }))

  return {
    context,
    groups: summaries,
    project,
  }
}

export async function loadProjectGroupOverview(
  projectID: number,
  groupID: number,
  localeInput?: string,
) {
  const context = await getEditorialAuthContext(localeInput)
  const [project, group] = await Promise.all([
    getProjectByID(context, projectID),
    getProjectGroupByID(context, groupID),
  ])

  if (!project || !group || relationshipID(group.project) !== projectID) {
    return null
  }

  const productIDs = relationIDs(group.products)
  const products =
    productIDs.length === 0
      ? []
      : await findDocsSafe<Product>(() =>
          context.payload.find({
            collection: 'products',
            depth: 0,
            limit: productIDs.length,
            locale: context.locale,
            overrideAccess: false,
            user: context.user ?? undefined,
            where: {
              id: {
                in: productIDs,
              },
            },
          }),
        )

  const summaries: EditorialProductSummary[] = sortByIDs(products, productIDs).map((product) => ({
    courseCount: Array.isArray(product.courses) ? product.courses.length : 0,
    id: product.id,
    isbn: product.isbn,
    productTypeTitle:
      typeof product.productType === 'object' && product.productType !== null
        ? product.productType.title
        : undefined,
    title: product.title,
  }))

  return {
    context,
    group,
    products: summaries,
    project,
  }
}

export async function loadProductOverview(
  projectID: number,
  groupID: number,
  productID: number,
  localeInput?: string,
) {
  const context = await getEditorialAuthContext(localeInput)
  const [project, group, product] = await Promise.all([
    getProjectByID(context, projectID),
    getProjectGroupByID(context, groupID),
    getProductByID(context, productID),
  ])

  if (!project || !group || !product) return null
  if (relationshipID(group.project) !== projectID || !includesRelation(group.products, productID)) {
    return null
  }

  const courseIDs = relationIDs(product.courses)
  const courses =
    courseIDs.length === 0
      ? []
      : await findDocsSafe<Course>(() =>
          context.payload.find({
            collection: 'courses',
            depth: 0,
            limit: courseIDs.length,
            locale: context.locale,
            overrideAccess: false,
            user: context.user ?? undefined,
            where: {
              and: [
                {
                  id: {
                    in: courseIDs,
                  },
                },
                {
                  project: {
                    equals: projectID,
                  },
                },
              ],
            },
          }),
        )

  return {
    context,
    courses: sortByIDs(courses, courseIDs),
    group,
    product,
    project,
  }
}

export async function loadCourseOverview(
  projectID: number,
  groupID: number,
  productID: number,
  courseID: number,
  localeInput?: string,
) {
  const productOverview = await loadProductOverview(projectID, groupID, productID, localeInput)
  if (!productOverview) return null

  const course = await getCourseByID(productOverview.context, courseID)
  if (!course) return null
  if (
    relationshipID(course.project) !== projectID ||
    !includesRelation(productOverview.product.courses, courseID)
  ) {
    return null
  }

  const chapters = await findDocsSafe<CourseChapter>(() =>
    productOverview.context.payload.find({
      collection: 'course-chapters',
      depth: 0,
      limit: 100,
      locale: productOverview.context.locale,
      overrideAccess: false,
      sort: 'updatedAt',
      user: productOverview.context.user ?? undefined,
      where: {
        course: {
          equals: courseID,
        },
      },
    }),
  )

  return {
    ...productOverview,
    chapters,
    course,
  }
}

export async function loadChapterOverview(
  projectID: number,
  groupID: number,
  productID: number,
  courseID: number,
  chapterID: number,
  localeInput?: string,
) {
  const courseOverview = await loadCourseOverview(
    projectID,
    groupID,
    productID,
    courseID,
    localeInput,
  )
  if (!courseOverview) return null

  const chapter = await getChapterByID(courseOverview.context, chapterID)
  if (!chapter || relationshipID(chapter.course) !== courseID) return null

  const pages = await findDocsSafe<CoursePage>(() =>
    courseOverview.context.payload.find({
      collection: 'course-pages',
      depth: 0,
      limit: 100,
      locale: courseOverview.context.locale,
      overrideAccess: false,
      sort: 'updatedAt',
      user: courseOverview.context.user ?? undefined,
      where: {
        chapter: {
          equals: chapterID,
        },
      },
    }),
  )

  const pageSummaries: EditorialPageSummary[] = pages.map((page) => ({
    contentCount: Array.isArray(page.contentItems) ? page.contentItems.length : 0,
    id: page.id,
    title: page.title,
    updatedAt: page.updatedAt,
  }))

  return {
    ...courseOverview,
    chapter,
    pages: pageSummaries,
  }
}

export async function loadPageOverview(
  projectID: number,
  groupID: number,
  productID: number,
  courseID: number,
  chapterID: number,
  pageID: number,
  localeInput?: string,
) {
  const chapterOverview = await loadChapterOverview(
    projectID,
    groupID,
    productID,
    courseID,
    chapterID,
    localeInput,
  )
  if (!chapterOverview) return null

  const page = await getPageByID(chapterOverview.context, pageID)
  if (!page || relationshipID(page.chapter) !== chapterID) return null

  const contentIDs = Array.isArray(page.contentItems)
    ? page.contentItems
        .map((item) => relationshipID(item.content))
        .filter((item): item is number => item !== null)
    : []

  const contentItems =
    contentIDs.length === 0
      ? []
      : await findDocsSafe<CourseContent>(() =>
          chapterOverview.context.payload.find({
            collection: 'course-content',
            depth: 0,
            limit: contentIDs.length,
            locale: chapterOverview.context.locale,
            overrideAccess: false,
            user: chapterOverview.context.user ?? undefined,
            where: {
              id: {
                in: contentIDs,
              },
            },
          }),
        )

  return {
    ...chapterOverview,
    contentItems: sortByIDs(contentItems, contentIDs),
    page,
  }
}

export async function loadContentOverview(
  projectID: number,
  groupID: number,
  productID: number,
  courseID: number,
  chapterID: number,
  pageID: number,
  contentID: number,
  localeInput?: string,
) {
  const pageOverview = await loadPageOverview(
    projectID,
    groupID,
    productID,
    courseID,
    chapterID,
    pageID,
    localeInput,
  )
  if (!pageOverview) return null

  const content = pageOverview.contentItems.find((item) => item.id === contentID)
  if (!content) return null

  return {
    ...pageOverview,
    content,
  }
}
