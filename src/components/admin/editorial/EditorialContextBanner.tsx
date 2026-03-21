'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

type EntityKey = 'project' | 'group' | 'product' | 'course' | 'chapter' | 'page'

type ContextIDs = Record<EntityKey, number | null>

type DocumentConfig = {
  collection: string
  fallbackLabel: string
  singular: string
}

const orderedEntityKeys: EntityKey[] = ['project', 'group', 'product', 'course', 'chapter', 'page']

const entityConfig: Record<EntityKey, DocumentConfig> = {
  project: { collection: 'projects', fallbackLabel: 'Project', singular: 'project' },
  group: {
    collection: 'project-groups',
    fallbackLabel: 'Project group',
    singular: 'project group',
  },
  product: { collection: 'products', fallbackLabel: 'Product', singular: 'product' },
  course: { collection: 'courses', fallbackLabel: 'Course', singular: 'course' },
  chapter: { collection: 'course-chapters', fallbackLabel: 'Chapter', singular: 'chapter' },
  page: { collection: 'course-pages', fallbackLabel: 'Page', singular: 'page' },
}

const collectionEntityMap: Record<string, EntityKey | 'content'> = {
  'course-chapters': 'chapter',
  'course-content': 'content',
  'course-pages': 'page',
  courses: 'course',
  products: 'product',
  projects: 'project',
  'project-groups': 'group',
}

const collectionConfig: Record<string, DocumentConfig> = {
  'course-chapters': entityConfig.chapter,
  'course-content': {
    collection: 'course-content',
    fallbackLabel: 'Content item',
    singular: 'content item',
  },
  'course-pages': entityConfig.page,
  courses: entityConfig.course,
  products: entityConfig.product,
  projects: entityConfig.project,
  'project-groups': entityConfig.group,
}

function parseID(value: string | null) {
  if (!value) return null

  const parsed = Number(value)
  return Number.isInteger(parsed) ? parsed : null
}

function projectHref(projectID: number) {
  return `/admin/editorial/projects/${projectID}`
}

function projectGroupHref(projectID: number, groupID: number) {
  return `${projectHref(projectID)}/groups/${groupID}`
}

function productHref(projectID: number, groupID: number, productID: number) {
  return `${projectGroupHref(projectID, groupID)}/products/${productID}`
}

function courseHref(projectID: number, groupID: number, productID: number, courseID: number) {
  return `${productHref(projectID, groupID, productID)}/courses/${courseID}`
}

function chapterHref(
  projectID: number,
  groupID: number,
  productID: number,
  courseID: number,
  chapterID: number,
) {
  return `${courseHref(projectID, groupID, productID, courseID)}/chapters/${chapterID}`
}

function pageHref(
  projectID: number,
  groupID: number,
  productID: number,
  courseID: number,
  chapterID: number,
  pageID: number,
) {
  return `${chapterHref(projectID, groupID, productID, courseID, chapterID)}/pages/${pageID}`
}

function entityHref(entity: EntityKey, ids: ContextIDs) {
  if (entity === 'project' && ids.project !== null) {
    return projectHref(ids.project)
  }

  if (entity === 'group' && ids.project !== null && ids.group !== null) {
    return projectGroupHref(ids.project, ids.group)
  }

  if (entity === 'product' && ids.project !== null && ids.group !== null && ids.product !== null) {
    return productHref(ids.project, ids.group, ids.product)
  }

  if (
    entity === 'course' &&
    ids.project !== null &&
    ids.group !== null &&
    ids.product !== null &&
    ids.course !== null
  ) {
    return courseHref(ids.project, ids.group, ids.product, ids.course)
  }

  if (
    entity === 'chapter' &&
    ids.project !== null &&
    ids.group !== null &&
    ids.product !== null &&
    ids.course !== null &&
    ids.chapter !== null
  ) {
    return chapterHref(ids.project, ids.group, ids.product, ids.course, ids.chapter)
  }

  if (
    entity === 'page' &&
    ids.project !== null &&
    ids.group !== null &&
    ids.product !== null &&
    ids.course !== null &&
    ids.chapter !== null &&
    ids.page !== null
  ) {
    return pageHref(ids.project, ids.group, ids.product, ids.course, ids.chapter, ids.page)
  }

  return undefined
}

function extractTextValue(value: unknown): string | undefined {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : undefined
  }

  if (value && typeof value === 'object') {
    for (const candidate of Object.values(value as Record<string, unknown>)) {
      const extracted = extractTextValue(candidate)
      if (extracted) return extracted
    }
  }

  return undefined
}

async function fetchDocumentTitle(collection: string, id: number, locale?: string | null) {
  const query = new URLSearchParams({ depth: '0' })

  if (locale) {
    query.set('locale', locale)
  }

  const response = await fetch(`/api/${collection}/${id}?${query.toString()}`, {
    cache: 'no-store',
    credentials: 'same-origin',
  })

  if (!response.ok) {
    return undefined
  }

  const document = (await response.json()) as Record<string, unknown>

  return (
    extractTextValue(document.title) ??
    extractTextValue(document.name) ??
    extractTextValue(document.email)
  )
}

