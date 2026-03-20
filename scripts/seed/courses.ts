import type { Payload } from 'payload'

import type {
  Course,
  CourseChapter,
  CourseContent,
  CoursePage,
  Media,
  Product,
  ProjectGroup,
} from '../../src/payload-types'
import {
  COURSE_CONTENT_SEED_DATA,
  COURSE_SEED_DATA,
  type CourseSeedDefinition,
} from './course-data'
import { createScopedSeedImageRequest, ensureSeedHeroImage } from './ensure-seed-hero-image'
import { DEMO_PROJECT } from './demo'

type ProjectContext = {
  courseByTitle: Map<string, Course>
  productByTitle: Map<string, Product>
  projectGroup: null | ProjectGroup
  projectID: number
}

type RichTextValue = NonNullable<Course['description']>

function richTextDocument(paragraphs: string[]): RichTextValue {
  return {
    root: {
      children: paragraphs.map((text) => ({
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal' as const,
            style: '',
            text,
            type: 'text' as const,
            version: 1,
          },
        ],
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        textFormat: 0,
        textStyle: '',
        type: 'paragraph' as const,
        version: 1,
      })),
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      type: 'root' as const,
      version: 1,
    },
  }
}

async function ensureProjectContext(payload: Payload): Promise<ProjectContext> {
  const project = await payload.find({
    collection: 'projects',
    where: {
      title: {
        equals: DEMO_PROJECT.title,
      },
    },
    depth: 0,
    limit: 1,
  })

  const projectDoc = project.docs[0]

  if (!projectDoc) {
    throw new Error('Missing RBAC Demo Project. Run the project seed first.')
  }

  const courses = await payload.find({
    collection: 'courses',
    where: {
      project: {
        equals: projectDoc.id,
      },
    },
    depth: 0,
    limit: 100,
    pagination: false,
  })

  const products = await payload.find({
    collection: 'products',
    depth: 0,
    limit: 100,
    pagination: false,
  })

  const groups = await payload.find({
    collection: 'project-groups',
    where: {
      project: {
        equals: projectDoc.id,
      },
    },
    depth: 0,
    limit: 10,
    pagination: false,
  })

  return {
    courseByTitle: new Map(courses.docs.map((course) => [course.title, course])),
    productByTitle: new Map(products.docs.map((product) => [product.title, product])),
    projectGroup: groups.docs[0] ?? null,
    projectID: projectDoc.id,
  }
}

async function ensureScopedMedia(
  payload: Payload,
  context: ProjectContext,
  args: {
    alt: string
    courseID?: number
    productID?: number
    scope: 'course' | 'product' | 'project' | 'projectGroup'
  },
): Promise<Media> {
  const existing = await payload.find({
    collection: 'media',
    where: {
      and: [
        {
          alt: {
            equals: args.alt,
          },
        },
        {
          project: {
            equals: context.projectID,
          },
        },
      ],
    },
    depth: 0,
    limit: 1,
  })

  const data = {
    alt: args.alt,
    availabilityScope: args.scope,
    course: args.scope === 'course' ? args.courseID : undefined,
    kind: 'image' as const,
    product: args.scope === 'product' ? args.productID : undefined,
    project: context.projectID,
    projectGroup: args.scope === 'projectGroup' ? context.projectGroup?.id : undefined,
  }

  if (existing.docs[0]) {
    await payload.update({
      collection: 'media',
      id: existing.docs[0].id,
      data,
      depth: 0,
    })

    return existing.docs[0]
  }

  const filePath = await ensureSeedHeroImage(
    createScopedSeedImageRequest({
      alt: args.alt,
      scope: args.scope,
    }),
  )

  await payload.create({
    collection: 'media',
    data,
    depth: 0,
    filePath,
  })

  const created = await payload.find({
    collection: 'media',
    where: {
      and: [
        {
          alt: {
            equals: args.alt,
          },
        },
        {
          project: {
            equals: context.projectID,
          },
        },
      ],
    },
    depth: 0,
    limit: 1,
  })

  if (!created.docs[0]) {
    throw new Error(`Failed to create scoped media: ${args.alt}`)
  }

  return created.docs[0]
}

