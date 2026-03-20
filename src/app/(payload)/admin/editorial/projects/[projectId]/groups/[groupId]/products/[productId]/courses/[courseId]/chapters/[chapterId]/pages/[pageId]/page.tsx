import { notFound } from 'next/navigation'

import {
  EditorialInfoGrid,
  EditorialList,
  EditorialPage,
  EditorialSection,
} from '@/components/admin/editorial/EditorialChrome'
import {
  chapterHref,
  contentHref,
  courseHref,
  editorialHref,
  formatDate,
  loadPageOverview,
  pageEditHref,
  pageManageContentHref,
  productHref,
  projectGroupHref,
  projectHref,
  richTextSummary,
} from '@/lib/editorial'

type Args = {
  params: Promise<{
    chapterId: string
    courseId: string
    groupId: string
    pageId: string
    productId: string
    projectId: string
  }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function PageEditorialPage({ params, searchParams }: Args) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const projectID = Number(resolvedParams.projectId)
  const groupID = Number(resolvedParams.groupId)
  const productID = Number(resolvedParams.productId)
  const courseID = Number(resolvedParams.courseId)
  const chapterID = Number(resolvedParams.chapterId)
  const pageID = Number(resolvedParams.pageId)
  const locale =
    typeof resolvedSearchParams.locale === 'string' ? resolvedSearchParams.locale : undefined

  if (![projectID, groupID, productID, courseID, chapterID, pageID].every(Number.isInteger)) {
    notFound()
  }

  const data = await loadPageOverview(
    projectID,
    groupID,
    productID,
    courseID,
    chapterID,
    pageID,
    locale,
  )
  if (!data) notFound()

  return (
    <EditorialPage
      actions={[
        {
          href: pageManageContentHref(
            data.project.id,
            data.group.id,
            data.product.id,
            data.course.id,
            data.chapter.id,
            data.page.id,
          ),
          label: 'Manage content items',
        },
        {
          href: pageEditHref(
            data.project.id,
            data.group.id,
            data.product.id,
            data.course.id,
            data.chapter.id,
            data.page.id,
          ),
          label: 'Edit page',
          secondary: true,
        },
      ]}
      breadcrumbs={[
        { href: editorialHref(), label: 'Home', root: true },
        { href: projectHref(data.project.id), label: data.project.title },
        { href: projectGroupHref(data.project.id, data.group.id), label: data.group.title },
        {
          href: productHref(data.project.id, data.group.id, data.product.id),
          label: data.product.title,
        },
        {
          href: courseHref(data.project.id, data.group.id, data.product.id, data.course.id),
          label: data.course.title,
        },
        {
          href: chapterHref(
            data.project.id,
            data.group.id,
            data.product.id,
            data.course.id,
            data.chapter.id,
          ),
          label: data.chapter.title,
        },
        { label: data.page.title },
      ]}
      description="Page screens focus on ordered content placements. Parent lineage stays in the breadcrumb."
      meta={formatDate(data.page.updatedAt) ? [`Updated ${formatDate(data.page.updatedAt)}`] : []}
      title={data.page.title}
    >
      <EditorialInfoGrid
        items={[
          { label: 'Description', value: richTextSummary(data.page.description) },
          { label: 'Content items', value: `${data.contentItems.length}` },
        ]}
      />

      <EditorialSection
        description="Content items are the direct children of a page."
        title="Content items"
      >
        <EditorialList
          emptyMessage="This page does not contain any content items yet."
          items={data.contentItems.map((content) => ({
            href: contentHref(
              data.project.id,
              data.group.id,
              data.product.id,
              data.course.id,
              data.chapter.id,
              data.page.id,
              content.id,
            ),
            meta: [
              content.contentType,
              ...(formatDate(content.updatedAt)
                ? [`Updated ${formatDate(content.updatedAt)}`]
                : []),
            ],
            title: content.title,
          }))}
        />
      </EditorialSection>
    </EditorialPage>
  )
}
