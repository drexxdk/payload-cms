import type { Payload } from 'payload'
import { DEMO_PASSWORD, DEMO_PROJECT, DEMO_USERS } from './demo'

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

async function ensureCourse(payload: Payload, projectID: number) {
  const existing = await payload.find({
    collection: 'courses',
    where: {
      and: [
        {
          title: {
            equals: DEMO_PROJECT.courseTitle,
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
    collection: 'courses',
    data: {
      title: DEMO_PROJECT.courseTitle,
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

export async function seedProjects(payload: Payload) {
  const projectType = await ensureProjectType(payload)

  if (!projectType) {
    throw new Error(`Missing required project type: ${DEMO_PROJECT.projectType}`)
  }

  await ensureBootstrapAdmin(payload)

  const viewer = await ensureUser(payload, DEMO_USERS.viewer)
  const editor = await ensureUser(payload, DEMO_USERS.editor)
  const manager = await ensureUser(payload, DEMO_USERS.manager)

  const existingProject = await payload.find({
    collection: 'projects',
    where: {
      title: {
        equals: DEMO_PROJECT.title,
      },
    },
    depth: 0,
    limit: 1,
  })

  const projectData = {
    title: DEMO_PROJECT.title,
    projectType: projectType.id,
    status: 'active' as const,
    isPublic: false,
    viewers: [viewer.id],
    editors: [editor.id],
    managers: [manager.id],
  }

  const existingDoc = existingProject.docs[0]

  let projectID: number

  if (existingDoc) {
    const updated = await payload.update({
      collection: 'projects',
      id: existingDoc.id,
      data: projectData,
      depth: 0,
    })

    console.log('Updated demo project memberships:', updated.id)
    projectID = updated.id
  } else {
    const created = await payload.create({
      collection: 'projects',
      data: projectData,
      depth: 0,
    })

    console.log('Created demo project memberships:', created.id)
    projectID = created.id
  }

  const course = await ensureCourse(payload, projectID)
  const group = await ensureGroup(payload, projectID)

  console.log('Ensured demo project group:', group.id)
  console.log('Ensured demo project course:', course.id)
}
