import { notFound } from 'next/navigation'

import {
  EditorialInfoGrid,
  EditorialList,
  EditorialPage,
  EditorialSection,
} from '@/components/admin/editorial/EditorialChrome'
import {
  courseHref,
  editorialHref,
  productEditHref,
  productManageCoursesHref,
  projectGroupHref,
  projectHref,
  loadProductOverview,
} from '@/lib/editorial'

type Args = {
  params: Promise<{ groupId: string; productId: string; projectId: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ProductEditorialPage({ params, searchParams }: Args) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const projectID = Number(resolvedParams.projectId)
  const groupID = Number(resolvedParams.groupId)
  const productID = Number(resolvedParams.productId)
  const locale =
    typeof resolvedSearchParams.locale === 'string' ? resolvedSearchParams.locale : undefined

  if (!Number.isInteger(projectID) || !Number.isInteger(groupID) || !Number.isInteger(productID)) {
    notFound()
  }

  const data = await loadProductOverview(projectID, groupID, productID, locale)
  if (!data) notFound()

  return (
    <EditorialPage
      actions={[
        {
          href: productManageCoursesHref(data.project.id, data.group.id, data.product.id),
          label: 'Manage courses',
        },
        {
          href: productEditHref(data.project.id, data.group.id, data.product.id),
          label: 'Edit product',
          secondary: true,
        },
      ]}
      breadcrumbs={[
        { href: editorialHref(), label: 'Home', root: true },
        { href: projectHref(data.project.id), label: data.project.title },
        { href: projectGroupHref(data.project.id, data.group.id), label: data.group.title },
        { label: data.product.title },
      ]}
      description="Courses are first managed from product context. This is the first level where course actions belong."
      title={data.product.title}
    >
      <EditorialInfoGrid
        items={[
          { label: 'ISBN', value: data.product.isbn ?? undefined },
          {
            label: 'Product type',
            value:
              typeof data.product.productType === 'object' && data.product.productType !== null
                ? data.product.productType.title
                : undefined,
          },
          { label: 'Associated courses', value: `${data.courses.length}` },
        ]}
      />

      <EditorialSection
        description="Open a course to continue into chapters and pages."
        title="Courses"
      >
        <EditorialList
          emptyMessage="No courses are associated with this product in the current context yet."
          items={data.courses.map((course) => ({
            href: courseHref(data.project.id, data.group.id, data.product.id, course.id),
            meta: course.isbn ? [course.isbn] : undefined,
            title: course.title,
          }))}
        />
      </EditorialSection>
    </EditorialPage>
  )
}
