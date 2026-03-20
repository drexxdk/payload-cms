import { notFound } from 'next/navigation'

import {
  EditorialInfoGrid,
  EditorialList,
  EditorialPage,
  EditorialSection,
} from '@/components/admin/editorial/EditorialChrome'
import {
  chapterHref,
  chapterCreateHref,
  courseEditHref,
  editorialHref,
  formatDate,
  projectGroupHref,
  projectHref,
  productHref,
  richTextSummary,
  loadCourseOverview,
} from '@/lib/editorial'

type Args = {
  params: Promise<{ courseId: string; groupId: string; productId: string; projectId: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function CourseEditorialPage({ params, searchParams }: Args) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const projectID = Number(resolvedParams.projectId)
  const groupID = Number(resolvedParams.groupId)
  const productID = Number(resolvedParams.productId)
  const courseID = Number(resolvedParams.courseId)
  const locale =
    typeof resolvedSearchParams.locale === 'string' ? resolvedSearchParams.locale : undefined

  if (![projectID, groupID, productID, courseID].every(Number.isInteger)) notFound()

  const data = await loadCourseOverview(projectID, groupID, productID, courseID, locale)
  if (!data) notFound()

  return (
    <EditorialPage
      actions={[
        {
          href: chapterCreateHref(data.project.id, data.group.id, data.product.id, data.course.id),
          label: 'Create chapter',
        },
        {
          href: courseEditHref(data.project.id, data.group.id, data.product.id, data.course.id),
          label: 'Edit course',
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
        { label: data.course.title },
      ]}
      description="Course screens focus on the frontpage and their direct child chapters. Parent context stays in breadcrumbs."
      meta={
        formatDate(data.course.updatedAt) ? [`Updated ${formatDate(data.course.updatedAt)}`] : []
      }
      title={data.course.title}
    >
      <EditorialInfoGrid
        items={[
          { label: 'ISBN', value: data.course.isbn ?? undefined },
          { label: 'Description', value: richTextSummary(data.course.description) },
          { label: 'Chapters', value: `${data.chapters.length}` },
        ]}
      />

      <EditorialSection
        description="Chapters are the direct children of a course."
        title="Chapters"
      >
        <EditorialList
          emptyMessage="This course does not contain any chapters yet."
          items={data.chapters.map((chapter) => ({
            href: chapterHref(
              data.project.id,
              data.group.id,
              data.product.id,
              data.course.id,
              chapter.id,
            ),
            meta: formatDate(chapter.updatedAt)
              ? [`Updated ${formatDate(chapter.updatedAt)}`]
              : undefined,
            title: chapter.title,
          }))}
        />
      </EditorialSection>
    </EditorialPage>
  )
}
