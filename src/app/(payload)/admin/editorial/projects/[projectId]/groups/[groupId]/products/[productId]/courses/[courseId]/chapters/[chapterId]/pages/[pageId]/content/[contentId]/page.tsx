import { notFound } from 'next/navigation'

import { EditorialInfoGrid, EditorialPage } from '@/components/admin/editorial/EditorialChrome'
import {
  chapterHref,
  contentEditHref,
  contentHref,
  courseHref,
  editorialHref,
  formatDate,
  loadContentOverview,
  pageHref,
  productHref,
  projectGroupHref,
  projectHref,
  richTextSummary,
} from '@/lib/editorial'

type Args = {
  params: Promise<{
    chapterId: string
    contentId: string
    courseId: string
    groupId: string
    pageId: string
    productId: string
    projectId: string
  }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ContentEditorialPage({ params, searchParams }: Args) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const projectID = Number(resolvedParams.projectId)
  const groupID = Number(resolvedParams.groupId)
  const productID = Number(resolvedParams.productId)
  const courseID = Number(resolvedParams.courseId)
  const chapterID = Number(resolvedParams.chapterId)
  const pageID = Number(resolvedParams.pageId)
  const contentID = Number(resolvedParams.contentId)
  const locale =
    typeof resolvedSearchParams.locale === 'string' ? resolvedSearchParams.locale : undefined

  if (
    ![projectID, groupID, productID, courseID, chapterID, pageID, contentID].every(Number.isInteger)
  ) {
    notFound()
  }

  const data = await loadContentOverview(
    projectID,
    groupID,
    productID,
    courseID,
    chapterID,
    pageID,
    contentID,
    locale,
  )
  if (!data) notFound()

  return (
    <EditorialPage
      actions={[
        {
          href: contentEditHref(
            data.project.id,
            data.group.id,
            data.product.id,
            data.course.id,
            data.chapter.id,
            data.page.id,
            data.content.id,
          ),
          label: 'Edit content',
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
        {
          href: pageHref(
            data.project.id,
            data.group.id,
            data.product.id,
            data.course.id,
            data.chapter.id,
            data.page.id,
          ),
          label: data.page.title,
        },
        { label: data.content.title },
      ]}
      description="Content screens focus on the current reusable content item."
      meta={[
        data.content.contentType,
        ...(formatDate(data.content.updatedAt)
          ? [`Updated ${formatDate(data.content.updatedAt)}`]
          : []),
      ]}
      title={data.content.title}
    >
      <EditorialInfoGrid
        items={[
          { label: 'Type', value: data.content.contentType },
          { label: 'Description', value: richTextSummary(data.content.description) },
        ]}
      />
    </EditorialPage>
  )
}
