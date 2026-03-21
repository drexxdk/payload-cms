'use client'

import { RelationshipField, useField } from '@payloadcms/ui'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import type { RelationshipFieldClientComponent } from 'payload'

const fieldContextMap = {
  chapter: {
    label: 'chapter',
    queryKey: 'editorialChapterId',
  },
  course: {
    label: 'course',
    queryKey: 'editorialCourseId',
  },
  project: {
    label: 'project',
    queryKey: 'editorialProjectId',
  },
} as const

function parseRelationshipID(value: unknown): number | null {
  if (typeof value === 'number' && Number.isInteger(value)) {
    return value
  }

  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isInteger(parsed) ? parsed : null
  }

  if (value && typeof value === 'object') {
    const relationship = value as { id?: unknown; value?: unknown }

    return parseRelationshipID(relationship.id ?? relationship.value)
  }

  return null
}

function resolveLabel(value: unknown, fallback: string) {
  if (typeof value === 'string') {
    return value
  }

  if (value && typeof value === 'object') {
    const localized = Object.values(value as Record<string, unknown>).find(
      (candidate) => typeof candidate === 'string',
    )

    if (typeof localized === 'string') {
      return localized
    }
  }

  return fallback
}

const ContextLockedRelationshipField: RelationshipFieldClientComponent = (props) => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { path, setValue, value } = useField<unknown>({ potentiallyStalePath: props.path })

  const context = fieldContextMap[props.field.name as keyof typeof fieldContextMap]
  const contextValue = context ? searchParams.get(context.queryKey) : null
  const contextualID = contextValue ? Number(contextValue) : Number.NaN
  const currentID = parseRelationshipID(value)
  const isCreateRoute = pathname.endsWith('/create')

  useEffect(() => {
    if (!context || !Number.isInteger(contextualID)) {
      return
    }

    if (currentID === contextualID) {
      return
    }

    if (isCreateRoute || currentID === null) {
      setValue(contextualID, true)
    }
  }, [context, contextualID, currentID, isCreateRoute, setValue])

  if (!context || !Number.isInteger(contextualID)) {
    return <RelationshipField {...props} />
  }

  if (!isCreateRoute && currentID !== contextualID) {
    return <RelationshipField {...props} />
  }

  return (
    <div className="mb-4 grid gap-1.5 rounded-[14px] border border-[rgba(86,96,78,0.18)] px-4 py-[0.9rem] [background:rgba(236,226,198,0.24)]">
      <div className="text-[0.85rem] font-bold uppercase tracking-[0.02em] text-(--theme-text)">
        {resolveLabel(props.field.label, props.field.name)}
      </div>
      <div className="font-semibold text-(--theme-text)">
        This {context.label} is locked by the editorial path.
      </div>
      <p className="m-0 text-(--theme-text-dim)">
        Open this document from a different place in the editorial tree if you need to change its
        parent.
      </p>
      <input name={path} type="hidden" value={Number.isInteger(contextualID) ? contextualID : ''} />
    </div>
  )
}

export default ContextLockedRelationshipField
