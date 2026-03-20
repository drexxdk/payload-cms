import Link from 'next/link'

import {
  EditorialList,
  EditorialPage,
  EditorialSection,
} from '@/components/admin/editorial/EditorialChrome'
import { editorialHref, formatStatus, loadEditorialHome, projectHref } from '@/lib/editorial'

type Args = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function EditorialHomePage({ searchParams }: Args) {
  const resolvedSearchParams = await searchParams
  const locale =
    typeof resolvedSearchParams.locale === 'string' ? resolvedSearchParams.locale : undefined
  const { projects } = await loadEditorialHome(locale)

  return (
    <EditorialPage
      breadcrumbs={[{ href: editorialHref(), label: 'Home', root: true }]}
      description="Navigate delivery work through the editorial tree. Start at a project, then move down through groups, products, courses, chapters, and pages."
      title="Home"
    >
      <EditorialSection
        description="Open a project to continue through the delivery structure without falling back to flat collection lists."
        title="Projects"
      >
        <EditorialList
          emptyMessage="No accessible projects are available yet."
          items={projects.map((project) => ({
            href: projectHref(project.id),
            meta: formatStatus(project._status, project.lifecycle),
            title: project.title,
          }))}
        />
      </EditorialSection>

      <section className="rounded-4xl border border-(--theme-elevation-150) bg-(--theme-elevation-50) p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Maintenance routes are separate</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 opacity-72">
          The editorial tree is the primary navigation surface. Raw collection routes still exist
          for maintenance and exception handling, but they are not used as Home for content work.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            className="rounded-full border border-(--theme-elevation-150) px-4 py-2 text-sm font-medium transition hover:border-(--theme-success-500) hover:bg-(--theme-elevation-0)"
            href="/admin"
          >
            Open admin dashboard
          </Link>
        </div>
      </section>
    </EditorialPage>
  )
}
