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

type QuickAction = {
  description: string
  href: string
  label: string
}

type DashboardCollection =
  | 'courses'
  | 'media'
  | 'product-types'
  | 'products'
  | 'project-groups'
  | 'project-types'
  | 'projects'
  | 'users'

async function countDocuments(
  props: AdminViewServerProps,
  collection: DashboardCollection,
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

function appendQueryValue(params: URLSearchParams, key: string, value: unknown) {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => {
      appendQueryValue(params, `${key}[${index}]`, entry)
    })

    return
  }

  if (value && typeof value === 'object') {
    for (const [entryKey, entryValue] of Object.entries(value)) {
      appendQueryValue(params, `${key}[${entryKey}]`, entryValue)
    }

    return
  }

  params.set(key, String(value))
}

function normalizeWhere(where: Where): Where {
  if ('or' in where) {
    return where
  }

  if ('and' in where) {
    return { or: [where] }
  }

  return {
    or: [
      {
        and: [where],
      },
    ],
  }
}

function collectionListLink(collection: DashboardCollection, where?: Where) {
  if (!where) {
    return dashboardLink(`/collections/${collection}`)
  }

  const params = new URLSearchParams({
    depth: '1',
    limit: '10',
    page: '1',
  })

  appendQueryValue(params, 'where', normalizeWhere(where))

  return dashboardLink(`/collections/${collection}?${params.toString()}`)
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

function QuickActionCard({ description, href, label }: QuickAction) {
  return (
    <a
      className="rounded-2xl border border-(--theme-elevation-150) bg-(--theme-elevation-0) px-4 py-3 transition hover:border-(--theme-success-500) hover:bg-(--theme-elevation-100)"
      href={href}
    >
      <div className="text-sm font-semibold text-(--theme-text)">{label}</div>
      <p className="mt-1 text-sm leading-6 text-(--theme-text) opacity-72">{description}</p>
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
    projectsWithoutViewers,
    projectsWithoutEditors,
    projectsWithoutManagers,
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
    countDocuments(props, 'projects', { viewers: { exists: false } }),
    countDocuments(props, 'projects', { editors: { exists: false } }),
    countDocuments(props, 'projects', { managers: { exists: false } }),
    countDocuments(props, 'users', {
      and: [
        { viewableProjects: { exists: false } },
        { editableProjects: { exists: false } },
        { managedProjects: { exists: false } },
      ],
    }),
  ])

  const metrics: Metric[] = [
    { label: 'Projects', total: projects, href: collectionListLink('projects') },
    {
      label: 'Project Groups',
      total: projectGroups,
      href: collectionListLink('project-groups'),
    },
    { label: 'Courses', total: courses, href: collectionListLink('courses') },
    { label: 'Products', total: products, href: collectionListLink('products') },
    { label: 'Users', total: users, href: collectionListLink('users') },
    { label: 'Media', total: media, href: collectionListLink('media') },
  ]

  const healthItems: HealthItem[] = [
    {
      label: 'Projects without groups',
      total: projectsWithoutGroups,
      description: 'Projects that do not yet contain any project groups.',
      href: collectionListLink('projects'),
    },
    {
      label: 'Projects without courses',
      total: projectsWithoutCourses,
      description: 'Projects that do not yet contain any courses.',
      href: collectionListLink('projects'),
    },
    {
      label: 'Empty project groups',
      total: emptyProjectGroups,
      description: 'Project groups that do not yet contain any products.',
      href: collectionListLink('project-groups', { products: { exists: false } }),
    },
    {
      label: 'Products without courses',
      total: productsWithoutCourses,
      description: 'Products that are not linked into any course yet.',
      href: collectionListLink('products', { courses: { exists: false } }),
    },
    {
      label: 'Products without groups',
      total: productsWithoutGroups,
      description: 'Products that are not included in any project group yet.',
      href: collectionListLink('products', { projectGroups: { exists: false } }),
    },
    {
      label: 'Projects without viewers',
      total: projectsWithoutViewers,
      description: 'Projects that do not yet have any viewer memberships assigned.',
      href: collectionListLink('projects', { viewers: { exists: false } }),
    },
    {
      label: 'Projects without editors',
      total: projectsWithoutEditors,
      description: 'Projects that do not yet have any editor memberships assigned.',
      href: collectionListLink('projects', { editors: { exists: false } }),
    },
    {
      label: 'Projects without managers',
      total: projectsWithoutManagers,
      description: 'Projects that do not yet have any manager memberships assigned.',
      href: collectionListLink('projects', { managers: { exists: false } }),
    },
    {
      label: 'Users without project memberships',
      total: usersWithoutMemberships,
      description:
        'Authenticated users who are not assigned as viewer, editor, or manager anywhere.',
      href: collectionListLink('users', {
        and: [
          { viewableProjects: { exists: false } },
          { editableProjects: { exists: false } },
          { managedProjects: { exists: false } },
        ],
      }),
    },
  ]

  const quickActions: QuickAction[] = [
    {
      label: 'Create project',
      description: 'Start a new top-level workspace before adding access, groups, and courses.',
      href: dashboardLink('/collections/projects/create'),
    },
    {
      label: 'Create course',
      description: 'Add a deliverable learning structure inside an existing project.',
      href: dashboardLink('/collections/courses/create'),
    },
    {
      label: 'Create product',
      description: 'Add reusable catalog content that can be grouped and linked into courses.',
      href: dashboardLink('/collections/products/create'),
    },
    {
      label: 'Configure project access',
      description:
        'Open projects that are still missing managers so access setup can be completed.',
      href: collectionListLink('projects', { managers: { exists: false } }),
    },
    {
      label: 'Review users without memberships',
      description:
        'Find authenticated users who are not attached to any project responsibilities yet.',
      href: collectionListLink('users', {
        and: [
          { viewableProjects: { exists: false } },
          { editableProjects: { exists: false } },
          { managedProjects: { exists: false } },
        ],
      }),
    },
    {
      label: 'Review orphaned products',
      description: 'Open products that are not yet grouped into any project structure.',
      href: collectionListLink('products', { projectGroups: { exists: false } }),
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
            Move between the most common create and review flows without opening full collection
            lists first.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            {quickActions.map((action) => (
              <QuickActionCard key={action.label} {...action} />
            ))}
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