export default function EditorialContextBanner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [titles, setTitles] = useState<Partial<Record<EntityKey, string>>>({})
  const [currentTitle, setCurrentTitle] = useState<string | undefined>()

  const route = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean)

    if (segments[0] !== 'admin' || segments[1] !== 'collections' || segments.length < 4) {
      return null
    }

    const collection = segments[2]
    const documentSegment = segments[3]

    return {
      collection,
      documentID: documentSegment === 'create' ? null : parseID(documentSegment),
      isCreate: documentSegment === 'create',
    }
  }, [pathname])

  const returnTo = searchParams.get('returnTo')
  const locale = searchParams.get('locale')

  const contextIDs = useMemo<ContextIDs>(
    () => ({
      chapter: parseID(searchParams.get('editorialChapterId')),
      course: parseID(searchParams.get('editorialCourseId')),
      group: parseID(searchParams.get('editorialGroupId')),
      page: parseID(searchParams.get('editorialPageId')),
      product: parseID(searchParams.get('editorialProductId')),
      project: parseID(searchParams.get('editorialProjectId')),
    }),
    [searchParams],
  )

  useEffect(() => {
    if (!route || !returnTo || contextIDs.project === null) {
      setTitles({})
      setCurrentTitle(undefined)
      return
    }

    let cancelled = false

    void (async () => {
      const nextTitles: Partial<Record<EntityKey, string>> = {}

      await Promise.all(
        orderedEntityKeys.map(async (entity) => {
          const id = contextIDs[entity]

          if (id === null) return

          const title = await fetchDocumentTitle(entityConfig[entity].collection, id, locale)
          if (title) nextTitles[entity] = title
        }),
      )

      let nextCurrentTitle: string | undefined

      if (!route.isCreate && route.documentID !== null) {
        const config = collectionConfig[route.collection]
        if (config) {
          nextCurrentTitle = await fetchDocumentTitle(config.collection, route.documentID, locale)
        }
      }

      if (!cancelled) {
        setTitles(nextTitles)
        setCurrentTitle(nextCurrentTitle)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [contextIDs, locale, returnTo, route])

  if (!route || !returnTo || contextIDs.project === null) {
    return null
  }

  const currentEntity = collectionEntityMap[route.collection]
  if (!currentEntity) {
    return null
  }

  const parentKeys = (() => {
    const courseContextStartIndex =
      contextIDs.course !== null ? orderedEntityKeys.indexOf('course') : 0
    const scopedEntityKeys = orderedEntityKeys.slice(courseContextStartIndex)

    if (currentEntity === 'content') {
      return scopedEntityKeys.filter((entity) => contextIDs[entity] !== null)
    }

    const currentIndex = orderedEntityKeys.indexOf(currentEntity)
    const scopedEndIndex =
      currentEntity === 'course' && contextIDs.course !== null ? currentIndex + 1 : currentIndex

    return orderedEntityKeys
      .slice(courseContextStartIndex, scopedEndIndex)
      .filter((entity) => contextIDs[entity] !== null)
  })()

  const breadcrumbs = parentKeys
    .map((entity) => {
      const id = contextIDs[entity]
      const href = entityHref(entity, contextIDs)

      if (id === null || !href) return null

      return {
        href,
        label: titles[entity] ?? `${entityConfig[entity].fallbackLabel} ${id}`,
      }
    })
    .filter((crumb): crumb is { href: string; label: string } => crumb !== null)

  const currentLabel = route.isCreate
    ? `New ${collectionConfig[route.collection]?.singular ?? 'item'}`
    : (currentTitle ??
      (currentEntity !== 'content' && currentEntity ? titles[currentEntity] : undefined) ??
      `Edit ${collectionConfig[route.collection]?.singular ?? 'item'}`)

  return (
    <div className="mb-5 px-6 max-[1440px]:px-(--gutter-h)">
      <div className="flex flex-wrap justify-between gap-[0.85rem] rounded-[18px] border border-[color-mix(in_srgb,var(--theme-elevation-250)_80%,var(--theme-success-500)_20%)] px-5 py-4 [background:linear-gradient(135deg,color-mix(in_srgb,var(--theme-elevation-50)_90%,var(--theme-success-500)_10%),color-mix(in_srgb,var(--theme-elevation-0)_92%,var(--theme-warning-500)_8%))] max-[1440px]:rounded-[14px] max-[1440px]:px-4 max-[1440px]:py-[0.9rem]">
        <nav
          aria-label="Editorial context"
          className="flex flex-wrap items-center gap-[0.35rem] text-(--theme-text) leading-[1.4]"
        >
          <Link
            className="font-bold text-(--theme-text) no-underline transition hover:text-(--theme-text) hover:opacity-[0.82] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--theme-success-500)_28%,transparent)]"
            href="/admin/editorial"
          >
            Home
          </Link>

          {breadcrumbs.map((crumb) => (
            <span className="inline-flex items-center gap-[0.35rem]" key={crumb.href}>
              <span className="text-(--theme-text-dim)">/</span>
              <Link
                className="text-(--theme-text) no-underline transition hover:text-(--theme-text) hover:opacity-[0.82] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--theme-success-500)_28%,transparent)]"
                href={crumb.href}
              >
                {crumb.label}
              </Link>
            </span>
          ))}

          <span className="inline-flex items-center gap-[0.35rem] font-semibold text-(--theme-text)">
            <span className="text-(--theme-text-dim)">/</span>
            <span>{currentLabel}</span>
          </span>
        </nav>

        <div className="flex flex-col items-start gap-[0.3rem]">
          <span className="text-[0.92rem] text-(--theme-text-dim)">
            This form stays anchored to the editorial tree.
          </span>
          <Link
            className="font-semibold text-(--theme-text) no-underline transition hover:text-(--theme-text) hover:opacity-[0.82] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--theme-success-500)_28%,transparent)]"
            href={returnTo}
          >
            Return to editorial page
          </Link>
        </div>
      </div>
    </div>
  )
}
