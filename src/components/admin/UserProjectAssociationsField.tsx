'use client'

import React from 'react'
import { useDocumentInfo, useLocale, usePayloadAPI } from '@payloadcms/ui'
import type { JoinFieldClientComponent } from 'payload'

const PAGE_SIZE = 10

const COPY = {
  en: {
    empty: 'No projects in this association.',
    error: 'Unable to load associated projects.',
    next: 'Next',
    page: 'Page',
    previous: 'Previous',
    total: 'projects',
  },
  da: {
    empty: 'Ingen projekter i denne tilknytning.',
    error: 'Kunne ikke indlaese tilknyttede projekter.',
    next: 'Naeste',
    page: 'Side',
    previous: 'Forrige',
    total: 'projekter',
  },
  de: {
    empty: 'Keine Projekte in dieser Zuordnung.',
    error: 'Zugeordnete Projekte konnten nicht geladen werden.',
    next: 'Weiter',
    page: 'Seite',
    previous: 'Zurueck',
    total: 'Projekte',
  },
  fr: {
    empty: 'Aucun projet dans cette association.',
    error: 'Impossible de charger les projets associes.',
    next: 'Suivant',
    page: 'Page',
    previous: 'Precedent',
    total: 'projets',
  },
} as const

type ProjectDocument = {
  id: number | string
  title?: null | string
}

type ProjectsResponse = {
  docs?: ProjectDocument[]
  page?: number
  totalDocs?: number
  totalPages?: number
}

const getFieldLabel = (label: unknown, localeCode?: string) => {
  if (typeof label === 'string') return label

  if (label && typeof label === 'object') {
    const record = label as Record<string, unknown>
    const localized = localeCode ? record[localeCode] : undefined

    if (typeof localized === 'string') return localized
    if (typeof record.en === 'string') return record.en
  }

  return 'Projects'
}

const buildParams = (roleField: string, userID: number | string, page: number) => ({
  depth: 0,
  limit: PAGE_SIZE,
  page,
  sort: 'title',
  where: {
    [roleField]: {
      in: [userID],
    },
  },
})

const UserProjectAssociationsField: JoinFieldClientComponent = ({ field }) => {
  const { id } = useDocumentInfo()
  const locale = useLocale()
  const roleField = typeof field.on === 'string' ? field.on : ''
  const [page, setPage] = React.useState(1)
  const copy = COPY[locale?.code as keyof typeof COPY] ?? COPY.en
  const title = getFieldLabel(field.label, locale?.code)

  const [{ data, isError, isLoading }, { setParams }] = usePayloadAPI('/api/projects', {
    initialParams: id && roleField ? buildParams(roleField, id, 1) : {},
  })

  React.useEffect(() => {
    setPage(1)
  }, [id, roleField])

  React.useEffect(() => {
    if (!id || !roleField) return

    setParams(buildParams(roleField, id, page))
  }, [id, page, roleField, setParams])

  const projectData = (data ?? {}) as ProjectsResponse
  const docs = Array.isArray(projectData.docs) ? projectData.docs : []
  const totalDocs = typeof projectData.totalDocs === 'number' ? projectData.totalDocs : docs.length
  const totalPages = typeof projectData.totalPages === 'number' ? projectData.totalPages : 1
  const currentPage = typeof projectData.page === 'number' ? projectData.page : page

  if (!id || !roleField) return null

  return (
    <div
      style={{
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: '12px',
        padding: '16px',
        background: 'var(--theme-elevation-0)',
      }}
    >
      <div
        style={{
          fontSize: '18px',
          fontWeight: 600,
          marginBottom: '8px',
        }}
      >
        {title}
      </div>

      <div
        style={{
          marginBottom: '12px',
          fontSize: '12px',
          letterSpacing: '0.08em',
          opacity: 0.7,
          textTransform: 'uppercase',
        }}
      >
        {totalDocs} {copy.total}
      </div>

      {isLoading ? <div>Loading...</div> : null}
      {!isLoading && isError ? <div>{copy.error}</div> : null}
      {!isLoading && !isError && docs.length === 0 ? <div>{copy.empty}</div> : null}

      {!isLoading && !isError && docs.length > 0 ? (
        <>
          <ol
            style={{
              display: 'grid',
              gap: '8px',
              listStyle: 'decimal',
              margin: 0,
              paddingLeft: '20px',
            }}
          >
            {docs.map((project) => (
              <li key={project.id}>
                <a
                  href={`/admin/collections/projects/${project.id}`}
                  style={{
                    color: 'var(--theme-text)',
                    textDecoration: 'none',
                  }}
                >
                  {project.title || String(project.id)}
                </a>
              </li>
            ))}
          </ol>

          {totalPages > 1 ? (
            <div
              style={{
                alignItems: 'center',
                display: 'flex',
                gap: '12px',
                marginTop: '16px',
              }}
            >
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={currentPage <= 1}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: currentPage <= 1 ? 'var(--theme-elevation-400)' : 'var(--theme-text)',
                  cursor: currentPage <= 1 ? 'default' : 'pointer',
                  padding: 0,
                }}
              >
                {copy.previous}
              </button>

              <span>
                {copy.page} {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={currentPage >= totalPages}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color:
                    currentPage >= totalPages ? 'var(--theme-elevation-400)' : 'var(--theme-text)',
                  cursor: currentPage >= totalPages ? 'default' : 'pointer',
                  padding: 0,
                }}
              >
                {copy.next}
              </button>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  )
}

export default UserProjectAssociationsField
