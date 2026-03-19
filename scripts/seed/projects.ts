import type { Payload } from 'payload'

const DEMO_PASSWORD = 'test'
const DEMO_PROJECT_TITLE = 'RBAC Demo Project'
const DEMO_PROJECT_TYPE = 'Alinea Portal'

const DEMO_USERS = {
  viewer: 'project-viewer@payloadcms.local',
  editor: 'project-editor@payloadcms.local',
  manager: 'project-manager@payloadcms.local',
} as const

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
    return existing.docs[0]
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

async function ensureProjectType(payload: Payload) {
  const existing = await payload.find({
    collection: 'project-types',
    where: {
      title: {
        equals: DEMO_PROJECT_TYPE,
      },
    },
    depth: 0,
    limit: 1,
  })

  return existing.docs[0] ?? null
}

export async function seedProjects(payload: Payload) {
  const projectType = await ensureProjectType(payload)

  if (!projectType) {
    throw new Error(`Missing required project type: ${DEMO_PROJECT_TYPE}`)
  }

  const viewer = await ensureUser(payload, DEMO_USERS.viewer)
  const editor = await ensureUser(payload, DEMO_USERS.editor)
  const manager = await ensureUser(payload, DEMO_USERS.manager)

  const existingProject = await payload.find({
    collection: 'projects',
    where: {
      title: {
        equals: DEMO_PROJECT_TITLE,
      },
    },
    depth: 0,
    limit: 1,
  })

  const projectData = {
    title: DEMO_PROJECT_TITLE,
    projectType: projectType.id,
    status: 'active' as const,
    isPublic: false,
    viewers: [viewer.id],
    editors: [editor.id],
    managers: [manager.id],
  }

  const existingDoc = existingProject.docs[0]

  if (existingDoc) {
    const updated = await payload.update({
      collection: 'projects',
      id: existingDoc.id,
      data: projectData,
      depth: 0,
    })

    console.log('Updated demo project memberships:', updated.id)
    return
  }

  const created = await payload.create({
    collection: 'projects',
    data: projectData,
    depth: 0,
  })

  console.log('Created demo project memberships:', created.id)
}
