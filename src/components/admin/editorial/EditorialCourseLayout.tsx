import type { ReactNode } from 'react'

export function EditorialCourseLayout({
  content,
  panel,
}: {
  content: ReactNode
  panel: ReactNode
}) {
  return (
    <div className="mx-auto flex w-full max-w-360 flex-col gap-4 px-4 py-6 text-(--theme-text) sm:px-6">
      <div className="flex min-w-0 flex-col gap-6 min-[1441px]:flex-row min-[1441px]:items-start min-[1441px]:gap-8">
        <aside className="hidden min-[1441px]:sticky min-[1441px]:top-6 min-[1441px]:block min-[1441px]:w-88 min-[1441px]:flex-none">
          {panel}
        </aside>

        <div className="min-w-0 flex-1">{content}</div>
      </div>
    </div>
  )
}
