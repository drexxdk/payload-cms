import path from 'path'
import type { Payload } from 'payload'
import { COURSE_SEED_DATA } from './course-data'
import { DEMO_PASSWORD, DEMO_PROJECT, DEMO_USERS } from './demo'

const DEMO_COURSE_HERO_FILE = path.resolve(
  process.cwd(),
  'media',
  'Screenshot_20241017_110011_Outlook.jpg',
)

type SeedProjectDefinition = {
  title: string
  viewers?: number[]
  editors?: number[]
  managers?: number[]
}

async function ensureUser(payload: Payload, email: string) {
  const existing = await payload.find({
    collection: 'users',
    where: {
      email: {
        equals: email,
      },
    },
    depth: 0,
    limit: 1,
  })

  if (existing.docs.length > 0) {
    return payload.update({
      collection: 'users',
      id: existing.docs[0].id,
      data: {
        roles: ['user'],
      },
      depth: 0,
    })
  }

  return payload.create({
    collection: 'users',
    data: {
      email,
      password: DEMO_PASSWORD,
      roles: ['user'],
    },
    depth: 0,
  })
}

async function ensureBootstrapAdmin(payload: Payload) {
  const existing = await payload.find({
    collection: 'users',
    where: {
      email: {
        equals: DEMO_USERS.admin,
      },
    },
    depth: 0,
    limit: 1,
  })

  if (existing.docs.length > 0) {
    return payload.update({
      collection: 'users',
      id: existing.docs[0].id,
      data: {
        roles: ['super-admin'],
      },
      depth: 0,
    })
  }

  return payload.create({
    collection: 'users',
    data: {
      email: DEMO_USERS.admin,
      password: DEMO_PASSWORD,
      roles: ['super-admin'],
    },
    depth: 0,
  })
}

async function ensureProjectType(payload: Payload) {
  const existing = await payload.find({
    collection: 'project-types',
    where: {
      title: {
        equals: DEMO_PROJECT.projectType,
      },
    },
    depth: 0,
    limit: 1,
  })

  return existing.docs[0] ?? null
}

async function ensureCourseHero(payload: Payload, projectID: number, courseTitle: string) {
  const existing = await payload.find({
    collection: 'media',
    where: {
      and: [
        {
          alt: {
            equals: `${courseTitle} hero image`,
          },
        },
        {
          project: {
            equals: projectID,
          },
        },
      ],
    },
    depth: 0,
    limit: 1,
  })

  if (existing.docs[0]) {
    return existing.docs[0]
  }

  return payload.create({
    collection: 'media',
    data: {
      alt: `${courseTitle} hero image`,
      availabilityScope: 'project',
      kind: 'image',
      project: projectID,
    },
    depth: 0,
    filePath: DEMO_COURSE_HERO_FILE,
  })
}

async function ensureCourse(
  payload: Payload,
  projectID: number,
  heroID: number,
  courseTitle: string,
) {
  const existing = await payload.find({
    collection: 'courses',
    where: {
      and: [
        {
          title: {
            equals: courseTitle,
          },
        },
        {
          project: {
            equals: projectID,
          },
        },
      ],
    },
    depth: 0,
    limit: 1,
  })

  if (existing.docs[0]) {
    return payload.update({
      collection: 'courses',
      id: existing.docs[0].id,
      data: {
        hero: heroID,
        project: projectID,
        title: courseTitle,
      },
      depth: 0,
    })
  }

  return payload.create({
    collection: 'courses',
    data: {
      hero: heroID,
      title: courseTitle,
      project: projectID,
    },
    depth: 0,
  })
}

async function ensureGroup(payload: Payload, projectID: number) {
  const existing = await payload.find({
    collection: 'project-groups',
    where: {
      and: [
        {
          title: {
            equals: DEMO_PROJECT.groupTitle,
          },
        },
        {
          project: {
            equals: projectID,
          },
        },
      ],
    },
    depth: 0,
    limit: 1,
  })

  if (existing.docs[0]) {
    return payload.update({
      collection: 'project-groups',
      id: existing.docs[0].id,
      data: {
        title: DEMO_PROJECT.groupTitle,
        project: projectID,
      },
      depth: 0,
    })
  }

  return payload.create({
    collection: 'project-groups',
    data: {
      title: DEMO_PROJECT.groupTitle,
      project: projectID,
    },
    depth: 0,
  })
}

async function ensureProject(
  payload: Payload,
  projectTypeID: number,
  project: SeedProjectDefinition,
) {
  const existingProject = await payload.find({
    collection: 'projects',
    where: {
      title: {
        equals: project.title,
      },
    },
    depth: 0,
    limit: 1,
  })

  const projectData = {
    title: project.title,
    projectType: projectTypeID,
    lifecycle: 'active' as const,
    isPublic: false,
    viewers: project.viewers,
    editors: project.editors,
    managers: project.managers,
  }

  const existingDoc = existingProject.docs[0]

  if (existingDoc) {
    return payload.update({
      collection: 'projects',
      id: existingDoc.id,
      data: projectData,
      depth: 0,
      draft: false,
    })
  }

  return payload.create({
    collection: 'projects',
    data: projectData,
    depth: 0,
    draft: false,
  })
}

export async function seedProjects(payload: Payload) {
  const projectType = await ensureProjectType(payload)

  if (!projectType) {
    throw new Error(`Missing required project type: ${DEMO_PROJECT.projectType}`)
  }

  await ensureBootstrapAdmin(payload)

  const viewer = await ensureUser(payload, DEMO_USERS.viewer)
  const editor = await ensureUser(payload, DEMO_USERS.editor)
  const manager = await ensureUser(payload, DEMO_USERS.manager)

  const projectDefinitions: SeedProjectDefinition[] = [
    {
      title: DEMO_PROJECT.title,
      viewers: [viewer.id],
      editors: [editor.id],
      managers: [manager.id],
    },
    ...Array.from({ length: 13 }, (_, index) => ({
      title: `RBAC Manager Portfolio ${String(index + 1).padStart(2, '0')}`,
      viewers: index < 2 ? [manager.id] : undefined,
      editors: index < 3 ? [manager.id, editor.id] : undefined,
      managers: [manager.id],
    })),
    ...Array.from({ length: 4 }, (_, index) => ({
      title: `RBAC Viewer Shelf ${String(index + 1).padStart(2, '0')}`,
      viewers: [viewer.id, editor.id],
      editors: index < 2 ? [editor.id] : undefined,
      managers: undefined,
    })),
  ]

  let projectID: number | undefined

  for (const projectDefinition of projectDefinitions) {
    const projectDoc = await ensureProject(payload, projectType.id, projectDefinition)

    if (projectDefinition.title === DEMO_PROJECT.title) {
      projectID = projectDoc.id
    }

    console.log('Ensured seeded project memberships:', projectDoc.title, projectDoc.id)
  }

  if (!projectID) {
    throw new Error('Failed to ensure the base demo project')
  }

  const group = await ensureGroup(payload, projectID)

  for (const courseDefinition of COURSE_SEED_DATA) {
    const courseHero = await ensureCourseHero(payload, projectID, courseDefinition.title)
    const course = await ensureCourse(payload, projectID, courseHero.id, courseDefinition.title)

    console.log('Ensured demo course hero media:', courseHero.id, courseDefinition.title)
    console.log('Ensured demo project course:', course.id, courseDefinition.title)
  }

  console.log('Ensured demo project group:', group.id)
}
