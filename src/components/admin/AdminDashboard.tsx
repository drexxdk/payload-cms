import type { AdminViewServerProps, Where } from 'payload'

type Metric = {
  href: string
  label: string
  total: number
}

type HealthItem = {
  description: string
  href: string
  label: string
  total: number
}

async function countDocuments(
  props: AdminViewServerProps,
  collection:
    | 'courses'
    | 'media'
    | 'product-types'
    | 'products'
    | 'project-groups'
    | 'project-types'
    | 'projects'
    | 'users',
  where?: Where,
) {
  const result = await props.initPageResult.req.payload.count({
    collection,
    overrideAccess: false,
    req: props.initPageResult.req,
    where,
  })

  return result.totalDocs
}

function dashboardLink(path: string) {
  return `/admin${path}`
}

function MetricCard({ href, label, total }: Metric) {
  return (
    <a
      className="rounded-3xl border border-(--theme-elevation-150) bg-(--theme-elevation-0) p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-(--theme-success-500) hover:bg-(--theme-elevation-50) hover:shadow-md"
      href={href}
    >
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-(--theme-text) opacity-65">
        {label}
      </div>
      <div className="mt-3 text-3xl font-semibold text-(--theme-text)">{total}</div>
    </a>
  )
}

function HealthCard({ description, href, label, total }: HealthItem) {
  return (
    <a
      className="rounded-3xl border border-(--theme-elevation-150) bg-(--theme-elevation-50) p-5 transition hover:border-(--theme-warning-500) hover:bg-(--theme-elevation-100)"
      href={href}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-(--theme-text)">{label}</div>
          <p className="mt-2 text-sm leading-6 text-(--theme-text) opacity-72">{description}</p>
        </div>
        <div className="rounded-full border border-(--theme-elevation-200) bg-(--theme-elevation-0) px-3 py-1 text-sm font-semibold text-(--theme-text) shadow-sm">
          {total}
        </div>
      </div>
    </a>
  )
}

function RelationLine({ detail, title }: { detail: string; title: string }) {
  return (
    <div className="rounded-2xl border border-(--theme-elevation-150) bg-(--theme-elevation-0) p-4">
      <div className="text-sm font-semibold text-(--theme-text)">{title}</div>
      <p className="mt-1 text-sm leading-6 text-(--theme-text) opacity-72">{detail}</p>
    </div>
  )
}

