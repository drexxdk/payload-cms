import { notFound } from 'next/navigation'

import {
  EditorialInfoGrid,
  EditorialList,
  EditorialPage,
  EditorialSection,
} from '@/components/admin/editorial/EditorialChrome'
import {
  dashboardHref,
  loadProjectGroupOverview,
  productHref,
  projectGroupEditHref,
  projectGroupManageProductsHref,
  projectHref,
} from '@/lib/editorial'

type Args = {
  params: Promise<{ groupId: string; projectId: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ProjectGroupEditorialPage({ params, searchParams }: Args) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const projectID = Number(resolvedParams.projectId)
  const groupID = Number(resolvedParams.groupId)
  const locale =
    typeof resolvedSearchParams.locale === 'string' ? resolvedSearchParams.locale : undefined

  if (!Number.isInteger(projectID) || !Number.isInteger(groupID)) notFound()

  const data = await loadProjectGroupOverview(projectID, groupID, locale)
  if (!data) notFound()

  return (
    <EditorialPage
      actions={[
        {
          href: projectGroupManageProductsHref(data.project.id, data.group.id),
          label: 'Manage products',
        },
        {
          href: projectGroupEditHref(data.project.id, data.group.id),
          label: 'Edit project group',
          secondary: true,
        },
      ]}
      breadcrumbs={[
        { href: dashboardHref(), label: 'Home', root: true },
        { href: projectHref(data.project.id), label: data.project.title },
        { label: data.group.title },
      ]}
      description="Project groups expose products as their direct children. Course work starts only when you open a product."
      title={data.group.title}
    >
      <EditorialInfoGrid items={[{ label: 'Products', value: `${data.products.length}` }]} />

      <EditorialSection
        description="Product titles are navigable links into the next level of the editorial tree."
        title="Products"
      >
        <EditorialList
          emptyMessage="This project group does not contain any products yet."
          items={data.products.map((product) => ({
            href: productHref(data.project.id, data.group.id, product.id),
            meta: [
              ...(product.courseCount > 0 ? [`${product.courseCount} courses`] : []),
              ...(product.productTypeTitle ? [product.productTypeTitle] : []),
            ],
            title: product.title,
          }))}
        />
      </EditorialSection>
    </EditorialPage>
  )
}