async function ensureCourseDetails(
  payload: Payload,
  context: ProjectContext,
  courseDefinition: CourseSeedDefinition,
): Promise<Course> {
  const course = context.courseByTitle.get(courseDefinition.title)

  if (!course) {
    throw new Error(`Missing seeded course: ${courseDefinition.title}`)
  }

  await payload.update({
    collection: 'courses',
    id: course.id,
    data: {
      description: courseDefinition.courseDescription
        ? richTextDocument(courseDefinition.courseDescription)
        : undefined,
      hero: course.hero,
      project: context.projectID,
      title: courseDefinition.title,
    },
    depth: 0,
  })

  return payload.findByID({
    collection: 'courses',
    id: course.id,
    depth: 0,
  })
}

async function ensureCourseContent(
  payload: Payload,
  context: ProjectContext,
  courseDefinition: CourseSeedDefinition,
): Promise<Map<string, CourseContent>> {
  const course = context.courseByTitle.get(courseDefinition.title)

  if (!course) {
    throw new Error(`Missing seeded course: ${courseDefinition.title}`)
  }

  const primaryProductID = courseDefinition.productTitles[0]
    ? context.productByTitle.get(courseDefinition.productTitles[0])?.id
    : undefined

  const contentByKey = new Map<string, CourseContent>()

  for (const definition of COURSE_CONTENT_SEED_DATA) {
    const existing = await payload.find({
      collection: 'course-content',
      where: {
        and: [
          {
            title: {
              equals: definition.title,
            },
          },
          {
            project: {
              equals: context.projectID,
            },
          },
        ],
      },
      depth: 0,
      limit: 1,
    })

    const image =
      definition.type === 'image'
        ? await ensureScopedMedia(payload, context, {
            alt: `${definition.title} seeded image`,
            courseID: course.id,
            productID: primaryProductID,
            scope: definition.mediaScope,
          })
        : null

    const assignmentQuestions =
      definition.type === 'assignment'
        ? definition.questions.map((key) => {
            const question = contentByKey.get(key)
            if (!question) {
              throw new Error(`Missing seeded question content for assignment: ${key}`)
            }
            return question.id
          })
        : undefined

    const data = {
      assignmentQuestions,
      contentType: definition.type,
      description: definition.description ? richTextDocument(definition.description) : undefined,
      image: image?.id,
      imageCaption:
        definition.type === 'image' && definition.caption
          ? richTextDocument(definition.caption)
          : undefined,
      project: context.projectID,
      quoteAttribution: definition.type === 'quote' ? definition.attribution : undefined,
      quoteText: definition.type === 'quote' ? definition.quote : undefined,
      richTextBody:
        definition.type === 'richText' ? richTextDocument(definition.paragraphs) : undefined,
      title: definition.title,
    }

    if (existing.docs[0]) {
      await payload.update({
        collection: 'course-content',
        id: existing.docs[0].id,
        data,
        depth: 0,
      })
    } else {
      await payload.create({
        collection: 'course-content',
        data,
        depth: 0,
      })
    }

    const contentResult = await payload.find({
      collection: 'course-content',
      where: {
        and: [
          {
            title: {
              equals: definition.title,
            },
          },
          {
            project: {
              equals: context.projectID,
            },
          },
        ],
      },
      depth: 0,
      limit: 1,
    })

    const content = contentResult.docs[0]

    if (!content) {
      throw new Error(`Failed to upsert course content: ${definition.title}`)
    }

    contentByKey.set(definition.key, content)
  }

  return contentByKey
}