export default async function AdminDashboard(props: AdminViewServerProps) {
  const [
    projects,
    projectGroups,
    courses,
    products,
    users,
    media,
    projectsWithoutGroups,
    projectsWithoutCourses,
    emptyProjectGroups,
    productsWithoutCourses,
    productsWithoutGroups,
    usersWithoutMemberships,
  ] = await Promise.all([
    countDocuments(props, 'projects'),
    countDocuments(props, 'project-groups'),
    countDocuments(props, 'courses'),
    countDocuments(props, 'products'),
    countDocuments(props, 'users'),
    countDocuments(props, 'media'),
    countDocuments(props, 'projects', { groups: { exists: false } }),
    countDocuments(props, 'projects', { courses: { exists: false } }),
    countDocuments(props, 'project-groups', { products: { exists: false } }),
    countDocuments(props, 'products', { courses: { exists: false } }),
    countDocuments(props, 'products', { projectGroups: { exists: false } }),
    countDocuments(props, 'users', {
      and: [
        { viewableProjects: { exists: false } },
        { editableProjects: { exists: false } },
        { managedProjects: { exists: false } },
      ],
    }),
  ])

  const metrics: Metric[] = [
    { label: 'Projects', total: projects, href: dashboardLink('/collections/projects') },
    {
      label: 'Project Groups',
      total: projectGroups,
      href: dashboardLink('/collections/project-groups'),
    },
    { label: 'Courses', total: courses, href: dashboardLink('/collections/courses') },
    { label: 'Products', total: products, href: dashboardLink('/collections/products') },
    { label: 'Users', total: users, href: dashboardLink('/collections/users') },
    { label: 'Media', total: media, href: dashboardLink('/collections/media') },
  ]

  const healthItems: HealthItem[] = [
    {
      label: 'Projects without groups',
      total: projectsWithoutGroups,
      description: 'Projects that do not yet contain any project groups.',
      href: dashboardLink('/collections/projects'),
    },
    {
      label: 'Projects without courses',
      total: projectsWithoutCourses,
      description: 'Projects that do not yet contain any courses.',
      href: dashboardLink('/collections/projects'),
    },
    {
      label: 'Empty project groups',
      total: emptyProjectGroups,
      description: 'Project groups that do not yet contain any products.',
      href: dashboardLink('/collections/project-groups'),
    },
    {
      label: 'Products without courses',
      total: productsWithoutCourses,
      description: 'Products that are not linked into any course yet.',
      href: dashboardLink('/collections/products'),
    },
    {
      label: 'Products without groups',
      total: productsWithoutGroups,
      description: 'Products that are not included in any project group yet.',
      href: dashboardLink('/collections/products'),
    },
    {
      label: 'Users without project memberships',
      total: usersWithoutMemberships,
      description:
        'Authenticated users who are not assigned as viewer, editor, or manager anywhere.',
      href: dashboardLink('/collections/users'),
    },
  ]

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
            Admin overview
          </div>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-(--theme-text)">
            See the whole content model at a glance.
          </h1>
          <p className="mt-4 text-base leading-7 text-(--theme-text) opacity-78">
            This dashboard focuses on structure first: what content exists, how the main collections
            relate, and where data is still missing.
          </p>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-(--theme-text)">Core metrics</h2>
            <p className="mt-1 text-sm text-(--theme-text) opacity-72">
              Fast totals for the collections that matter most in day-to-day admin work.
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr,1fr]">
        <div className="rounded-4xl border border-(--theme-elevation-150) bg-(--theme-elevation-0) p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-(--theme-text)">Relation map</h2>
            <p className="mt-1 text-sm text-(--theme-text) opacity-72">
              A compact view of how the main collections fit together.
            </p>
          </div>
          <div className="grid gap-4">
            <RelationLine
              title="Project Types -> Projects -> Project Groups -> Products"
              detail="Project types classify top-level projects. Projects contain groups. Groups bundle related products."
            />
            <RelationLine
              title="Projects -> Courses -> Products"
              detail="Courses belong to projects and link products into deliverable learning structures."
            />
            <RelationLine
              title="Users -> View/Edit/Manage -> Projects"
              detail="Access is global at the user level but real working permissions are attached through project memberships."
            />
            <RelationLine
              title="Media -> Shared assets for current and future content types"
              detail="Media is positioned as a growing asset hub for images, video, GeoGebra, ThingLink, downloads, and future interactive media."
            />
          </div>
        </div>

        <div className="rounded-4xl border border-(--theme-elevation-150) bg-(--theme-elevation-50) p-6 text-(--theme-text) shadow-sm">
          <h2 className="text-xl font-semibold text-(--theme-text)">Quick actions</h2>
          <p className="mt-1 text-sm leading-6 text-(--theme-text) opacity-72">
            Start with the core content and administration entry points.
          </p>
          <div className="mt-5 grid gap-3">
            <a
              className="rounded-2xl border border-(--theme-elevation-150) bg-(--theme-elevation-0) px-4 py-3 text-sm font-medium text-(--theme-text) transition hover:border-(--theme-success-500) hover:bg-(--theme-elevation-100)"
              href={dashboardLink('/collections/projects/create')}
            >
              Create project
            </a>
            <a
              className="rounded-2xl border border-(--theme-elevation-150) bg-(--theme-elevation-0) px-4 py-3 text-sm font-medium text-(--theme-text) transition hover:border-(--theme-success-500) hover:bg-(--theme-elevation-100)"
              href={dashboardLink('/collections/project-groups/create')}
            >
              Create project group
            </a>
            <a
              className="rounded-2xl border border-(--theme-elevation-150) bg-(--theme-elevation-0) px-4 py-3 text-sm font-medium text-(--theme-text) transition hover:border-(--theme-success-500) hover:bg-(--theme-elevation-100)"
              href={dashboardLink('/collections/courses/create')}
            >
              Create course
            </a>
            <a
              className="rounded-2xl border border-(--theme-elevation-150) bg-(--theme-elevation-0) px-4 py-3 text-sm font-medium text-(--theme-text) transition hover:border-(--theme-success-500) hover:bg-(--theme-elevation-100)"
              href={dashboardLink('/collections/products/create')}
            >
              Create product
            </a>
            <a
              className="rounded-2xl border border-(--theme-elevation-150) bg-(--theme-elevation-0) px-4 py-3 text-sm font-medium text-(--theme-text) transition hover:border-(--theme-success-500) hover:bg-(--theme-elevation-100)"
              href={dashboardLink('/collections/media')}
            >
              Browse media library
            </a>
            <a
              className="rounded-2xl border border-(--theme-elevation-150) bg-(--theme-elevation-0) px-4 py-3 text-sm font-medium text-(--theme-text) transition hover:border-(--theme-success-500) hover:bg-(--theme-elevation-100)"
              href={dashboardLink('/collections/users')}
            >
              Review users and memberships
            </a>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-(--theme-text)">Relation health</h2>
          <p className="mt-1 text-sm text-(--theme-text) opacity-72">
            These counts highlight missing links and incomplete structures that deserve attention.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {healthItems.map((item) => (
            <HealthCard key={item.label} {...item} />
          ))}
        </div>
      </section>
    </div>
  )
}
