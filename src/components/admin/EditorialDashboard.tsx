import { EditorialList, EditorialSection } from '@/components/admin/editorial/EditorialChrome'
import { dashboardHref, formatStatus, loadEditorialHome, projectHref } from '@/lib/editorial'

export default async function EditorialDashboard({
  canAccessAdministration,
  locale,
}: {
  canAccessAdministration: boolean
  locale?: string
}) {
  const { projects } = await loadEditorialHome(locale)

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-6 text-(--theme-text)">
      <section
        className="overflow-hidden rounded-4xl border border-(--theme-elevation-150) p-8 shadow-sm"
        style={{
          background:
            'linear-gradient(135deg, var(--theme-elevation-0) 0%, color-mix(in srgb, var(--theme-success-500) 10%, var(--theme-elevation-50)) 55%, color-mix(in srgb, var(--theme-warning-500) 8%, var(--theme-elevation-100)) 100%)',
        }}
      >
        <div className="max-w-3xl">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-(--theme-success-500)">
            Editorial flow
          </div>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-(--theme-text)">Home</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-(--theme-text) opacity-78">
            Navigate delivery work through the editorial tree. Start at a project, then move down
            through groups, products, courses, chapters, and pages.
          </p>
        </div>
      </section>

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
        <h2 className="text-xl font-semibold">Maintenance stays nearby</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 opacity-72">
          The editorial tree is the default dashboard surface. Raw collection routes still exist for
          maintenance and exception handling, and super-admins can switch to the Administration tab
          without leaving this page.
        </p>
        {!canAccessAdministration ? (
          <p className="mt-3 text-sm leading-6 opacity-72">
            Maintenance routes remain available from the standard admin navigation when your role
            allows access.
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            className="rounded-full border border-(--theme-elevation-150) px-4 py-2 text-sm font-medium transition hover:border-(--theme-success-500) hover:bg-(--theme-elevation-0)"
            href={dashboardHref()}
          >
            Stay on dashboard home
          </a>
        </div>
      </section>
    </div>
  )
}