async function ensureChapter(
  payload: Payload,
  context: ProjectContext,
  course: Course,
  courseDefinition: CourseSeedDefinition,
  chapterDefinition: CourseSeedDefinition['chapters'][number],
): Promise<CourseChapter> {
  const primaryProductID = courseDefinition.productTitles[0]
    ? context.productByTitle.get(courseDefinition.productTitles[0])?.id
    : undefined
  const hero = await ensureScopedMedia(payload, context, {
    alt: `${courseDefinition.title} - ${chapterDefinition.title} hero`,
    courseID: course.id,
    productID: primaryProductID,
    scope: chapterDefinition.heroScope ?? 'course',
  })

  const existing = await payload.find({
    collection: 'course-chapters',
    where: {
      and: [
        {
          title: {
            equals: chapterDefinition.title,
          },
        },
        {
          course: {
            equals: course.id,
          },
        },
      ],
    },
    depth: 0,
    limit: 1,
  })

  const data = {
    course: course.id,
    description: chapterDefinition.description
      ? richTextDocument(chapterDefinition.description)
      : undefined,
    hero: hero.id,
    title: chapterDefinition.title,
  }

  if (existing.docs[0]) {
    await payload.update({
      collection: 'course-chapters',
      id: existing.docs[0].id,
      data,
      depth: 0,
    })
  } else {
    await payload.create({
      collection: 'course-chapters',
      data,
      depth: 0,
    })
  }

  const chapterResult = await payload.find({
    collection: 'course-chapters',
    where: {
      and: [
        {
          title: {
            equals: chapterDefinition.title,
          },
        },
        {
          course: {
            equals: course.id,
          },
        },
      ],
    },
    depth: 0,
    limit: 1,
  })

  const chapter = chapterResult.docs[0]

  if (!chapter) {
    throw new Error(`Failed to upsert course chapter: ${chapterDefinition.title}`)
  }

  return chapter
}

async function ensurePage(
  payload: Payload,
  context: ProjectContext,
  course: Course,
  courseDefinition: CourseSeedDefinition,
  chapter: CourseChapter,
  pageDefinition: CourseSeedDefinition['chapters'][number]['pages'][number],
  contentByKey: Map<string, CourseContent>,
): Promise<CoursePage> {
  const primaryProductID = courseDefinition.productTitles[0]
    ? context.productByTitle.get(courseDefinition.productTitles[0])?.id
    : undefined

  const pageHero = pageDefinition.heroScope
    ? await ensureScopedMedia(payload, context, {
        alt: `${courseDefinition.title} - ${pageDefinition.title} hero`,
        courseID: course.id,
        productID: primaryProductID,
        scope: pageDefinition.heroScope,
      })
    : null

  const contentItems = pageDefinition.contentKeys.map((key) => {
    const item = contentByKey.get(key)
    if (!item) {
      throw new Error(`Missing seeded content item: ${key}`)
    }
    return { content: item.id }
  })

  const existing = await payload.find({
    collection: 'course-pages',
    where: {
      and: [
        {
          title: {
            equals: pageDefinition.title,
          },
        },
        {
          chapter: {
            equals: chapter.id,
          },
        },
      ],
    },
    depth: 0,
    limit: 1,
  })

  const data = {
    chapter: chapter.id,
    contentItems,
    description: pageDefinition.description
      ? richTextDocument(pageDefinition.description)
      : undefined,
    hero: pageHero?.id,
    title: pageDefinition.title,
  }

  if (existing.docs[0]) {
    await payload.update({
      collection: 'course-pages',
      id: existing.docs[0].id,
      data,
      depth: 0,
    })
  } else {
    await payload.create({
      collection: 'course-pages',
      data,
      depth: 0,
    })
  }

  const pageResult = await payload.find({
    collection: 'course-pages',
    where: {
      and: [
        {
          title: {
            equals: pageDefinition.title,
          },
        },
        {
          chapter: {
            equals: chapter.id,
          },
        },
      ],
    },
    depth: 0,
    limit: 1,
  })

  const page = pageResult.docs[0]

  if (!page) {
    throw new Error(`Failed to upsert course page: ${pageDefinition.title}`)
  }

  return page
}

export async function seedCourses(payload: Payload) {
  const context = await ensureProjectContext(payload)

  for (const courseDefinition of COURSE_SEED_DATA) {
    const course = await ensureCourseDetails(payload, context, courseDefinition)
    const contentByKey = await ensureCourseContent(payload, context, courseDefinition)

    for (const chapterDefinition of courseDefinition.chapters) {
      const chapter = await ensureChapter(
        payload,
        context,
        course,
        courseDefinition,
        chapterDefinition,
      )

      for (const pageDefinition of chapterDefinition.pages) {
        await ensurePage(
          payload,
          context,
          course,
          courseDefinition,
          chapter,
          pageDefinition,
          contentByKey,
        )
      }
    }

    console.log('Ensured seeded course structure:', courseDefinition.title)
  }
}
