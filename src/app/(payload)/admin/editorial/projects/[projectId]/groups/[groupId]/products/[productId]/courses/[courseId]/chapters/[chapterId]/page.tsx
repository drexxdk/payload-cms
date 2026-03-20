import { notFound } from 'next/navigation'

import {
  EditorialInfoGrid,
  EditorialList,
  EditorialPage,
  EditorialSection,
} from '@/components/admin/editorial/EditorialChrome'
import {
  chapterEditHref,
  editorialHref,
  formatDate,
  loadChapterOverview,
  pageCreateHref,
  pageHref,
  productHref,
  projectGroupHref,
  projectHref,
  courseHref,
  richTextSummary,
} from '@/lib/editorial'

type Args = {
  params: Promise<{
    chapterId: string
    courseId: string
    groupId: string
    productId: string
    projectId: string
  }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ChapterEditorialPage({ params, searchParams }: Args) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const projectID = Number(resolvedParams.projectId)
  const groupID = Number(resolvedParams.groupId)
  const productID = Number(resolvedParams.productId)
  const courseID = Number(resolvedParams.courseId)
  const chapterID = Number(resolvedParams.chapterId)
  const locale =
    typeof resolvedSearchParams.locale === 'string' ? resolvedSearchParams.locale : undefined

  if (![projectID, groupID, productID, courseID, chapterID].every(Number.isInteger)) notFound()

  const data = await loadChapterOverview(projectID, groupID, productID, courseID, chapterID, locale)
  if (!data) notFound()

  return (
    <EditorialPage
      actions={[
        {
          href: pageCreateHref(
            data.project.id,
            data.group.id,
            data.product.id,
            data.course.id,
            data.chapter.id,
          ),
          label: 'Create page',
        },
        {
          href: chapterEditHref(
            data.project.id,
            data.group.id,
            data.product.id,
            data.course.id,
            data.chapter.id,
          ),
          label: 'Edit chapter',
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
        { label: data.chapter.title },
      ]}
      description="Chapter screens focus on pages as their direct children."
      meta={
        formatDate(data.chapter.updatedAt) ? [`Updated ${formatDate(data.chapter.updatedAt)}`] : []
      }
      title={data.chapter.title}
    >
      <EditorialInfoGrid
        items={[
          { label: 'Description', value: richTextSummary(data.chapter.description) },
          { label: 'Pages', value: `${data.pages.length}` },
        ]}
      />

      <EditorialSection description="Pages are the direct children of a chapter." title="Pages">
        <EditorialList
          emptyMessage="This chapter does not contain any pages yet."
          items={data.pages.map((page) => ({
            href: pageHref(
              data.project.id,
              data.group.id,
              data.product.id,
              data.course.id,
              data.chapter.id,
              page.id,
            ),
            meta: [
              ...(page.contentCount > 0 ? [`${page.contentCount} content items`] : []),
              ...(formatDate(page.updatedAt) ? [`Updated ${formatDate(page.updatedAt)}`] : []),
            ],
            title: page.title,
          }))}
        />
      </EditorialSection>
    </EditorialPage>
  )
}
