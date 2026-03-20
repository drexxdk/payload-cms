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

  const parentKeys =
    currentEntity === 'content'
      ? orderedEntityKeys.filter((entity) => contextIDs[entity] !== null)
      : orderedEntityKeys.slice(0, orderedEntityKeys.indexOf(currentEntity))

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
    <div className="editorial-context-banner">
      <div className="editorial-context-banner__inner">
        <nav aria-label="Editorial context" className="editorial-context-banner__breadcrumbs">
          <Link
            className="editorial-context-banner__link editorial-context-banner__link--root"
            href="/admin/editorial"
          >
            Home
          </Link>

          {breadcrumbs.map((crumb) => (
            <span className="editorial-context-banner__crumb" key={crumb.href}>
              <span className="editorial-context-banner__separator">/</span>
              <Link className="editorial-context-banner__link" href={crumb.href}>
                {crumb.label}
              </Link>
            </span>
          ))}

          <span className="editorial-context-banner__crumb editorial-context-banner__crumb--current">
            <span className="editorial-context-banner__separator">/</span>
            <span>{currentLabel}</span>
          </span>
        </nav>

        <div className="editorial-context-banner__meta">
          <span className="editorial-context-banner__note">
            This form stays anchored to the editorial tree.
          </span>
          <Link className="editorial-context-banner__return" href={returnTo}>
            Return to editorial page
          </Link>
        </div>
      </div>
    </div>
  )
}
