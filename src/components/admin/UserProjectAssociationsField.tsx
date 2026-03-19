'use client'

import React from 'react'
import { useDocumentInfo, useLocale, usePayloadAPI } from '@payloadcms/ui'
import type { JoinFieldClientComponent } from 'payload'

const PAGE_SIZE = 10

const COPY = {
  en: {
    active: 'Active',
    archived: 'Archived',
    draft: 'Draft',
    empty: 'No projects in this association.',
    error: 'Unable to load associated projects.',
    loading: 'Loading...',
    next: 'Next',
    of: 'of',
    page: 'Page',
    previous: 'Previous',
    published: 'Published',
    total: 'projects',
  },
  da: {
    active: 'Aktiv',
    archived: 'Arkiveret',
    draft: 'Kladde',
    empty: 'Ingen projekter i denne tilknytning.',
    error: 'Kunne ikke indlaese tilknyttede projekter.',
    loading: 'Indlaeser...',
    next: 'Naeste',
    of: 'af',
    page: 'Side',
    previous: 'Forrige',
    published: 'Publiceret',
    total: 'projekter',
  },
  de: {
    active: 'Aktiv',
    archived: 'Archiviert',
    draft: 'Entwurf',
    empty: 'Keine Projekte in dieser Zuordnung.',
    error: 'Zugeordnete Projekte konnten nicht geladen werden.',
    loading: 'Laedt...',
    next: 'Weiter',
    of: 'von',
    page: 'Seite',
    previous: 'Zurueck',
    published: 'Veroeffentlicht',
    total: 'Projekte',
  },
  fr: {
    active: 'Actif',
    archived: 'Archive',
    draft: 'Brouillon',
    empty: 'Aucun projet dans cette association.',
    error: 'Impossible de charger les projets associes.',
    loading: 'Chargement...',
    next: 'Suivant',
    of: 'sur',
    page: 'Page',
    previous: 'Precedent',
    published: 'Publie',
    total: 'projets',
  },
} as const

type ProjectDocument = {
  _status?: null | string
  id: number | string
  lifecycle?: null | string
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
  select: {
    _status: true,
    lifecycle: true,
    title: true,
  },
  sort: 'title',
  where: {
    [roleField]: {
      in: [userID],
    },
  },
})

const formatProjectMeta = (project: ProjectDocument, copy: (typeof COPY)[keyof typeof COPY]) => {
  const parts: string[] = []

  if (project._status === 'published') {
    parts.push(copy.published)
  } else if (project._status === 'draft') {
    parts.push(copy.draft)
  }

  if (project.lifecycle === 'active') {
    parts.push(copy.active)
  } else if (project.lifecycle === 'archived') {
    parts.push(copy.archived)
  } else if (typeof project.lifecycle === 'string' && project.lifecycle.length > 0) {
    parts.push(project.lifecycle)
  }

  return parts.join(' | ')
}

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
        marginBottom: '16px',
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

      {isLoading ? <div>{copy.loading}</div> : null}
      {!isLoading && isError ? <div>{copy.error}</div> : null}
      {!isLoading && !isError && docs.length === 0 ? <div>{copy.empty}</div> : null}

      {!isLoading && !isError && docs.length > 0 ? (
        <>
          <ul
            style={{
              display: 'grid',
              gap: '12px',
              listStyle: 'disc',
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
                    display: 'inline-block',
                    textDecoration: 'none',
                  }}
                >
                  {project.title || String(project.id)}
                </a>

                {formatProjectMeta(project, copy) ? (
                  <div
                    style={{
                      color: 'var(--theme-text)',
                      fontSize: '12px',
                      marginTop: '2px',
                      opacity: 0.65,
                    }}
                  >
                    {formatProjectMeta(project, copy)}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>

          {totalPages > 1 ? (
            <div
              style={{
                alignItems: 'center',
                display: 'flex',
                gap: '12px',
                marginTop: '16px',
                opacity: 0.85,
              }}
            >
              {currentPage > 1 ? (
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--theme-text)',
                    cursor: 'pointer',
                    padding: 0,
                    textDecoration: 'underline',
                    textUnderlineOffset: '2px',
                  }}
                >
                  {copy.previous}
                </button>
              ) : (
                <span style={{ color: 'var(--theme-elevation-400)' }}>{copy.previous}</span>
              )}

              <span>
                {copy.page} {currentPage} {copy.of} {totalPages}
              </span>

              {currentPage < totalPages ? (
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--theme-text)',
                    cursor: 'pointer',
                    padding: 0,
                    textDecoration: 'underline',
                    textUnderlineOffset: '2px',
                  }}
                >
                  {copy.next}
                </button>
              ) : (
                <span style={{ color: 'var(--theme-elevation-400)' }}>{copy.next}</span>
              )}
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  )
}

export default UserProjectAssociationsField
