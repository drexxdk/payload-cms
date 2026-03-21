import { notFound } from 'next/navigation'

import {
  EditorialInfoGrid,
  EditorialList,
  EditorialPage,
  EditorialSection,
} from '@/components/admin/editorial/EditorialChrome'
import {
  dashboardHref,
  formatStatus,
  loadProjectOverview,
  projectEditHref,
  projectGroupCreateHref,
  projectGroupHref,
} from '@/lib/editorial'

type Args = {
  params: Promise<{ projectId: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ProjectEditorialPage({ params, searchParams }: Args) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const projectID = Number(resolvedParams.projectId)
  const locale =
    typeof resolvedSearchParams.locale === 'string' ? resolvedSearchParams.locale : undefined

  if (!Number.isInteger(projectID)) notFound()

  const data = await loadProjectOverview(projectID, locale)
  if (!data) notFound()

  return (
    <EditorialPage
      actions={[
        {
          href: projectGroupCreateHref(data.project.id),
          label: 'Create project group',
        },
        {
          href: projectEditHref(data.project.id),
          label: 'Edit project',
          secondary: true,
        },
      ]}
      breadcrumbs={[
        { href: dashboardHref(), label: 'Home', root: true },
        { label: data.project.title },
      ]}
      description="Projects expose only their direct children. Open a project group to continue down the tree."
      meta={formatStatus(data.project._status, data.project.lifecycle)}
      title={data.project.title}
    >
      <EditorialInfoGrid
        items={[
          {
            label: 'Description',
            value: data.project.description ? 'Project description available' : undefined,
          },
          { label: 'Lifecycle', value: data.project.lifecycle },
          {
            label: 'Access',
            value: data.project.isPublic ? 'Public read access' : 'Restricted project access',
          },
        ]}
      />

      <EditorialSection
        description="Project groups are the direct children of a project. Product and course work begins deeper in the tree."
        title="Project groups"
      >
        <EditorialList
          emptyMessage="This project does not contain any project groups yet."
          items={data.groups.map((group) => ({
            href: projectGroupHref(data.project.id, group.id),
            meta: group.productCount > 0 ? [`${group.productCount} products`] : undefined,
            title: group.title,
          }))}
        />
      </EditorialSection>
    </EditorialPage>
  )
}
